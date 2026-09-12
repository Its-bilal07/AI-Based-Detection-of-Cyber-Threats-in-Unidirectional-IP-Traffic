"""
Feature Preprocessing and Transformation Layer
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
"""

import pandas as pd
from typing import Dict, Any, List, Union
from backend.schemas import FlowFeatures, PredictionRequest

FEATURE_COLUMNS = [
    'dur', 'proto', 'service', 'state', 'spkts', 'sbytes',
    'rate', 'sttl', 'sload', 'sloss', 'sinpkt', 'sjit',
    'swin', 'smean', 'is_sm_ips_ports'
]

NUMERICAL_COLUMNS = [
    'dur', 'spkts', 'sbytes', 'rate', 'sttl', 'sload',
    'sloss', 'sinpkt', 'sjit', 'swin', 'smean', 'is_sm_ips_ports'
]

CATEGORICAL_COLUMNS = ['proto', 'service', 'state']

def to_feature_dict(features: Union[FlowFeatures, Dict[str, Any]]) -> Dict[str, Any]:
    if isinstance(features, FlowFeatures):
        raw_dict = features.model_dump()
    elif isinstance(features, dict):
        raw_dict = features.copy()
    else:
        raise ValueError("Invalid features format")

    cleaned = {}
    for col in FEATURE_COLUMNS:
        val = raw_dict.get(col, 0)
        if col in CATEGORICAL_COLUMNS:
            cleaned[col] = str(val if val is not None and not pd.isna(val) else "-")
        elif col in ['spkts', 'sbytes', 'sttl', 'sloss', 'swin', 'smean', 'is_sm_ips_ports']:
            try:
                cleaned[col] = int(val)
            except (ValueError, TypeError):
                cleaned[col] = 0
        else:
            try:
                cleaned[col] = float(val)
            except (ValueError, TypeError):
                cleaned[col] = 0.0

    return cleaned

def requests_to_dataframe(requests: List[PredictionRequest]) -> pd.DataFrame:
    rows = [to_feature_dict(req.features) for req in requests]
    return pd.DataFrame(rows, columns=FEATURE_COLUMNS)

def single_request_to_dataframe(req: PredictionRequest) -> pd.DataFrame:
    row = to_feature_dict(req.features)
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
