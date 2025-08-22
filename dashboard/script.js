// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const mainContent = document.getElementById('mainContent');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');

// Chart instances
let performanceChart = null;
let predictionChart = null;
let splitChart = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    loadDashboardData();
    
    // Event listeners
    refreshBtn.addEventListener('click', loadDashboardData);
    retryBtn.addEventListener('click', loadDashboardData);
});

// Main function to load all dashboard data
async function loadDashboardData() {
    showLoading();
    
    try {
        console.log('Fetching data from API...');
        console.log('API Base URL:', API_BASE_URL);
        
        // Test connection first
        const healthUrl = `${API_BASE_URL}/health`;
        console.log('Testing health endpoint:', healthUrl);
        
        const healthResponse = await fetch(healthUrl);
        console.log('Health response status:', healthResponse.status);
        console.log('Health response ok:', healthResponse.ok);
        
        if (!healthResponse.ok) {
            const errorText = await healthResponse.text();
            console.error('Health check failed:', errorText);
            throw new Error(`Backend server error: ${healthResponse.status} - ${errorText}`);
        }
        
        const healthData = await healthResponse.json();
        console.log('Health check response:', healthData);
        
        // Fetch all required data
        console.log('Fetching model data...');
        const summaryUrl = `${API_BASE_URL}/model/metrics/summary`;
        const predictionsUrl = `${API_BASE_URL}/model/predictions`;
        
        console.log('Summary URL:', summaryUrl);
        console.log('Predictions URL:', predictionsUrl);
        
        const [summaryResponse, predictionsResponse] = await Promise.all([
            fetch(summaryUrl),
            fetch(predictionsUrl)
        ]);
        
        console.log('Summary response status:', summaryResponse.status);
        console.log('Predictions response status:', predictionsResponse.status);
        
        if (!summaryResponse.ok) {
            const errorText = await summaryResponse.text();
            console.error('Summary endpoint failed:', errorText);
            throw new Error(`Summary endpoint error: ${summaryResponse.status} - ${errorText}`);
        }
        
        if (!predictionsResponse.ok) {
            const errorText = await predictionsResponse.text();
            console.error('Predictions endpoint failed:', errorText);
            throw new Error(`Predictions endpoint error: ${predictionsResponse.status} - ${errorText}`);
        }
        
        const summaryData = await summaryResponse.json();
        const predictionsData = await predictionsResponse.json();
        
        console.log('Data fetched successfully:', { summaryData, predictionsData });
        
        // Update UI with data
        updateModelOverview(summaryData.summary);
        updateTrainTestSplit(summaryData.summary);
        updatePerformanceMetrics(summaryData.summary);
        updateConfusionMatrix(summaryData.summary.confusion_matrix);
        updateCharts(summaryData.summary);

        
        showMainContent();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError(error.message);
    }
}

// Show loading state
function showLoading() {
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    mainContent.style.display = 'none';
}

// Show error state
function showError(message) {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    mainContent.style.display = 'none';
    errorText.textContent = message;
}

// Show main content
function showMainContent() {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    mainContent.style.display = 'block';
}

// Update model overview cards
function updateModelOverview(summary) {
    document.getElementById('accuracyValue').textContent = `${summary.accuracy}%`;
    document.getElementById('algorithmValue').textContent = summary.algorithm;
    document.getElementById('datasetValue').textContent = summary.data_shape[0].toLocaleString();
    document.getElementById('featuresValue').textContent = summary.features_count;
}

// Update train/test split information
function updateTrainTestSplit(summary) {
    const trainSize = summary.train_size || 0;
    const testSize = summary.test_size || 0;
    const trainRatio = Math.round((summary.train_test_ratio?.train || 0.8) * 100);
    const testRatio = Math.round((summary.train_test_ratio?.test || 0.2) * 100);
    
    document.getElementById('trainSizeValue').textContent = trainSize.toLocaleString();
    document.getElementById('trainPercentage').textContent = `${trainRatio}% of total`;
    
    document.getElementById('testSizeValue').textContent = testSize.toLocaleString();
    document.getElementById('testPercentage').textContent = `${testRatio}% of total`;
    
    document.getElementById('splitRatio').textContent = `${trainRatio}:${testRatio}`;
}

// Update performance metrics
function updatePerformanceMetrics(summary) {
    document.getElementById('precision0').textContent = `${summary.precision.class_0}%`;
    document.getElementById('precision1').textContent = `${summary.precision.class_1}%`;
    document.getElementById('recall0').textContent = `${summary.recall.class_0}%`;
    document.getElementById('recall1').textContent = `${summary.recall.class_1}%`;
    document.getElementById('f1score0').textContent = `${summary.f1_score.class_0}%`;
    document.getElementById('f1score1').textContent = `${summary.f1_score.class_1}%`;
}

// Update confusion matrix
function updateConfusionMatrix(confusionMatrix) {
    const container = document.getElementById('confusionMatrix');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create matrix layout
    const matrixData = [
        ['', 'Predicted 0', 'Predicted 1'],
        ['Actual 0', confusionMatrix[0][0], confusionMatrix[0][1]],
        ['Actual 1', confusionMatrix[1][0], confusionMatrix[1][1]]
    ];
    
    matrixData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.textContent = cell;
            
            if (rowIndex === 0 || colIndex === 0) {
                cellDiv.className = rowIndex === 0 && colIndex === 0 ? 'confusion-cell' : 
                                  rowIndex === 0 ? 'confusion-cell confusion-header' : 
                                  'confusion-cell confusion-label';
            } else {
                cellDiv.className = 'confusion-cell confusion-value';
            }
            
            container.appendChild(cellDiv);
        });
    });
}

// Update charts
function updateCharts(summary) {
    updatePerformanceChart(summary);
    updatePredictionChart(summary);

}

// Update performance chart
function updatePerformanceChart(summary) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Precision', 'Recall', 'F1-Score'],
            datasets: [
                {
                    label: 'Class 0',
                    data: [summary.precision.class_0, summary.recall.class_0, summary.f1_score.class_0],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: 'Class 1',
                    data: [summary.precision.class_1, summary.recall.class_1, summary.f1_score.class_1],
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Classification Metrics by Class',
                    color: '#e2e8f0',
                    font: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update prediction chart
function updatePredictionChart(summary) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    
    if (predictionChart) {
        predictionChart.destroy();
    }
    
    // Calculate prediction distribution
    const confusionMatrix = summary.confusion_matrix;
    const correctPredictions = confusionMatrix[0][0] + confusionMatrix[1][1];
    const incorrectPredictions = confusionMatrix[0][1] + confusionMatrix[1][0];
    const total = correctPredictions + incorrectPredictions;
    
    predictionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Correct Predictions', 'Incorrect Predictions'],
            datasets: [{
                data: [correctPredictions, incorrectPredictions],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0',
                        padding: 20,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Prediction Accuracy (${total.toLocaleString()} total)`,
                    color: '#e2e8f0',
                    font: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 42, 74, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}





// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return Number(num).toFixed(decimals);
}

// Handle refresh button animation
refreshBtn.addEventListener('click', function() {
    const icon = this.querySelector('i');
    icon.style.animation = 'spin 1s linear';
    setTimeout(() => {
        icon.style.animation = '';
    }, 1000);
});

// Error handling for fetch requests
async function handleFetchError(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
}

// Console logging for debugging
console.log('ML Dashboard script loaded');
console.log('API Base URL:', API_BASE_URL);
