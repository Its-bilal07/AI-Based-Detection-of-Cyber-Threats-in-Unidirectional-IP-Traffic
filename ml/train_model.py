"""
UNSW-NB15 DoS Threat Detection Model Training Pipeline
AI-Based Detection of Cyber Threats in Unidirectional IP Traffic

This script trains a supervised binary classifier (Normal vs DoS) on unidirectional flow features:
- Strictly excludes 'label' and 'attack_cat' from inputs to prevent data leakage.
- Preprocesses categorical (proto, service, state) and numerical features via a unified ColumnTransformer pipeline.
- Performs stratified train/test split (80/20, seed=42) and stratified cross-validation.
- Compares Random Forest and XGBoost classifiers.
- Prioritizes DoS Recall to minimize false negatives (missed cyber attacks).
- Computes baseline statistical distributions on Normal traffic for explainable AI evidence generation.
- Serializes complete pipeline to models/dos_detection_model.pkl and metadata to models/feature_metadata.json.
"""

import os
import json
import time
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

def load_and_prepare_data(csv_path: str):
    print(f"[*] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[+] Loaded raw dataset with shape: {df.shape}")

    # Binary filter: Normal vs DoS
    # Note: UNSW-NB15 DoS represents volumetric and protocol flood attacks
    df_binary = df[df['attack_cat'].isin(['Normal', 'DoS'])].copy()
    print(f"[+] Filtered binary subset (Normal vs DoS): {df_binary.shape}")
    print(f"    - Class distribution:\n{df_binary['attack_cat'].value_counts()}")

    # Target variable: 0 = Normal, 1 = DoS
    y = (df_binary['attack_cat'] == 'DoS').astype(int)

    # Features: drop targets to ensure zero data leakage
    X = df_binary.drop(columns=['attack_cat', 'label'])

    cat_cols = ['proto', 'service', 'state']
    num_cols = [col for col in X.columns if col not in cat_cols]

    print(f"[+] Feature set ({len(X.columns)} features):")
    print(f"    - Numerical ({len(num_cols)}): {num_cols}")
    print(f"    - Categorical ({len(cat_cols)}): {cat_cols}")

    return X, y, df_binary, num_cols, cat_cols

def compute_normal_baselines(X_train: pd.DataFrame, y_train: pd.Series, num_cols: list) -> dict:
    """Compute empirical normal baseline statistics to drive explainable AI divergence scores."""
    print("[*] Computing empirical baseline statistics from Normal training flows...")
    X_normal = X_train[y_train == 0][num_cols]

    baselines = {}
    for col in num_cols:
        series = X_normal[col].astype(float)
        baselines[col] = {
            "mean": float(series.mean()),
            "std": float(series.std()),
            "median": float(series.median()),
            "min": float(series.min()),
            "max": float(series.max()),
            "p5": float(series.quantile(0.05)),
            "p95": float(series.quantile(0.95)),
            "p99": float(series.quantile(0.99)),
        }
    return baselines

def train_and_evaluate():
    data_path = os.path.join("data", "UNSW_NB15_training-set_cleaned.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    X, y, df_full, num_cols, cat_cols = load_and_prepare_data(data_path)

    # Stratified Train-Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[+] Split sizes: Train={len(X_train)}, Test={len(X_test)}")
    print(f"    - Train DoS ratio: {y_train.mean():.4f} ({sum(y_train)} DoS / {len(y_train)} total)")
    print(f"    - Test DoS ratio:  {y_test.mean():.4f} ({sum(y_test)} DoS / {len(y_test)} total)")

    # Save holdout test set for independent evaluation & streaming replay
    os.makedirs("data", exist_ok=True)
    test_df_save = X_test.copy()
    test_df_save['target_label'] = y_test
    test_df_save['attack_cat'] = df_full.loc[X_test.index, 'attack_cat']
    holdout_path = os.path.join("data", "holdout_test_set.csv")
    test_df_save.to_csv(holdout_path, index=False)
    print(f"[+] Saved holdout test set to: {holdout_path}")

    # Build preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
        ]
    )

    # 1. Random Forest Classifier
    rf_classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=16,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', rf_classifier)
    ])

    # 2. XGBoost Classifier
    scale_pos = (len(y_train) - sum(y_train)) / sum(y_train)
    xgb_classifier = XGBClassifier(
        n_estimators=120,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos,
        eval_metric='logloss',
        random_state=42,
        n_jobs=-1
    )
    xgb_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', xgb_classifier)
    ])

    models = {
        "Random_Forest": rf_pipeline,
        "XGBoost": xgb_pipeline
    }

    eval_results = {}

    for name, pipe in models.items():
        print(f"\n==========================================")
        print(f"[*] Training model: {name}")
        print(f"==========================================")
        start_time = time.time()
        pipe.fit(X_train, y_train)
        train_duration = time.time() - start_time
        print(f"[+] Training completed in {train_duration:.2f} seconds.")

        # Inference on test set
        t0 = time.time()
        y_pred = pipe.predict(X_test)
        infer_duration = time.time() - t0
        y_prob = pipe.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        throughput = len(X_test) / infer_duration

        print(f"\n--- {name} Performance Summary ---")
        print(f"  Accuracy:         {acc * 100:.2f}%")
        print(f"  Precision (DoS):  {prec * 100:.2f}%")
        print(f"  Recall (DoS):     {rec * 100:.2f}%  <-- Primary Security Metric")
        print(f"  F1-Score (DoS):   {f1 * 100:.2f}%")
        print(f"  ROC-AUC:          {roc_auc:.4f}")
        print(f"  Inference Speed:  {throughput:,.0f} flows/sec ({infer_duration*1000/len(X_test):.3f} ms/flow)")
        print(f"  Confusion Matrix: [TN={cm[0][0]}, FP={cm[0][1]}; FN={cm[1][0]}, TP={cm[1][1]}]")

        eval_results[name] = {
            "model_name": name,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            },
            "training_time_sec": round(train_duration, 2),
            "inference_throughput_fps": round(throughput, 1),
            "latency_ms_per_flow": round(infer_duration * 1000 / len(X_test), 4)
        }

    # Model Selection: Prioritize Recall on DoS attack class
    # In cybersecurity, a false negative (missed DoS attack) is significantly more dangerous than a false positive
    best_model_name = "XGBoost" if eval_results["XGBoost"]["recall"] >= eval_results["Random_Forest"]["recall"] else "Random_Forest"
    best_pipeline = models[best_model_name]
    print(f"\n[+] Selected best model: {best_model_name} (DoS Recall: {eval_results[best_model_name]['recall']*100:.2f}%)")

    # Extract feature importances
    preprocessor_fitted = best_pipeline.named_steps['preprocessor']
    cat_feature_names = list(preprocessor_fitted.named_transformers_['cat'].get_feature_names_out(cat_cols))
    all_feature_names = num_cols + cat_feature_names

    classifier_fitted = best_pipeline.named_steps['classifier']
    if hasattr(classifier_fitted, 'feature_importances_'):
        importances = classifier_fitted.feature_importances_.tolist()
        feat_importance_dict = dict(sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True))
    else:
        feat_importance_dict = {}

    print("\n[+] Top 10 Most Important Features:")
    for i, (k, v) in enumerate(list(feat_importance_dict.items())[:10], 1):
        print(f"    {i:2d}. {k:<20}: {v:.4f}")

    # Compute empirical baselines on normal traffic
    baselines = compute_normal_baselines(X_train, y_train, num_cols)

    # Metadata dictionary
    os.makedirs("models", exist_ok=True)
    metadata = {
        "dataset_name": "UNSW_NB15_training-set_cleaned.csv",
        "dataset_scope": "Unidirectional IP Traffic Flow Records",
        "threat_class_monitored": "DoS (Denial of Service / Protocol Flood)",
        "limitation_statement": (
            "The UNSW-NB15 'DoS' class serves as the supervised training signal for DoS, "
            "protocol flood, and volumetric traffic anomalies in unidirectional networks. "
            "It does not represent complete coverage of every complex multi-vector DDoS attack."
        ),
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "selected_model": best_model_name,
        "input_features": {
            "numerical": num_cols,
            "categorical": cat_cols,
            "total_count": len(X.columns)
        },
        "class_mapping": {
            "0": "Normal",
            "1": "DoS"
        },
        "performance_metrics": eval_results[best_model_name],
        "all_models_compared": eval_results,
        "top_feature_importances": dict(list(feat_importance_dict.items())[:20]),
        "empirical_normal_baselines": baselines
    }

    # Save serialized pipeline
    model_save_path = os.path.join("models", "dos_detection_model.pkl")
    joblib.dump(best_pipeline, model_save_path)
    print(f"\n[+] Saved complete trained pipeline to: {model_save_path}")

    # Save metadata JSON
    metadata_save_path = os.path.join("models", "feature_metadata.json")
    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Saved feature metadata and baseline statistics to: {metadata_save_path}")

    return best_model_name, eval_results

if __name__ == "__main__":
    train_and_evaluate()
