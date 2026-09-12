"""
Replay-based Near-Real-Time Stream Generator
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic

Loads real UNSW-NB15 flow records and streams them incrementally to simulate
passive optical diode / unidirectional tap network ingestion.
"""

import os
import time
import random
from typing import Generator, Dict, Any, Optional
import pandas as pd

class FlowReplayStream:
    def __init__(self, csv_path: Optional[str] = None):
        if csv_path is None:
            # Prefer holdout test set to ensure unseen inference, fallback to main dataset
            holdout_path = os.path.join("data", "holdout_test_set.csv")
            main_path = os.path.join("data", "UNSW_NB15_training-set_cleaned.csv")
            csv_path = holdout_path if os.path.exists(holdout_path) else main_path

        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Replay dataset not found: {csv_path}")

        print(f"[*] Initializing FlowReplayStream with: {csv_path}")
        df = pd.read_csv(csv_path)

        if 'attack_cat' in df.columns:
            self.normal_flows = df[df['attack_cat'] == 'Normal'].copy()
            self.dos_flows = df[df['attack_cat'] == 'DoS'].copy()
        elif 'target_label' in df.columns:
            self.normal_flows = df[df['target_label'] == 0].copy()
            self.dos_flows = df[df['target_label'] == 1].copy()
        else:
            self.normal_flows = df
            self.dos_flows = df

        self.df_all = df
        self.flow_sequence = 100000
        print(f"[+] Replay pool initialized: {len(self.normal_flows)} Normal flows, {len(self.dos_flows)} DoS flows.")

    def get_flow_record(self, scenario: str = "Mixed Attack") -> Dict[str, Any]:
        """
        Picks a real flow record according to the active scenario and wraps it
        with passive network telemetry (5-tuple, timestamp, flow ID).
        """
        self.flow_sequence += 1
        flow_id = f"F-{self.flow_sequence}"

        # Scenario routing
        if scenario == "Normal Traffic":
            sample_row = self.normal_flows.sample(n=1).iloc[0]
            is_dos_target = False
        elif scenario in ["DDoS Attack", "DDoS_SYN_flood"]:
            sample_row = self.dos_flows.sample(n=1).iloc[0]
            is_dos_target = True
        else: # "Mixed Attack" or default
            # 85% normal traffic, 15% DoS bursts
            if random.random() < 0.20 and len(self.dos_flows) > 0:
                sample_row = self.dos_flows.sample(n=1).iloc[0]
                is_dos_target = True
            else:
                sample_row = self.normal_flows.sample(n=1).iloc[0]
                is_dos_target = False

        # Extract unidirectional ML input features
        feature_keys = [
            'dur', 'proto', 'service', 'state', 'spkts', 'sbytes',
            'rate', 'sttl', 'sload', 'sloss', 'sinpkt', 'sjit',
            'swin', 'smean', 'is_sm_ips_ports'
        ]

        features = {}
        for k in feature_keys:
            val = sample_row[k]
            if pd.isna(val):
                val = 0
            if k in ['proto', 'service', 'state']:
                features[k] = str(val)
            elif k in ['spkts', 'sbytes', 'sttl', 'sloss', 'swin', 'smean', 'is_sm_ips_ports']:
                features[k] = int(val)
            else:
                features[k] = float(val)

        # Realistic 5-tuple context matching unidirectional diode ingress
        proto_str = str(features.get('proto', 'tcp')).upper()
        if 'UDP' in proto_str:
            proto = 'UDP'
        elif 'ICMP' in proto_str:
            proto = 'ICMP'
        else:
            proto = 'TCP'

        if is_dos_target:
            src_ip = f"198.51.{random.randint(10, 200)}.{random.randint(2, 254)}"
            dst_ip = "172.16.5.22"
            src_port = random.randint(1024, 65535)
            dst_port = 443 if random.random() > 0.3 else 80
        else:
            src_ip = f"10.0.{random.randint(1, 15)}.{random.randint(2, 250)}"
            dst_ip = f"142.250.{random.randint(1, 254)}.{random.randint(1, 254)}"
            src_port = random.randint(30000, 65000)
            dst_port = 443 if features.get('service') == 'http' else 80 if features.get('service') == 'http' else 53 if features.get('service') == 'dns' else 443

        record = {
            "flow_id": flow_id,
            "timestamp": pd.Timestamp.now('UTC').isoformat(),
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": proto,
            "features": features,
            "ground_truth_label": 1 if is_dos_target else 0
        }
        return record

    def stream_flows(self, count: int = 100, delay_sec: float = 0.05, scenario: str = "Mixed Attack") -> Generator[Dict[str, Any], None, None]:
        for _ in range(count):
            yield self.get_flow_record(scenario=scenario)
            if delay_sec > 0:
                time.sleep(delay_sec)

if __name__ == "__main__":
    replay = FlowReplayStream()
    print("\n[*] Sampling 3 replayed flows:")
    for f in replay.stream_flows(count=3, delay_sec=0.01):
        print(f"Flow: {f['flow_id']} | GroundTruth={f['ground_truth_label']} | Proto={f['protocol']} | DstPort={f['dst_port']}")
        print(f"  Features: {f['features']}")
