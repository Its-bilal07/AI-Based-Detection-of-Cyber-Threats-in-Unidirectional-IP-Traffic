"""
Evaluation and Benchmarking Script for UNSW-NB15 DoS Detection Model
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

def evaluate():
    model_path = os.path.join("models", "dos_detection_model.pkl")
    meta_path = os.path.join("models", "feature_metadata.json")
    test_path = os.path.join("data", "holdout_test_set.csv")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run ml/train_model.py first.")

    print(f"[*] Loading model from: {model_path}")
    pipeline = joblib.load(model_path)

    print(f"[*] Loading metadata from: {meta_path}")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"[*] Loading holdout test set from: {test_path}")
    df_test = pd.read_csv(test_path)
    y_test = df_test['target_label']
    X_test = df_test.drop(columns=['target_label', 'attack_cat'])

    print(f"[+] Evaluating on {len(X_test)} holdout test flows...")
    t0 = time.time()
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]
    elapsed = time.time() - t0

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "="*55)
    print(f"  EVALUATION RESULTS: {meta['selected_model']}")
    print("="*55)
    print(f"  Dataset:             {meta['dataset_name']} ({len(X_test)} test samples)")
    print(f"  Overall Accuracy:    {acc * 100:.2f}%")
    print(f"  DoS Precision:       {prec * 100:.2f}%")
    print(f"  DoS Recall:          {rec * 100:.2f}%  (Attacks successfully caught)")
    print(f"  F1-Score:            {f1 * 100:.2f}%")
    print(f"  ROC-AUC Score:       {roc_auc:.4f}")
    print("-"*55)
    print(f"  Confusion Matrix:")
    print(f"    True Negatives  (Normal -> Normal): {cm[0][0]:>5}")
    print(f"    False Positives (Normal -> DoS):    {cm[0][1]:>5}")
    print(f"    False Negatives (DoS -> Normal):    {cm[1][0]:>5}  (Missed attacks)")
    print(f"    True Positives  (DoS -> DoS):       {cm[1][1]:>5}  (Caught attacks)")
    print("="*55)

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal (0)", "DoS (1)"], digits=4))

    # Single-flow latency benchmark
    print("\n[*] Latency & Throughput Benchmark:")
    latencies = []
    # Test 500 individual single flow inferences
    sample_records = X_test.head(500)
    for _, row in sample_records.iterrows():
        single_df = pd.DataFrame([row])
        st = time.perf_counter()
        _ = pipeline.predict(single_df)
        latencies.append((time.perf_counter() - st) * 1000)

    avg_latency = np.mean(latencies)
    p95_latency = np.percentile(latencies, 95)
    p99_latency = np.percentile(latencies, 99)

    print(f"  Single-flow Mean Latency: {avg_latency:.3f} ms")
    print(f"  Single-flow P95 Latency:  {p95_latency:.3f} ms")
    print(f"  Single-flow P99 Latency:  {p99_latency:.3f} ms")

    # Batch throughput benchmark
    batch_sizes = [10, 100, 1000, len(X_test)]
    print("\n  Batch Throughput:")
    for b in batch_sizes:
        batch = X_test.head(b)
        st = time.perf_counter()
        _ = pipeline.predict(batch)
        b_time = time.perf_counter() - st
        b_fps = b / b_time
        print(f"    Batch Size {b:>5}: {b_fps:>10,.1f} flows/sec ({b_time*1000:>6.2f} ms total)")

if __name__ == "__main__":
    evaluate()
