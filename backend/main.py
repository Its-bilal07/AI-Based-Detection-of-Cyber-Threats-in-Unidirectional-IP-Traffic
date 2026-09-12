"""
FastAPI Backend Application for AI-Based Threat Detection
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
"""

import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import json
import asyncio
import time
from typing import Optional, Generator
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from backend.schemas import (
    PredictionRequest,
    BatchPredictionRequest,
    PredictionResponse,
    FlowFeatures
)
from backend.inference import inference_engine
from ml.replay import FlowReplayStream

app = FastAPI(
    title="AI Cyber Threat Detection API",
    description="Passive AI/ML-based detection of cyber threats in unidirectional IP traffic (UNSW-NB15 DoS/Volumetric Detector)",
    version="2.4.0"
)

# Enable CORS for Vite frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replay stream singleton
replay_stream: Optional[FlowReplayStream] = None

def get_replay_stream() -> FlowReplayStream:
    global replay_stream
    if replay_stream is None:
        replay_stream = FlowReplayStream()
    return replay_stream

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "AI-Based Cyber Threat Detection (Unidirectional Traffic)",
        "ingest_mode": "READ-ONLY (Optical Diode Emulation)",
        "model_loaded": inference_engine.model_name,
        "timestamp": time.time()
    }

@app.get("/models/metadata")
def get_model_metadata():
    """Returns training parameters, class distributions, and performance metrics."""
    return inference_engine.metadata

@app.post("/predict", response_model=PredictionResponse)
def predict_flow(request: PredictionRequest):
    """
    Real-time ML inference on a single unidirectional flow record.
    Predicts Normal vs DoS attack, calculates confidence and explainable feature evidence.
    """
    try:
        response = inference_engine.predict_single(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/predict/batch")
def predict_batch_flows(batch_req: BatchPredictionRequest):
    """
    High-throughput batch classification for multiple flow records.
    """
    try:
        t0 = time.perf_counter()
        results = inference_engine.predict_batch(batch_req.flows)
        elapsed_sec = time.perf_counter() - t0
        throughput = len(batch_req.flows) / max(elapsed_sec, 1e-6)

        return {
            "count": len(results),
            "elapsed_seconds": round(elapsed_sec, 4),
            "throughput_fps": round(throughput, 1),
            "threats_detected": sum(1 for r in results if r.is_threat),
            "predictions": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")

@app.get("/replay/stream")
async def stream_replay(
    scenario: str = Query("Mixed Attack", description="Traffic scenario: 'Normal Traffic', 'DDoS Attack', or 'Mixed Attack'"),
    interval_ms: int = Query(600, description="Tick interval between flow emissions in milliseconds")
):
    """
    Server-Sent Events (SSE) stream simulating passive unidirectional traffic ingress.
    Replays real UNSW-NB15 flow records, passes each through the ML pipeline,
    and yields near-real-time metrics, ML predictions, and alerts.
    """
    stream = get_replay_stream()

    async def event_generator():
        delay = max(0.1, interval_ms / 1000.0)
        while True:
            try:
                # Get raw flow from UNSW-NB15 replay pool
                raw_flow = stream.get_flow_record(scenario=scenario)
                features_obj = FlowFeatures(**raw_flow["features"])

                pred_req = PredictionRequest(
                    flow_id=raw_flow["flow_id"],
                    timestamp=raw_flow["timestamp"],
                    src_ip=raw_flow["src_ip"],
                    dst_ip=raw_flow["dst_ip"],
                    src_port=raw_flow["src_port"],
                    dst_port=raw_flow["dst_port"],
                    protocol=raw_flow["protocol"],
                    features=features_obj
                )

                # Real ML Model Inference
                pred_res = inference_engine.predict_single(pred_req)

                # Construct dynamic traffic metrics snapshot
                is_dos = pred_res.is_threat
                base_flows = 14500 if is_dos else 1250
                in_bytes = (pred_req.features.sload / (8 * 1e6)) if pred_req.features.sload > 0 else (120.5 if is_dos else 26.4)
                out_bytes = 8.2 if is_dos else 14.8

                payload = {
                    "flow_id": raw_flow["flow_id"],
                    "timestamp": raw_flow["timestamp"],
                    "metrics": {
                        "timestamp": raw_flow["timestamp"],
                        "flows_per_sec": base_flows,
                        "inbound_bytes_mbps": round(float(in_bytes), 1),
                        "outbound_bytes_mbps": round(float(out_bytes), 1),
                        "detection_rate_per_min": 24 if is_dos else 0.5
                    },
                    "totalFlowsIncrement": int(base_flows / 2),
                    "prediction": pred_res.model_dump(),
                    "is_alert": is_dos
                }

                yield f"data: {json.dumps(payload)}\n\n"
                await asyncio.sleep(delay)
            except asyncio.CancelledError:
                break
            except Exception as e:
                err_payload = {"error": str(e)}
                yield f"data: {json.dumps(err_payload)}\n\n"
                await asyncio.sleep(1.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
