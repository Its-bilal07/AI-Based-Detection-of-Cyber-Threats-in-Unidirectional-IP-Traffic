"""
Model Inference Engine
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from backend.schemas import PredictionRequest, PredictionResponse
from backend.feature_preprocessing import single_request_to_dataframe, requests_to_dataframe, to_feature_dict
from backend.alert_engine import build_alert_evidence, determine_severity

class InferenceEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InferenceEngine, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        model_path = os.path.join("models", "dos_detection_model.pkl")
        meta_path = os.path.join("models", "feature_metadata.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}. Run ml/train_model.py first.")

        print(f"[*] Loading serialized model from {model_path}...")
        self.pipeline = joblib.load(model_path)

        print(f"[*] Loading metadata from {meta_path}...")
        with open(meta_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.baselines = self.metadata.get("empirical_normal_baselines", {})
        self.model_name = self.metadata.get("selected_model", "XGBoost")
        print(f"[+] Model loaded successfully: {self.model_name}")

    def predict_single(self, req: PredictionRequest) -> PredictionResponse:
        t0 = time.perf_counter()
        df = single_request_to_dataframe(req)

        # Run model inference
        y_pred = int(self.pipeline.predict(df)[0])
        y_prob = float(self.pipeline.predict_proba(df)[0][1])

        infer_time_ms = round((time.perf_counter() - t0) * 1000, 3)

        is_threat = (y_pred == 1)
        # Probability for the predicted class
        confidence = round(y_prob if is_threat else (1.0 - y_prob), 4)

        features_dict = to_feature_dict(req.features)
        severity = determine_severity(is_threat, confidence, features_dict)
        evidence = build_alert_evidence(features_dict, self.baselines, is_threat, confidence)

        threat_class = "DDoS_SYN_flood" if is_threat else "Normal"
        prediction_label = "DoS" if is_threat else "Normal"

        flow_id = req.flow_id or f"F-{int(time.time()*1000)%1000000}"
        timestamp = req.timestamp or pd.Timestamp.now('UTC').isoformat()

        model_decision = (
            f"{self.model_name} Unidirectional Flow Classifier flagged anomalous volumetric/protocol signature"
            if is_threat else
            f"{self.model_name} Verified normal baseline packet profile"
        )

        detection_reason = (
            "Abnormal packet transmission rate, high source load, and truncated connection state matching DoS flood pattern"
            if is_threat else
            "Standard packet sequence and transfer volume consistent with benign network traffic"
        )

        return PredictionResponse(
            prediction=prediction_label,
            is_threat=is_threat,
            confidence=confidence,
            severity=severity,
            threat_class=threat_class,
            evidence=evidence,
            id=f"ALT-{int(time.time()*1000)}-{flow_id}",
            flow_id=flow_id,
            timestamp=timestamp,
            src_ip=req.src_ip or "10.0.0.1",
            dst_ip=req.dst_ip or "172.16.5.22",
            src_port=req.src_port or 44321,
            dst_port=req.dst_port or 443,
            protocol=req.protocol or "TCP",
            detection_latency_ms=infer_time_ms,
            model_decision=model_decision,
            detection_reason=detection_reason
        )

    def predict_batch(self, requests: List[PredictionRequest]) -> List[PredictionResponse]:
        t0 = time.perf_counter()
        df = requests_to_dataframe(requests)

        preds = self.pipeline.predict(df)
        probs = self.pipeline.predict_proba(df)[:, 1]

        batch_time_ms = round((time.perf_counter() - t0) * 1000, 3)
        per_flow_latency = round(batch_time_ms / len(requests), 3)

        results: List[PredictionResponse] = []
        for i, req in enumerate(requests):
            y_pred = int(preds[i])
            y_prob = float(probs[i])
            is_threat = (y_pred == 1)
            confidence = round(y_prob if is_threat else (1.0 - y_prob), 4)

            features_dict = to_feature_dict(req.features)
            severity = determine_severity(is_threat, confidence, features_dict)
            evidence = build_alert_evidence(features_dict, self.baselines, is_threat, confidence)

            flow_id = req.flow_id or f"F-{i+1}"
            threat_class = "DDoS_SYN_flood" if is_threat else "Normal"
            prediction_label = "DoS" if is_threat else "Normal"

            results.append(
                PredictionResponse(
                    prediction=prediction_label,
                    is_threat=is_threat,
                    confidence=confidence,
                    severity=severity,
                    threat_class=threat_class,
                    evidence=evidence,
                    id=f"ALT-{int(time.time()*1000)}-{flow_id}",
                    flow_id=flow_id,
                    timestamp=req.timestamp or pd.Timestamp.now('UTC').isoformat(),
                    src_ip=req.src_ip or "10.0.0.1",
                    dst_ip=req.dst_ip or "172.16.5.22",
                    src_port=req.src_port or 44321,
                    dst_port=req.dst_port or 443,
                    protocol=req.protocol or "TCP",
                    detection_latency_ms=per_flow_latency,
                    model_decision=f"{self.model_name} Batch Ingress Inference",
                    detection_reason="High-throughput batch classification"
                )
            )

        return results

# Singleton accessor
inference_engine = InferenceEngine()
