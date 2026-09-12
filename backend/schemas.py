"""
Pydantic Schemas for Threat Detection API
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class FlowFeatures(BaseModel):
    dur: float = Field(0.0, description="Flow duration in seconds")
    proto: str = Field("tcp", description="Transaction protocol (tcp, udp, unas, arp, etc.)")
    service: str = Field("-", description="Application service (http, dns, ftp, smtp, -, etc.)")
    state: str = Field("FIN", description="Flow state (FIN, INT, CON, REQ, etc.)")
    spkts: int = Field(1, description="Source-to-destination packet count")
    sbytes: int = Field(60, description="Source-to-destination byte count")
    rate: float = Field(0.0, description="Packets per second rate")
    sttl: int = Field(64, description="Source-to-destination time-to-live")
    sload: float = Field(0.0, description="Source bits per second")
    sloss: int = Field(0, description="Source packets dropped")
    sinpkt: float = Field(0.0, description="Source interpacket arrival time in ms")
    sjit: float = Field(0.0, description="Source jitter in ms")
    swin: int = Field(0, description="Source TCP window advertisement")
    smean: int = Field(60, description="Mean packet size in bytes transmitted by source")
    is_sm_ips_ports: int = Field(0, description="1 if source and destination IP and port are equal, else 0")

class PredictionRequest(BaseModel):
    flow_id: Optional[str] = Field(None, description="Unique flow identifier")
    timestamp: Optional[str] = Field(None, description="ISO 8601 timestamp")
    src_ip: Optional[str] = Field("10.0.0.1", description="Source IP address")
    dst_ip: Optional[str] = Field("172.16.5.22", description="Destination IP address")
    src_port: Optional[int] = Field(44321, description="Source port")
    dst_port: Optional[int] = Field(443, description="Destination port")
    protocol: Optional[str] = Field("TCP", description="Protocol family")
    features: FlowFeatures = Field(..., description="15 unidirectional flow features")

class BatchPredictionRequest(BaseModel):
    flows: List[PredictionRequest] = Field(..., description="List of flow records for batch inference")

class AnomalyFeature(BaseModel):
    name: str
    value: Union[str, int, float]
    strength: str = Field(..., description="NORMAL, LOW, MEDIUM, HIGH, VERY HIGH")
    score: float = Field(..., description="Normalized anomaly score between 0.0 and 1.0")
    baseline: str = Field(..., description="Empirical baseline from normal unidirectional traffic")

class AlertEvidence(BaseModel):
    summary: str
    top_features: Dict[str, Union[str, int, float]]
    feature_breakdown: List[AnomalyFeature]
    encrypted_metadata_only: Optional[bool] = False

class PredictionResponse(BaseModel):
    # Core fields explicitly required by specification
    prediction: str = Field(..., description="'DoS' or 'Normal'")
    is_threat: bool = Field(..., description="True if malicious attack flagged")
    confidence: float = Field(..., description="Empirical probability from trained ML model (0.0 - 1.0)")
    severity: str = Field(..., description="'critical', 'high', 'medium', or 'low'")
    threat_class: str = Field(..., description="Threat classification identifier ('DDoS_SYN_flood' or 'Normal')")
    evidence: AlertEvidence = Field(..., description="Explainable AI feature attribution and baseline divergence")

    # Enriched contextual fields consumed by dashboard & SOC pipeline
    id: Optional[str] = None
    flow_id: Optional[str] = None
    timestamp: Optional[str] = None
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    protocol: Optional[str] = None
    detection_latency_ms: Optional[float] = None
    model_decision: Optional[str] = None
    detection_reason: Optional[str] = None
