// Sustainability Insights JavaScript
let insightsData = null;

// Load insights data from API
async function loadInsights() {
  try {
    const response = await fetch('/api/insights');
    const apiData = await response.json();
    
    // Transform API data to the format expected by the frontend
    insightsData = transformInsightsData(apiData);
    updateInsightsDisplay();
    generateRecommendations();
  } catch (error) {
    console.error('Error loading insights:', error);
    // Fallback data
    loadFallbackData();
  }
}

// Transform API data to frontend format
function transformInsightsData(apiData) {
  // Get shipments data for basic metrics
  const shipments = getShipmentsData();
  
  const totalEmissions = shipments.reduce((sum, s) => sum + (s.co2Emission || 0), 0);
  const totalDistance = shipments.reduce((sum, s) => sum + (s.distance || 0), 0);
  const totalShipments = shipments.length;
  
  return {
    totalEmissions,
    totalShipments,
    avgEmissionPerKm: totalDistance > 0 ? (totalEmissions / totalDistance) * 1000 : 0, // Convert to g/km
    sustainabilityScore: calculateSustainabilityScore(totalEmissions, totalShipments, apiData),
    efficientRoute: getMostEfficientRoute(shipments),
    highEmissionRoutes: apiData.inefficientRoutes ? apiData.inefficientRoutes.length : 0,
    potentialSavings: calculatePotentialSavings(apiData),
    greenInitiatives: 3,
    recommendations: generateRecommendationsFromData(apiData, shipments),
    apiData // Keep original data for debugging
  };
}

// Get shipments data (mock for now)
function getShipmentsData() {
  return [
    { co2Emission: 532.50, distance: 1425, lane: "Mumbai → Delhi", fuelType: "Diesel" },
    { co2Emission: 698.25, distance: 2150, lane: "Delhi → Bangalore", fuelType: "Diesel" },
    { co2Emission: 245.80, distance: 980, lane: "Bangalore → Chennai", fuelType: "Diesel" },
    { co2Emission: 412.30, distance: 1250, lane: "Mumbai → Hyderabad", fuelType: "Diesel" },
    { co2Emission: 589.75, distance: 1680, lane: "Pune → Delhi", fuelType: "Diesel" },
    { co2Emission: 378.90, distance: 1450, lane: "Chennai → Kolkata", fuelType: "Diesel" },
    { co2Emission: 456.20, distance: 1100, lane: "Delhi → Jaipur", fuelType: "Diesel" },
    { co2Emission: 234.60, distance: 520, lane: "Mumbai → Ahmedabad", fuelType: "Diesel" }
  ];
}

// Calculate sustainability score
function calculateSustainabilityScore(totalEmissions, totalShipments, apiData) {
  let score = 100;
  
  // Deduct points for high emissions
  if (totalEmissions > 5000) score -= 20;
  else if (totalEmissions > 3000) score -= 10;
  
  // Deduct points for inefficient routes
  if (apiData.inefficientRoutes && apiData.inefficientRoutes.length > 3) score -= 15;
  else if (apiData.inefficientRoutes && apiData.inefficientRoutes.length > 1) score -= 5;
  
  // Deduct points for poor load utilization
  if (apiData.poorLoadUtilization && apiData.poorLoadUtilization.length > 0) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Get most efficient route
function getMostEfficientRoute(shipments) {
  if (shipments.length === 0) return '-';
  
  const efficiency = shipments.map(s => ({
    lane: s.lane,
    efficiency: (s.co2Emission / s.distance) * 1000 // g/km
  }));
  
  const mostEfficient = efficiency.reduce((best, current) => 
    current.efficiency < best.efficiency ? current : best
  );
  
  return mostEfficient.lane;
}

// Calculate potential savings
function calculatePotentialSavings(apiData) {
  let savings = 0;
  
  // Savings from inefficient routes (assume 20% reduction possible)
  if (apiData.inefficientRoutes) {
    savings += apiData.inefficientRoutes.reduce((sum, route) => 
      sum + (route.totalEmissions * 0.2), 0
    );
  }
  
  // Savings from fuel optimization (assume 15% reduction)
  if (apiData.fuelBreakdown) {
    const dieselEmissions = apiData.fuelBreakdown
      .filter(f => f._id === 'Diesel')
      .reduce((sum, f) => sum + f.totalEmissions, 0);
    savings += dieselEmissions * 0.15;
  }
  
  return Math.round(savings);
}

// Generate recommendations from actual data
function generateRecommendationsFromData(apiData, shipments) {
  const recommendations = [];
  
  // Route optimization recommendations
  if (apiData.inefficientRoutes && apiData.inefficientRoutes.length > 0) {
    const worstRoute = apiData.inefficientRoutes[0];
    recommendations.push({
      title: `Optimize ${worstRoute.lane} Route`,
      text: `This route has high emissions (${worstRoute.avgCO2PerTonKm.toFixed(2)} g/ton-km). Consider cleaner fuels or larger trucks.`,
      impact: "high"
    });
  }
  
  // Fuel type recommendations
  if (apiData.fuelBreakdown) {
    const dieselUsage = apiData.fuelBreakdown.find(f => f._id === 'Diesel');
    if (dieselUsage && dieselUsage.count > 0) {
      recommendations.push({
        title: "Switch to Cleaner Fuels",
        text: `${dieselUsage.count} shipments use diesel. CNG/LNG can reduce emissions by 30-50%.`,
        impact: "high"
      });
    }
  }
  
  // Load utilization recommendations
  if (apiData.poorLoadUtilization && apiData.poorLoadUtilization.length > 0) {
    recommendations.push({
      title: "Improve Load Consolidation",
      text: "Better load planning can reduce per-shipment emissions by 15-25%.",
      impact: "medium"
    });
  }
  
  // General recommendations
  if (shipments.length > 0) {
    recommendations.push({
      title: "Consider Electric Vehicles",
      text: "For routes under 500km, electric trucks can reduce emissions by 60-70%.",
      impact: "medium"
    });
  }
  
  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

// Load fallback data for demo purposes
function loadFallbackData() {
  insightsData = {
    totalEmissions: 4250,
    totalShipments: 8,
    avgEmissionPerKm: 0.85,
    sustainabilityScore: 78,
    efficientRoute: "Bangalore → Chennai",
    highEmissionRoutes: 2,
    potentialSavings: 450,
    greenInitiatives: 3,
    // Enhanced data for better insights
    monthlyTrends: [
      { month: 'Jan', emissions: 380, shipments: 12 },
      { month: 'Feb', emissions: 420, shipments: 15 },
      { month: 'Mar', emissions: 425, shipments: 8 }
    ],
    fuelBreakdown: [
      { type: 'Diesel', emissions: 2980, percentage: 70, color: '#dc2626' },
      { type: 'CNG', emissions: 850, percentage: 20, color: '#059669' },
      { type: 'Electric', emissions: 420, percentage: 10, color: '#2563eb' }
    ],
    routeEfficiency: [
      { lane: 'Bangalore → Chennai', efficiency: 0.25, status: 'excellent' },
      { lane: 'Mumbai → Pune', efficiency: 0.45, status: 'good' },
      { lane: 'Delhi → Jaipur', efficiency: 0.85, status: 'poor' },
      { lane: 'Pune → Delhi', efficiency: 0.65, status: 'moderate' }
    ],
    recommendations: [
      {
        title: "Optimize Mumbai-Delhi Route",
        text: "This route has high emissions (0.85 g/km). Consider using alternative routes via Hyderabad to reduce emissions by 15%",
        impact: "high",
        savings: "640 kg CO₂/year",
        priority: 1
      },
      {
        title: "Switch to Cleaner Fuels",
        text: "70% of shipments use diesel. CNG/LNG can reduce emissions by 30-50% on high-frequency routes",
        impact: "high",
        savings: "1275 kg CO₂/year",
        priority: 2
      },
      {
        title: "Improve Load Utilization",
        text: "Increase average load from 75% to 90% to reduce per-shipment emissions by 15-25%",
        impact: "medium",
        savings: "638 kg CO₂/year",
        priority: 3
      },
      {
        title: "Consider Electric Vehicles",
        text: "For routes under 500km, electric trucks can reduce emissions by 60-70% and save fuel costs",
        impact: "medium",
        savings: "294 kg CO₂/year",
        priority: 4
      }
    ]
  };
  updateInsightsDisplay();
  generateRecommendations();
  // Enhanced visualizations
  createTrendChart();
  createFuelChart();
  createEfficiencyChart();
}

// Update insights display with data
function updateInsightsDisplay() {
  if (!insightsData) return;

  // Update key metrics
  document.getElementById('totalEmissions').textContent = 
    insightsData.totalEmissions ? `${insightsData.totalEmissions.toFixed(0)} kg` : '0 kg';
  
  document.getElementById('efficiency').textContent = 
    insightsData.avgEmissionPerKm ? `${insightsData.avgEmissionPerKm.toFixed(2)} g/km` : '0 g/km';
  
  document.getElementById('totalShipments').textContent = 
    insightsData.totalShipments || '0';
  
  document.getElementById('sustainabilityScore').textContent = 
    insightsData.sustainabilityScore ? `${insightsData.sustainabilityScore}/100` : '0/100';
  
  // Update progress bar
  const scoreProgress = document.getElementById('scoreProgress');
  if (insightsData.sustainabilityScore) {
    scoreProgress.style.width = `${insightsData.sustainabilityScore}%`;
  }
  
  // Update detailed insights
  document.getElementById('efficientRoute').textContent = 
    insightsData.efficientRoute || '-';
  
  document.getElementById('highEmissionAlert').textContent = 
    insightsData.highEmissionRoutes || '0';
  
  document.getElementById('potentialSavings').textContent = 
    insightsData.potentialSavings ? `${insightsData.potentialSavings} kg` : '0 kg';
  
  document.getElementById('greenInitiatives').textContent = 
    insightsData.greenInitiatives || '0';
}

// Create trend chart
function createTrendChart() {
  if (!insightsData.monthlyTrends) return;
  
  const trendContainer = document.createElement('div');
  trendContainer.className = 'trend-chart-container';
  trendContainer.innerHTML = `
    <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">📈 Monthly Emission Trends</h3>
    <div class="trend-chart">
      ${insightsData.monthlyTrends.map((month, index) => `
        <div class="trend-bar" style="height: ${(month.emissions / 450) * 100}%;">
          <div class="trend-label">${month.month}</div>
          <div class="trend-value">${month.emissions} kg</div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Insert after the main insights grid
  const insightsGrid = document.querySelector('.insights-grid');
  if (insightsGrid) {
    insightsGrid.parentNode.insertBefore(trendContainer, insightsGrid.nextSibling);
  }
}

// Create fuel breakdown chart
function createFuelChart() {
  if (!insightsData.fuelBreakdown) return;
  
  const fuelContainer = document.createElement('div');
  fuelContainer.className = 'fuel-chart-container';
  fuelContainer.innerHTML = `
    <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">⛽ Fuel Type Analysis</h3>
    <div class="fuel-chart">
      ${insightsData.fuelBreakdown.map(fuel => `
        <div class="fuel-item">
          <div class="fuel-bar" style="background: ${fuel.color}; width: ${fuel.percentage}%;"></div>
          <div class="fuel-info">
            <span class="fuel-type">${fuel.type}</span>
            <span class="fuel-stats">${fuel.emissions} kg (${fuel.percentage}%)</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Insert after trend chart
  const trendChart = document.querySelector('.trend-chart-container');
  if (trendChart) {
    trendChart.parentNode.insertBefore(fuelContainer, trendChart.nextSibling);
  }
}

// Create route efficiency chart
function createEfficiencyChart() {
  if (!insightsData.routeEfficiency) return;
  
  const efficiencyContainer = document.createElement('div');
  efficiencyContainer.className = 'efficiency-chart-container';
  efficiencyContainer.innerHTML = `
    <h3 style="color: #1e293b; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">🛣️ Route Efficiency Analysis</h3>
    <div class="efficiency-chart">
      ${insightsData.routeEfficiency.map(route => `
        <div class="efficiency-item">
          <div class="efficiency-bar">
            <div class="efficiency-fill ${route.status}" style="width: ${(1 - route.efficiency) * 100}%"></div>
          </div>
          <div class="efficiency-info">
            <div class="efficiency-route">${route.lane}</div>
            <div class="efficiency-score">${route.efficiency} g/km</div>
            <div class="efficiency-status ${route.status}">${route.status.toUpperCase()}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Insert after fuel chart
  const fuelChart = document.querySelector('.fuel-chart-container');
  if (fuelChart) {
    fuelChart.parentNode.insertBefore(efficiencyContainer, fuelChart.nextSibling);
  }
}

// Enhanced recommendations display
function generateRecommendations() {
  const recommendationsList = document.getElementById('recommendationsList');
  
  if (!insightsData || !insightsData.recommendations) {
    recommendationsList.innerHTML = '<p>Loading recommendations...</p>';
    return;
  }
  
  recommendationsList.innerHTML = insightsData.recommendations.map((rec, index) => `
    <div class="recommendation-item-enhanced" data-priority="${rec.priority}">
      <div class="recommendation-header">
        <div class="recommendation-priority priority-${rec.impact}">Priority ${rec.priority}</div>
        <div class="recommendation-title">${rec.title}</div>
        <div class="recommendation-savings">💰 Potential Savings: ${rec.savings}</div>
      </div>
      <div class="recommendation-text">${rec.text}</div>
      <div class="recommendation-actions">
        <button class="action-btn btn-primary" onclick="viewRecommendationDetails(${index})">View Details</button>
      </div>
    </div>
  `).join('');
}

// View recommendation details
function viewRecommendationDetails(index) {
  const rec = insightsData.recommendations[index];
  showModal('recommendation-details', rec);
}

// Modal system
function showModal(type, data) {
  // Remove existing modal
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  let modalContent = '';
  
  if (type === 'recommendation-details') {
    modalContent = createRecommendationModal(data);
  }
  
  const modalHTML = `
    <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
      <div class="modal-container" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">🎯 Recommendation Details</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          ${modalContent}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add animation
  setTimeout(() => {
    document.querySelector('.modal-overlay').classList.add('active');
  }, 10);
}

function createRecommendationModal(rec) {
  return `
    <div class="recommendation-modal">
      <div class="rec-header">
        <div class="rec-title">${rec.title}</div>
        <div class="rec-meta">
          <span class="rec-priority priority-${rec.impact}">Priority ${rec.priority}</span>
          <span class="rec-impact">Impact: ${rec.impact.toUpperCase()}</span>
        </div>
      </div>
      
      <div class="rec-description">
        <p>${rec.text}</p>
      </div>
      
      <div class="rec-metrics">
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-info">
            <div class="metric-value">${rec.savings}</div>
            <div class="metric-label">Potential Annual Savings</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">📊</div>
          <div class="metric-info">
            <div class="metric-value">${rec.impact.toUpperCase()}</div>
            <div class="metric-label">Impact Level</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-info">
            <div class="metric-value">3-6 months</div>
            <div class="metric-label">Implementation Time</div>
          </div>
        </div>
      </div>
      
      <div class="rec-steps">
        <h4>🚀 Implementation Steps</h4>
        <div class="steps-timeline">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Analysis Phase</div>
              <div class="step-description">Conduct detailed analysis of current operations and identify optimization opportunities</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Planning Phase</div>
              <div class="step-description">Develop implementation plan with timelines, resources, and success metrics</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Execution Phase</div>
              <div class="step-description">Implement changes with proper monitoring and adjustment as needed</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">Monitoring Phase</div>
              <div class="step-description">Track results and measure impact on emissions and costs</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="rec-benefits">
        <h4>✨ Expected Benefits</h4>
        <div class="benefits-grid">
          <div class="benefit-item environmental">
            <div class="benefit-icon">🌱</div>
            <div class="benefit-text">
              <div class="benefit-title">Environmental</div>
              <div class="benefit-description">Reduce carbon footprint by ${rec.savings}</div>
            </div>
          </div>
          <div class="benefit-item financial">
            <div class="benefit-icon">💵</div>
            <div class="benefit-text">
              <div class="benefit-title">Financial</div>
              <div class="benefit-description">Lower fuel costs and improved efficiency</div>
            </div>
          </div>
          <div class="benefit-item operational">
            <div class="benefit-icon">⚙️</div>
            <div class="benefit-text">
              <div class="benefit-title">Operational</div>
              <div class="benefit-description">Streamlined processes and better resource utilization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

// Add modal styles to the page
function addModalStyles() {
  const modalStyles = `
    <style>
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
      }
      
      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-container {
        background: white;
        border-radius: 16px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        transform: scale(0.9);
        transition: all 0.3s ease;
      }
      
      .modal-overlay.active .modal-container {
        transform: scale(1);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 2rem 1rem;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      .modal-close:hover {
        background: #f1f5f9;
        color: #1e293b;
      }
      
      .modal-body {
        padding: 2rem;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1rem 2rem 2rem;
        border-top: 1px solid #e2e8f0;
      }
      
      .recommendation-modal {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      
      .rec-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .rec-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.4;
      }
      
      .rec-meta {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      
      .rec-priority {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .rec-priority.priority-high {
        background: #fef3c7;
        color: #d97706;
      }
      
      .rec-priority.priority-medium {
        background: #dbeafe;
        color: #2563eb;
      }
      
      .rec-impact {
        padding: 0.5rem 1rem;
        background: #f1f5f9;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
      }
      
      .rec-description {
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid #10b981;
      }
      
      .rec-description p {
        margin: 0;
        color: #475569;
        line-height: 1.6;
      }
      
      .rec-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      
      .metric-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      
      .metric-icon {
        font-size: 2rem;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 12px;
      }
      
      .metric-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #059669;
      }
      
      .metric-label {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 0.25rem;
      }
      
      .rec-steps h4 {
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      
      .steps-timeline {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .step-item {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .step-number {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
      
      .step-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }
      
      .step-description {
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .rec-benefits h4 {
        color: #1e293b;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      
      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .benefit-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 12px;
        transition: all 0.2s ease;
      }
      
      .benefit-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .benefit-item.environmental {
        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        border: 1px solid #a7f3d0;
      }
      
      .benefit-item.financial {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 1px solid #fbbf24;
      }
      
      .benefit-item.operational {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        border: 1px solid #93c5fd;
      }
      
      .benefit-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 10px;
      }
      
      .benefit-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }
      
      .benefit-description {
        color: #64748b;
        font-size: 0.85rem;
        line-height: 1.4;
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', modalStyles);
}

// Implement recommendation
function implementRecommendation(index) {
  const rec = insightsData.recommendations[index];
  alert(`Implementation Plan for: ${rec.title}\n\nSteps to implement:\n1. Conduct route analysis\n2. Evaluate alternative options\n3. Calculate ROI\n4. Plan implementation timeline\n\nExpected Impact: ${rec.savings} CO₂ reduction annually`);
}

// Animate numbers on load
function animateValue(element, start, end, duration, suffix = '') {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = end + suffix;
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current) + suffix;
    }
  }, 16);
}

// Animate all metrics on page load
function animateMetrics() {
  if (!insightsData) return;
  
  // Animate total emissions
  const totalEmissionsEl = document.getElementById('totalEmissions');
  if (insightsData.totalEmissions) {
    animateValue(totalEmissionsEl, 0, insightsData.totalEmissions, 1500, ' kg');
  }
  
  // Animate shipments
  const shipmentsEl = document.getElementById('totalShipments');
  if (insightsData.totalShipments) {
    animateValue(shipmentsEl, 0, insightsData.totalShipments, 1000);
  }
  
  // Animate sustainability score
  const scoreEl = document.getElementById('sustainabilityScore');
  const progressEl = document.getElementById('scoreProgress');
  if (insightsData.sustainabilityScore) {
    animateValue(scoreEl, 0, insightsData.sustainabilityScore, 2000, '/100');
    setTimeout(() => {
      progressEl.style.width = `${insightsData.sustainabilityScore}%`;
    }, 100);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Add modal styles first
  addModalStyles();
  
  loadInsights();
  
  // Add hover effects to cards
  const cards = document.querySelectorAll('.insight-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
  
  // Animate metrics after data loads
  setTimeout(() => {
    animateMetrics();
  }, 500);
});
