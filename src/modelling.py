import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os

def load_data():
    """Load processed data"""
    try:
        data = pd.read_csv('src/processed_data.csv')
        return data
    except FileNotFoundError:
        print("Data tidak ditemukan")
        return None

def train_model(data):
    """Train a simple classification model"""
    # Assuming the last column is the target
    X = data.iloc[:, :-1]
    y = data.iloc[:, -1]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Classification report and confusion matrix
    class_report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred)
    
    return {
        'model': model,
        'accuracy': accuracy,
        'predictions': y_pred.tolist(),
        'actual': y_test.tolist(),
        'classification_report': class_report,
        'confusion_matrix': conf_matrix.tolist()
    }

def model_to_json():
    """Generate JSON output from modeling results"""
    # Load data
    data = load_data()
    if data is None:
        return json.dumps({"error": "Data tidak dapat dimuat"})
    
    # Train model
    results = train_model(data)
    
    # Create JSON output
    json_output = {
        "model_info": {
            "algorithm": "Random Forest",
            "accuracy": float(results['accuracy']),
            "data_shape": data.shape,
            "features_count": len(data.columns) - 1
        },
        "predictions": {
            "predicted_values": results['predictions'][:10],  # First 10 predictions
            "actual_values": results['actual'][:10],           # First 10 actual values
            "total_predictions": len(results['predictions'])
        },
        "evaluation": {
            "accuracy_score": float(results['accuracy']),
            "model_type": "classification",
            "classification_report": results['classification_report'],
            "confusion_matrix": results['confusion_matrix']
        }
    }
    
    return json.dumps(json_output, indent=2, ensure_ascii=False)

# Main execution
if __name__ == "__main__":
    json_result = model_to_json()
    print(json_result)
    
    # Create artifacts folder if it doesn't exist
    os.makedirs('artifacts', exist_ok=True)
    
    # Save to artifacts folder
    with open('artifacts/model_results.json', 'w', encoding='utf-8') as f:
        f.write(json_result)