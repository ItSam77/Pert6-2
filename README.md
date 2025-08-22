# 🧠 ML Model Dashboard - Interactive Machine Learning Analytics Platform

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-API-red.svg)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange.svg)](https://scikit-learn.org/)

A modern, containerized web application for visualizing and analyzing machine learning model performance. This project provides an interactive dashboard to monitor classification model metrics, predictions, and performance analytics in real-time.

## 🎯 Project Overview

This is an **extended and enhanced version** of the original [Pert6 project](https://github.com/ItSam77/Pert6), featuring:

- **Interactive Web Dashboard** with real-time data visualization
- **RESTful API Backend** built with Flask
- **Machine Learning Pipeline** using Random Forest classification
- **Containerized Deployment** with Docker
- **Professional UI/UX** with modern design principles

### 🔍 What This Project Does

The application trains a **Random Forest classifier** on a processed dataset (45,000 samples with 13 features) and provides:

- **Model Performance Metrics** (92.91% accuracy)
- **Interactive Confusion Matrix** visualization
- **Precision, Recall, and F1-Score** breakdowns by class
- **Real-time Prediction Analysis**
- **Beautiful Charts and Graphs** using Chart.js

## 🏗️ Architecture

```
pert6-2/
├── 🐳 Docker Configuration
│   ├── Dockerfile              # Container blueprint
│   └── docker-compose.yml      # Service orchestration
│
├── 🧮 Machine Learning Pipeline
│   ├── src/
│   │   ├── modelling.py         # Random Forest training & evaluation
│   │   └── processed_data.csv   # Preprocessed dataset (45K samples)
│   └── artifacts/
│       └── model_results.json   # Serialized model metrics
│
├── 🌐 Backend API (Flask)
│   └── backend/
│       └── app.py              # RESTful API with CORS support
│
└── 📊 Frontend Dashboard
    └── dashboard/
        ├── index.html          # Modern responsive UI
        ├── script.js           # Interactive data visualization
        └── styles.css          # Professional styling
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Python 3.10+** (for local development)
- **Git** for cloning the repository

### 1. Clone the Repository

```bash
git clone https://github.com/ItSam77/Pert6.git
cd PERT6-2
```

### 2. Set Up Virtual Environment (Optional for Local Development)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/macOS  
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Build and Run with Docker

```bash
# Build and start the container
docker compose up --build

# For background execution
docker compose up -d --build
```

### 4. Access the Application

- **Dashboard**: [http://localhost:3000/dashboard/index.html](http://localhost:3000/dashboard/index.html)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 📡 API Endpoints

The Flask backend provides several RESTful endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and system status |
| `/api/model/info` | GET | Basic model information |
| `/api/model/predictions` | GET | Model predictions with accuracy flags |
| `/api/model/evaluation` | GET | Detailed evaluation metrics |
| `/api/model/metrics/summary` | GET | Dashboard-ready metric summary |
| `/api/model/all` | GET | Complete model data dump |


## 🔧 Development & Customization

### Local Development Setup

```bash
# Run the Flask API locally
cd backend
python app.py

# Serve the dashboard (separate terminal)
cd dashboard
python -m http.server 3000
```

### Model Retraining

To retrain the model with new data:

```bash
# Update your processed_data.csv in src/
# Then run the modeling script
python src/modelling.py

# Restart the Docker container to load new results
docker compose restart
```

### Frontend Customization

The dashboard is built with vanilla JavaScript and can be easily customized:

- **Styling**: Modify `dashboard/styles.css`
- **Functionality**: Update `dashboard/script.js`
- **Layout**: Edit `dashboard/index.html`

## 📊 Model Performance

Current model statistics:

- **Algorithm**: Random Forest (100 estimators)
- **Dataset**: 45,000 samples, 13 features
- **Overall Accuracy**: 92.91%
- **Class 0 Performance**: 93.87% precision, 97.22% recall
- **Class 1 Performance**: 88.98% precision, 77.91% recall

## 🐛 Troubleshooting

### Common Issues

1. **"API connection failed"**
   - Ensure Docker container is running: `docker ps`
   - Check if port 3000 is available
   - Verify API health: `curl http://localhost:3000/api/health`

2. **"Model results file not found"**
   - Run the modeling script: `python src/modelling.py`
   - Check if `artifacts/model_results.json` exists
   - Verify Docker volume mounting

3. **Container won't start**
   - Check Docker logs: `docker compose logs`
   - Ensure no port conflicts on 3000
   - Verify Docker and Docker Compose installation

### Development Debug Mode

Enable Flask debug mode for detailed error messages:

```bash
# In backend/app.py, the debug mode is already enabled
app.run(debug=True, host='0.0.0.0', port=5000)
```

