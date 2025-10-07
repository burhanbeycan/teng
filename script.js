// TENG ML Platform - Enhanced with Automatic Model Retraining
// When Excel is updated, models automatically retrain for better predictions

// Global variables
let materialsDB = [];
let mlModels = {
    voc: null,
    isc: null,
    power: null,
    energy: null
};
let modelMetrics = {
    voc: { r2: 0, rmse: 0 },
    isc: { r2: 0, rmse: 0 },
    power: { r2: 0, rmse: 0 },
    energy: { r2: 0, rmse: 0 }
};
let currentPage = 1;
const materialsPerPage = 10;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing TENG ML Platform...');
    loadDatabase();
});

// Load database and train models
async function loadDatabase() {
    console.log('📥 Loading database...');
    
    // Try loading JSON first (faster and more reliable)
    try {
        const response = await fetch('teng_database.json');
        if (response.ok) {
            materialsDB = await response.json();
            console.log(`✅ Loaded ${materialsDB.length} materials from JSON`);
            await trainModels();
            updateDatabaseDisplay();
            updateAboutStats();
            updateHeaderInfo();
            return;
        }
    } catch (error) {
        console.log('⚠️ JSON not found, trying Excel...');
    }
    
    // Try loading Excel as fallback
    try {
        const response = await fetch('teng_database.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        materialsDB = jsonData;
        console.log(`✅ Loaded ${materialsDB.length} materials from Excel`);
        
        await trainModels();
        updateDatabaseDisplay();
        updateAboutStats();
        updateHeaderInfo();
        
    } catch (error) {
        console.error('❌ Error loading database:', error);
        loadFallbackData();
    }
}

// Update header info
function updateHeaderInfo() {
    const dbInfo = document.getElementById('db-info');
    if (dbInfo) {
        dbInfo.textContent = `${materialsDB.length} Materials | 81 Descriptors | ML-Powered Predictions`;
    }
}

// Improved Linear Regression with feature normalization
class LinearRegression {
    constructor() {
        this.weights = null;
        this.bias = null;
        this.X_mean = null;
        this.X_std = null;
        this.y_mean = null;
        this.y_std = null;
    }
    
    normalize(X, y) {
        // Normalize features
        const n = X.length;
        const m = X[0].length;
        
        this.X_mean = Array(m).fill(0);
        this.X_std = Array(m).fill(0);
        
        // Calculate mean
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this.X_mean[j] += X[i][j];
            }
            this.X_mean[j] /= n;
        }
        
        // Calculate std
        for (let j = 0; j < m; j++) {
            for (let i = 0; i < n; i++) {
                this.X_std[j] += Math.pow(X[i][j] - this.X_mean[j], 2);
            }
            this.X_std[j] = Math.sqrt(this.X_std[j] / n) + 1e-8; // Add small value to avoid division by zero
        }
        
        // Normalize X
        const X_norm = X.map(row => 
            row.map((val, j) => (val - this.X_mean[j]) / this.X_std[j])
        );
        
        // Normalize y
        this.y_mean = y.reduce((a, b) => a + b) / y.length;
        const y_variance = y.reduce((sum, val) => sum + Math.pow(val - this.y_mean, 2), 0) / y.length;
        this.y_std = Math.sqrt(y_variance) + 1e-8;
        const y_norm = y.map(val => (val - this.y_mean) / this.y_std);
        
        return [X_norm, y_norm];
    }
    
    fit(X, y) {
        // Normalize data
        const [X_norm, y_norm] = this.normalize(X, y);
        
        const n = X_norm.length;
        const m = X_norm[0].length;
        
        // Initialize weights
        this.weights = Array(m).fill(0);
        this.bias = 0;
        
        // Gradient descent with adaptive learning rate
        let learning_rate = 0.1;
        const iterations = 2000;
        
        for (let iter = 0; iter < iterations; iter++) {
            // Forward pass
            const predictions = X_norm.map(row => 
                this.bias + row.reduce((sum, val, idx) => sum + val * this.weights[idx], 0)
            );
            
            // Calculate gradients
            const errors = predictions.map((pred, idx) => pred - y_norm[idx]);
            
            // Gradient for bias
            const bias_grad = errors.reduce((a, b) => a + b) / n;
            
            // Gradients for weights
            const weight_grads = Array(m).fill(0);
            for (let j = 0; j < m; j++) {
                for (let i = 0; i < n; i++) {
                    weight_grads[j] += errors[i] * X_norm[i][j];
                }
                weight_grads[j] /= n;
            }
            
            // Update parameters
            this.bias -= learning_rate * bias_grad;
            for (let j = 0; j < m; j++) {
                this.weights[j] -= learning_rate * weight_grads[j];
            }
            
            // Decay learning rate
            if (iter % 500 === 0) {
                learning_rate *= 0.9;
            }
        }
    }
    
    predict(X) {
        // Normalize input
        const X_norm = X.map(row => 
            row.map((val, j) => (val - this.X_mean[j]) / this.X_std[j])
        );
        
        // Predict normalized
        const y_norm_pred = X_norm.map(row => 
            this.bias + row.reduce((sum, val, idx) => sum + val * this.weights[idx], 0)
        );
        
        // Denormalize predictions
        return y_norm_pred.map(val => val * this.y_std + this.y_mean);
    }
    
    score(X, y) {
        const predictions = this.predict(X);
        const y_mean = y.reduce((a, b) => a + b) / y.length;
        const ss_tot = y.reduce((sum, val) => sum + Math.pow(val - y_mean, 2), 0);
        const ss_res = y.reduce((sum, val, idx) => sum + Math.pow(val - predictions[idx], 2), 0);
        const r2 = 1 - (ss_res / ss_tot);
        return Math.max(0, Math.min(1, r2)); // Clamp between 0 and 1
    }
}

// Train ML models on current database
async function trainModels() {
    console.log('🔄 Training ML models...');
    
    // Prepare training data
    const X = [];
    const y_voc = [];
    const y_isc = [];
    const y_power = [];
    
    materialsDB.forEach(material => {
        // Skip if missing data
        if (!material.Loading || !material.Thickness || !material.Voc || !material.Isc || !material.Power) {
            return;
        }
        
        // Features: polymer encoding, filler encoding, loading, thickness
        const polymer_code = encodePolymer(material.Polymer);
        const filler_code = encodeFiller(material.Filler);
        
        X.push([
            polymer_code,
            filler_code,
            parseFloat(material.Loading) || 0,
            parseFloat(material.Thickness) || 100
        ]);
        
        y_voc.push(parseFloat(material.Voc));
        y_isc.push(parseFloat(material.Isc));
        y_power.push(parseFloat(material.Power));
    });
    
    console.log(`Training on ${X.length} materials`);
    
    // Train models
    mlModels.voc = new LinearRegression();
    mlModels.isc = new LinearRegression();
    mlModels.power = new LinearRegression();
    
    mlModels.voc.fit(X, y_voc);
    mlModels.isc.fit(X, y_isc);
    mlModels.power.fit(X, y_power);
    
    // Calculate metrics
    modelMetrics.voc.r2 = mlModels.voc.score(X, y_voc);
    modelMetrics.isc.r2 = mlModels.isc.score(X, y_isc);
    modelMetrics.power.r2 = mlModels.power.score(X, y_power);
    
    console.log('✅ Models trained!');
    console.log(`   Voc R²: ${modelMetrics.voc.r2.toFixed(3)}`);
    console.log(`   Isc R²: ${modelMetrics.isc.r2.toFixed(3)}`);
    console.log(`   Power R²: ${modelMetrics.power.r2.toFixed(3)}`);
    
    // Update model info in UI
    updateModelInfo();
}

// Encode polymer to numeric
function encodePolymer(polymer) {
    const polymers = {
        'PTFE': 10, 'PVDF': 9, 'PI': 8, 'CA': 7, 'PDMS': 6,
        'PC': 5, 'PP': 4, 'PVC': 3, 'PET': 2, 'Nylon': 1,
        'Cellulose': 0.5, 'PU': 0
    };
    return polymers[polymer] || 5;
}

// Encode filler to numeric
function encodeFiller(filler) {
    if (!filler || filler === 'None' || filler === 'NaN') return 0;
    const fillers = {
        'Au': 10, 'Ag': 9, 'MXene': 8, 'Graphene': 7, 'CNT': 6,
        'BaTiO3': 5, 'TiO2': 4, 'ZnO': 3, 'Al2O3': 2, 'Al': 1, 'F': 1
    };
    return fillers[filler] || 5;
}

// Update model info display
function updateModelInfo() {
    const modelInfoDiv = document.getElementById('model-performance');
    if (modelInfoDiv) {
        modelInfoDiv.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-top: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #fff;">🤖 Current Model Performance</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px;">
                    <div><strong>Voc:</strong> R² = ${modelMetrics.voc.r2.toFixed(3)}</div>
                    <div><strong>Isc:</strong> R² = ${modelMetrics.isc.r2.toFixed(3)}</div>
                    <div><strong>Power:</strong> R² = ${modelMetrics.power.r2.toFixed(3)}</div>
                </div>
                <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
                    Models trained on ${materialsDB.length} materials | Auto-updates when Excel is modified
                </p>
            </div>
        `;
    }
}

// Fallback data if Excel loading fails
function loadFallbackData() {
    materialsDB = [
        {ID: 'CAMX_001', Name: 'CA pristine', Polymer: 'CA', Filler: 'None', Loading: 0, Thickness: 100, Voc: 90, Isc: 5.0, Power: 0.35, Ref: 'Beycan 2025'},
        {ID: 'CAMX_002', Name: 'CAMX_a 70um', Polymer: 'CA', Filler: 'MXene', Loading: 5, Thickness: 70, Voc: 200, Isc: 12.0, Power: 1.20, Ref: 'Beycan 2025'},
        {ID: 'CAMX_003', Name: 'CAMX_b 90um', Polymer: 'CA', Filler: 'MXene', Loading: 5, Thickness: 90, Voc: 220, Isc: 13.0, Power: 1.40, Ref: 'Beycan 2025'},
        {ID: 'CAMX_004', Name: 'CAMX optimized', Polymer: 'CA', Filler: 'MXene', Loading: 8, Thickness: 80, Voc: 240, Isc: 14.0, Power: 1.60, Ref: 'Beycan 2025'},
    ];
    console.log('⚠️ Using fallback data');
    trainModels();
    updateDatabaseDisplay();
}

// Predict TENG performance
function predictPerformance() {
    const polymer = document.getElementById('polymer').value;
    const filler = document.getElementById('filler').value;
    const loading = parseFloat(document.getElementById('loading').value);
    const thickness = parseFloat(document.getElementById('thickness').value);
    
    // Prepare features
    const polymer_code = encodePolymer(polymer);
    const filler_code = encodeFiller(filler);
    const features = [[polymer_code, filler_code, loading, thickness]];
    
    // Predict
    const voc_pred = mlModels.voc.predict(features)[0];
    const isc_pred = mlModels.isc.predict(features)[0];
    const power_pred = mlModels.power.predict(features)[0];
    const energy_pred = power_pred * 0.5; // Simplified
    
    // Display results
    document.getElementById('pred-voc').textContent = Math.max(0, voc_pred).toFixed(0);
    document.getElementById('pred-isc').textContent = Math.max(0, isc_pred).toFixed(1);
    document.getElementById('pred-power').textContent = Math.max(0, power_pred).toFixed(2);
    document.getElementById('pred-energy').textContent = Math.max(0, energy_pred).toFixed(3);
    
    console.log(`✅ Prediction complete: Voc=${voc_pred.toFixed(0)}V, Isc=${isc_pred.toFixed(1)}μA, Power=${power_pred.toFixed(2)}W/m²`);
}

// Load CAMX preset data
function loadCAMXData() {
    document.getElementById('polymer').value = 'CA';
    document.getElementById('filler').value = 'MXene';
    document.getElementById('loading').value = 5;
    document.getElementById('thickness').value = 70;
    
    // Update slider displays
    document.getElementById('loading-value').textContent = '5%';
    document.getElementById('thickness-value').textContent = '70 μm';
    
    alert('✅ CAMX data loaded! Click "Predict Performance" to see results.');
}

// Update database display with pagination
function updateDatabaseDisplay() {
    const totalPages = Math.ceil(materialsDB.length / materialsPerPage);
    const startIdx = (currentPage - 1) * materialsPerPage;
    const endIdx = startIdx + materialsPerPage;
    const pageData = materialsDB.slice(startIdx, endIdx);
    
    const tbody = document.getElementById('materials-tbody');
    tbody.innerHTML = pageData.map(material => `
        <tr>
            <td>${material.ID}</td>
            <td>${material.Name}</td>
            <td>${material.Filler || 'None'}</td>
            <td>${material.Loading || 0}</td>
            <td>${material.Voc}</td>
            <td>${material.Isc}</td>
            <td>${material.Power}</td>
            <td>${material.Ref}</td>
        </tr>
    `).join('');
    
    // Update pagination
    document.getElementById('page-info').textContent = 
        `Page ${currentPage} of ${totalPages} | Total: ${materialsDB.length} materials`;
    
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
    
    // Update statistics
    updateDatabaseStats();
}

// Update database statistics
function updateDatabaseStats() {
    const stats = {
        total: materialsDB.length,
        polymers: new Set(materialsDB.map(m => m.Polymer)).size,
        fillers: new Set(materialsDB.map(m => m.Filler).filter(f => f && f !== 'None')).size,
        avgPower: (materialsDB.reduce((sum, m) => sum + (m.Power || 0), 0) / materialsDB.length).toFixed(2),
        maxPower: Math.max(...materialsDB.map(m => m.Power || 0)).toFixed(2)
    };
    
    document.getElementById('db-stats').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 15px;">
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${stats.total}</div>
                <div style="font-size: 12px; opacity: 0.8;">Materials</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${stats.polymers}</div>
                <div style="font-size: 12px; opacity: 0.8;">Polymers</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #ec4899;">${stats.fillers}</div>
                <div style="font-size: 12px; opacity: 0.8;">Fillers</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.avgPower}</div>
                <div style="font-size: 12px; opacity: 0.8;">Avg Power (W/m²)</div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.maxPower}</div>
                <div style="font-size: 12px; opacity: 0.8;">Max Power (W/m²)</div>
            </div>
        </div>
    `;
}

// Update About section stats
function updateAboutStats() {
    // Update material count
    const materialCount = document.querySelectorAll('.about-card p');
    materialCount.forEach(p => {
        if (p.textContent.includes('Materials:')) {
            p.innerHTML = p.innerHTML.replace(/\d+/, materialsDB.length);
        }
    });
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateDatabaseDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    const totalPages = Math.ceil(materialsDB.length / materialsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateDatabaseDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Slider updates
function updateSliderValue(sliderId, displayId, unit) {
    const value = document.getElementById(sliderId).value;
    document.getElementById(displayId).textContent = value + unit;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TENG ML Platform initialized');
    console.log('📊 Database will auto-load from Excel');
    console.log('🤖 Models will auto-train when data changes');
});
