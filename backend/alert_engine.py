"""
Alert & Explainability Engine
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic

Generates explainable anomaly scores, feature attributions, and dynamic severity ratings
based strictly on empirical normal traffic baselines and trained model probability.
"""

from typing import Dict, Any, List, Tuple
from backend.schemas import AlertEvidence, AnomalyFeature

def format_bitrate(bps: float) -> str:
    if bps >= 1e9:
        return f"{bps / 1e9:.2f} Gbps"
    elif bps >= 1e6:
        return f"{bps / 1e6:.2f} Mbps"
    elif bps >= 1e3:
        return f"{bps / 1e3:.1f} Kbps"
    return f"{bps:.0f} bps"

def format_rate(rate: float) -> str:
    if rate >= 1e6:
        return f"{rate / 1e6:.2f}M pkts/s"
    elif rate >= 1e3:
        return f"{rate / 1e3:.1f}k pkts/s"
    return f"{rate:.0f} pkts/s"

def format_bytes(b: int) -> str:
    if b >= 1e6:
        return f"{b / 1e6:.2f} MB"
    elif b >= 1e3:
        return f"{b / 1e3:.1f} KB"
    return f"{b} bytes"

def compute_divergence(val: float, baseline: Dict[str, float]) -> Tuple[float, str]:
    """
    Computes a normalized divergence score (0.0 - 1.0) and human baseline description.
    """
    p95 = baseline.get("p95", 1.0)
    p5 = baseline.get("p5", 0.0)
    mean = baseline.get("mean", 0.0)
    std = max(baseline.get("std", 1.0), 1e-6)

    # Baseline text representation
    baseline_desc = f"< {p95:.1f}" if p95 > 1 else f"{p5:.2f} - {p95:.2f}"

    if val <= p95:
        # Within standard 95th percentile of normal traffic
        score = min(0.35, max(0.05, (val - p5) / (p95 - p5 + 1e-6) * 0.35))
    else:
        # Above 95th percentile: calculate z-score excess
        excess_z = (val - p95) / std
        score = min(0.99, 0.40 + 0.60 * (1.0 - (1.0 / (1.0 + excess_z * 0.5))))

    return round(float(score), 2), baseline_desc

def build_alert_evidence(
    features: Dict[str, Any],
    baselines: Dict[str, Dict[str, float]],
    is_threat: bool,
    confidence: float
) -> AlertEvidence:
    """
    Constructs explainable AI evidence breakdown matching the dashboard's schema.
    """
    breakdown: List[AnomalyFeature] = []
    top_features: Dict[str, Any] = {}

    # Key security attributes to analyze
    # 1. Source Bitrate (sload)
    sload_val = float(features.get("sload", 0.0))
    sload_base = baselines.get("sload", {"p95": 5.2e6, "mean": 1.5e6, "std": 3e6})
    sload_score, sload_base_text = compute_divergence(sload_val, sload_base)
    sload_str = format_bitrate(sload_val)
    top_features["Source Bitrate (sload)"] = sload_str
    breakdown.append(
        AnomalyFeature(
            name="Source Bitrate (sload)",
            value=sload_str,
            strength="VERY HIGH" if sload_score >= 0.85 else "HIGH" if sload_score >= 0.70 else "MEDIUM" if sload_score >= 0.40 else "NORMAL",
            score=sload_score if is_threat else min(sload_score, 0.25),
            baseline=f"< {format_bitrate(sload_base.get('p95', 5.2e6))}"
        )
    )

    # 2. Packet Transmission Rate (rate)
    rate_val = float(features.get("rate", 0.0))
    rate_base = baselines.get("rate", {"p95": 500.0, "mean": 120.0, "std": 400.0})
    rate_score, rate_base_text = compute_divergence(rate_val, rate_base)
    rate_str = format_rate(rate_val)
    top_features["Packet Rate (rate)"] = rate_str
    breakdown.append(
        AnomalyFeature(
            name="Packet Rate (rate)",
            value=rate_str,
            strength="VERY HIGH" if rate_score >= 0.85 else "HIGH" if rate_score >= 0.70 else "MEDIUM" if rate_score >= 0.40 else "NORMAL",
            score=rate_score if is_threat else min(rate_score, 0.20),
            baseline=f"< {format_rate(rate_base.get('p95', 500.0))}"
        )
    )

    # 3. Connection State (state)
    state_val = str(features.get("state", "FIN"))
    top_features["Connection State"] = state_val
    if state_val == "INT":
        # Interrupted / Unidirectional flood without 2-way completion
        state_score = 0.94 if is_threat else 0.40
        state_strength = "VERY HIGH" if is_threat else "MEDIUM"
        state_base = "FIN / CON (Normal Handshake)"
    elif state_val == "REQ":
        state_score = 0.75 if is_threat else 0.30
        state_strength = "HIGH" if is_threat else "LOW"
        state_base = "FIN / CON"
    else:
        state_score = 0.15
        state_strength = "NORMAL"
        state_base = "Standard State"

    breakdown.append(
        AnomalyFeature(
            name="Connection State (state)",
            value=f"State: {state_val}",
            strength=state_strength,
            score=state_score,
            baseline=state_base
        )
    )

    # 4. Source Time-To-Live (sttl)
    sttl_val = int(features.get("sttl", 64))
    top_features["Source TTL (sttl)"] = sttl_val
    # In UNSW-NB15, DoS attacks often have sttl = 254 (forged raw IP packets) vs normal sttl = 31 or 62
    if sttl_val >= 250:
        sttl_score = 0.91 if is_threat else 0.35
        sttl_strength = "HIGH"
    elif sttl_val in [62, 64, 31]:
        sttl_score = 0.10
        sttl_strength = "NORMAL"
    else:
        sttl_score = 0.50
        sttl_strength = "MEDIUM"

    breakdown.append(
        AnomalyFeature(
            name="Source TTL (sttl)",
            value=f"TTL {sttl_val}",
            strength=sttl_strength,
            score=sttl_score if is_threat else min(sttl_score, 0.20),
            baseline="31 - 64 (OS Default)"
        )
    )

    # 5. Packet Loss (sloss) / Packet Count (spkts)
    sloss_val = int(features.get("sloss", 0))
    spkts_val = int(features.get("spkts", 1))
    top_features["Packet Count (spkts)"] = spkts_val
    if sloss_val > 50:
        sloss_score = 0.88 if is_threat else 0.30
        sloss_str = "HIGH"
    elif sloss_val > 0:
        sloss_score = 0.60
        sloss_str = "MEDIUM"
    else:
        sloss_score = 0.10
        sloss_str = "NORMAL"

    breakdown.append(
        AnomalyFeature(
            name="Source Loss (sloss)",
            value=f"{sloss_val} pkts dropped",
            strength=sloss_str,
            score=sloss_score if is_threat else 0.10,
            baseline="0 pkts (Lossless ingress)"
        )
    )

    # Build concise human summary string
    if is_threat:
        summary_str = f"sload: {sload_str} | rate: {rate_str} | state: {state_val} | TTL: {sttl_val}"
    else:
        summary_str = f"Normal profile: {sload_str} | rate: {rate_str} | state: {state_val}"

    return AlertEvidence(
        summary=summary_str,
        top_features=top_features,
        feature_breakdown=breakdown,
        encrypted_metadata_only=False
    )

def determine_severity(is_threat: bool, confidence: float, features: Dict[str, Any]) -> str:
    """
    Derives standard SOC severity: 'critical', 'high', 'medium', 'low'
    """
    if not is_threat:
        return "low"

    rate_val = float(features.get("rate", 0.0))
    sload_val = float(features.get("sload", 0.0))

    # Massive volumetric spike or extremely high confidence -> critical
    if confidence >= 0.92 or rate_val > 10000 or sload_val > 50e6:
        return "critical"
    elif confidence >= 0.75:
        return "high"
    elif confidence >= 0.50:
        return "medium"
    return "low"
