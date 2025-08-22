from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to the artifacts directory
ARTIFACTS_PATH = Path(__file__).parent.parent / 'artifacts'
MODEL_RESULTS_FILE = ARTIFACTS_PATH / 'model_results.json'

def load_model_results():
    """Load model results from JSON file"""
    try:
        # Debug: Print the path being used
        print(f"Looking for model results at: {MODEL_RESULTS_FILE}")
        print(f"File exists: {MODEL_RESULTS_FILE.exists()}")
        print(f"Artifacts directory exists: {ARTIFACTS_PATH.exists()}")
        
        if not MODEL_RESULTS_FILE.exists():
            return {"error": f"Model results file not found at {MODEL_RESULTS_FILE}"}
            
        with open(MODEL_RESULTS_FILE, 'r') as f:
            data = json.load(f)
            print("Model results loaded successfully")
            return data
    except FileNotFoundError:
        return {"error": f"Model results file not found at {MODEL_RESULTS_FILE}"}
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON format: {str(e)}"}
    except Exception as e:
        return {"error": f"Error loading model results: {str(e)}"}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "ML Model API is running",
        "debug_info": {
            "current_directory": str(os.getcwd()),
            "backend_location": str(Path(__file__).parent),
            "artifacts_path": str(ARTIFACTS_PATH),
            "model_file_path": str(MODEL_RESULTS_FILE),
            "artifacts_exists": ARTIFACTS_PATH.exists(),
            "model_file_exists": MODEL_RESULTS_FILE.exists()
        }
    })

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get basic model information"""
    data = load_model_results()
    if "error" in data:
        return jsonify(data), 404
    
    return jsonify({
        "model_info": data.get("model_info", {}),
        "status": "success"
    })

@app.route('/api/model/predictions', methods=['GET'])
def get_predictions():
    """Get model predictions data"""
    data = load_model_results()
    if "error" in data:
        return jsonify(data), 404
    
    predictions = data.get("predictions", {})
    
    # Format predictions for frontend consumption
    formatted_predictions = []
    predicted_values = predictions.get("predicted_values", [])
    actual_values = predictions.get("actual_values", [])
    
    for i, (pred, actual) in enumerate(zip(predicted_values, actual_values)):
        formatted_predictions.append({
            "index": i + 1,
            "predicted": pred,
            "actual": actual,
            "correct": pred == actual
        })
    
    return jsonify({
        "predictions": formatted_predictions,
        "total_predictions": predictions.get("total_predictions", 0),
        "sample_size": len(formatted_predictions),
        "status": "success"
    })

@app.route('/api/model/evaluation', methods=['GET'])
def get_evaluation():
    """Get model evaluation metrics"""
    data = load_model_results()
    if "error" in data:
        return jsonify(data), 404
    
    evaluation = data.get("evaluation", {})
    
    return jsonify({
        "evaluation": evaluation,
        "status": "success"
    })

@app.route('/api/model/metrics/summary', methods=['GET'])
def get_metrics_summary():
    """Get a summary of key metrics for dashboard"""
    data = load_model_results()
    if "error" in data:
        return jsonify(data), 404
    
    model_info = data.get("model_info", {})
    evaluation = data.get("evaluation", {})
    predictions = data.get("predictions", {})
    
    # Calculate additional metrics
    classification_report = evaluation.get("classification_report", {})
    
    summary = {
        "algorithm": model_info.get("algorithm", "Unknown"),
        "accuracy": round(model_info.get("accuracy", 0) * 100, 2),
        "data_shape": model_info.get("data_shape", [0, 0]),
        "features_count": model_info.get("features_count", 0),
        "train_size": model_info.get("train_size", 0),
        "test_size": model_info.get("test_size", 0),
        "train_test_ratio": model_info.get("train_test_ratio", {"train": 0.8, "test": 0.2}),
        "total_predictions": predictions.get("total_predictions", 0),
        "precision": {
            "class_0": round(classification_report.get("0.0", {}).get("precision", 0) * 100, 2),
            "class_1": round(classification_report.get("1.0", {}).get("precision", 0) * 100, 2),
            "weighted_avg": round(classification_report.get("weighted avg", {}).get("precision", 0) * 100, 2)
        },
        "recall": {
            "class_0": round(classification_report.get("0.0", {}).get("recall", 0) * 100, 2),
            "class_1": round(classification_report.get("1.0", {}).get("recall", 0) * 100, 2),
            "weighted_avg": round(classification_report.get("weighted avg", {}).get("recall", 0) * 100, 2)
        },
        "f1_score": {
            "class_0": round(classification_report.get("0.0", {}).get("f1-score", 0) * 100, 2),
            "class_1": round(classification_report.get("1.0", {}).get("f1-score", 0) * 100, 2),
            "weighted_avg": round(classification_report.get("weighted avg", {}).get("f1-score", 0) * 100, 2)
        },
        "confusion_matrix": evaluation.get("confusion_matrix", [])
    }
    
    return jsonify({
        "summary": summary,
        "status": "success"
    })

@app.route('/api/model/all', methods=['GET'])
def get_all_data():
    """Get all model data in one request"""
    data = load_model_results()
    if "error" in data:
        return jsonify(data), 404
    
    return jsonify({
        "data": data,
        "status": "success"
    })

@app.route('/')
def serve_dashboard():
    """Serve the dashboard HTML"""
    return send_from_directory('../dashboard', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    return send_from_directory('../dashboard', filename)

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "status": "error"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "status": "error"
    }), 500

if __name__ == '__main__':
    print("Starting ML Model API Server...")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Backend file location: {Path(__file__).parent}")
    print(f"Artifacts path: {ARTIFACTS_PATH}")
    print(f"Model results file: {MODEL_RESULTS_FILE}")
    print(f"Artifacts directory exists: {ARTIFACTS_PATH.exists()}")
    print(f"Model results file exists: {MODEL_RESULTS_FILE.exists()}")
    print("\nAvailable endpoints:")
    print("  GET /api/health - Health check")
    print("  GET /api/model/info - Model information")
    print("  GET /api/model/predictions - Predictions data")
    print("  GET /api/model/evaluation - Evaluation metrics")
    print("  GET /api/model/metrics/summary - Metrics summary")
    print("  GET /api/model/all - All model data")
    print(f"\nServer starting at http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
