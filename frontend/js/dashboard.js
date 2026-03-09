const API = window.api || (async (p, o) => {
  const res = await fetch(p, { ...o, headers: { 'Content-Type': 'application/json', ...o?.headers } });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || res.statusText);
  return d;
});

async function loadStats() {
  try {
    const summary = await API('/api/emissions/summary');
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="stat-card primary">
        <div class="stat-value">${formatNumber(summary.totalEmissions || 0)}</div>
        <div class="stat-label">Total CO₂ (kg)</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${formatNumber(summary.shipmentCount || 0)}</div>
        <div class="stat-label">Total Shipments</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${formatNumber(summary.totalDistance || 0)}</div>
        <div class="stat-label">Total Distance (km)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(summary.avgEmission || 0).toFixed(1)}</div>
        <div class="stat-label">Avg Emission/Shipment (kg)</div>
      </div>
    `;
  } catch (e) {
    console.error('Stats load error:', e);
    document.getElementById('statsGrid').innerHTML = '<div class="alert alert-error">Could not load stats. Ensure the server is running.</div>';
  }
}

function formatNumber(n) {
  return new Intl.NumberFormat().format(Math.round(n));
}

async function loadCharts() {
  try {
    const [trends, lanes, carriers, highEmission] = await Promise.all([
      API('/api/emissions/trends'),
      API('/api/lanes/analytics'),
      API('/api/lanes/carrier-comparison'),
      API('/api/lanes/high-emission?limit=8')
    ]);

    const ctx1 = document.getElementById('trendChart')?.getContext('2d');
    if (ctx1 && trends?.length) {
      new Chart(ctx1, {
        type: 'line',
        data: {
          labels: trends.map(t => t._id),
          datasets: [{ label: 'CO₂ (kg)', data: trends.map(t => t.totalEmissions), borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)', fill: true, tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    const ctx2 = document.getElementById('laneChart')?.getContext('2d');
    if (ctx2 && lanes?.length) {
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: lanes.slice(0, 6).map(l => l.lane?.split(' → ').join('-\n') || l._id),
          datasets: [{ label: 'CO₂ (kg)', data: lanes.slice(0, 6).map(l => l.totalEmissions), backgroundColor: ['#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e4','#ccfbf1'] }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
      });
    }

    const ctx3 = document.getElementById('carrierChart')?.getContext('2d');
    if (ctx3 && carriers?.length) {
      new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: carriers.map(c => c._id),
          datasets: [{ data: carriers.map(c => c.totalEmissions), backgroundColor: ['#0d9488','#14b8a6','#f59e0b','#10b981','#6366f1'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctx4 = document.getElementById('highEmissionChart')?.getContext('2d');
    if (ctx4 && highEmission?.length) {
      new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: highEmission.map(h => h.lane?.split(' → ')[0] || h.lane),
          datasets: [{ label: 'CO₂ (kg)', data: highEmission.map(h => h.totalEmissions), backgroundColor: 'rgba(239,68,68,0.7)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  } catch (e) {
    console.error('Charts load error:', e);
  }
}

async function loadInsights() {
  try {
    const insights = await API('/api/insights');
    const el = document.getElementById('insightsContent');
    if (!el) return;
    
    // Enhanced insights with interactive elements
    let html = `
      <style>
        .insights-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .insight-card {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .insight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981, #059669);
        }
        .insight-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .insight-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .insight-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .insight-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }
        .insight-content {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .insight-item {
          background: white;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-left: 3px solid #10b981;
          transition: all 0.2s ease;
        }
        .insight-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .insight-route {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .insight-metric {
          color: #059669;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .insight-recommendation {
          color: #64748b;
          font-size: 0.85rem;
        }
        .fuel-bar-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .fuel-bar {
          height: 20px;
          border-radius: 10px;
          min-width: 80px;
          position: relative;
        }
        .fuel-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .fuel-type {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
        }
        .fuel-stats {
          color: #64748b;
          font-size: 0.8rem;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-high {
          background: #fee2e2;
          color: #dc2626;
        }
        .status-medium {
          background: #fef3c7;
          color: #d97706;
        }
        .status-low {
          background: #dcfce7;
          color: #16a34a;
        }
      </style>
      <div class="insights-container">
    `;
    
    // Inefficient Routes Card
    if (insights.inefficientRoutes?.length) {
      html += `
        <div class="insight-card">
          <div class="insight-header">
            <div class="insight-icon" style="background: linear-gradient(135deg, #fee2e2, #fecaca);">
              🛣️
            </div>
            <div class="insight-title">Inefficient Routes</div>
          </div>
          <div class="insight-content">
            ${insights.inefficientRoutes.slice(0, 3).map(route => {
              const efficiency = route.avgCO2PerTonKm || 0;
              let status = 'low';
              if (efficiency > 0.1) status = 'high';
              else if (efficiency > 0.05) status = 'medium';
              
              return `
                <div class="insight-item">
                  <div class="insight-route">${route.lane || 'Unknown Route'}</div>
                  <div class="insight-metric">${efficiency.toFixed(3)} kg/ton-km</div>
                  <div class="insight-recommendation">${route.cleanerFuelSuggestion || route.suggestion || 'Consider route optimization'}</div>
                  <span class="status-badge status-${status}">${status} emissions</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // Poor Load Utilization Card
    if (insights.poorLoadUtilization?.length) {
      html += `
        <div class="insight-card">
          <div class="insight-header">
            <div class="insight-icon" style="background: linear-gradient(135deg, #fef3c7, #fde68a);">
              📦
            </div>
            <div class="insight-title">Load Utilization</div>
          </div>
          <div class="insight-content">
            ${insights.poorLoadUtilization.slice(0, 3).map(load => {
              const utilization = load.avgLoadFactor || 0;
              let status = 'high';
              if (utilization > 80) status = 'low';
              else if (utilization > 60) status = 'medium';
              
              return `
                <div class="insight-item">
                  <div class="insight-route">${load.carrier || 'Unknown Carrier'}</div>
                  <div class="insight-metric">${utilization.toFixed(1)}% avg load</div>
                  <div class="insight-recommendation">${load.suggestion || 'Improve load consolidation'}</div>
                  <span class="status-badge status-${status}">${status} priority</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // Fuel Breakdown Card
    if (insights.fuelBreakdown?.length) {
      const totalEmissions = insights.fuelBreakdown.reduce((sum, f) => sum + (f.totalEmissions || 0), 0);
      
      html += `
        <div class="insight-card">
          <div class="insight-header">
            <div class="insight-icon" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);">
              ⛽
            </div>
            <div class="insight-title">Fuel Breakdown</div>
          </div>
          <div class="insight-content">
            ${insights.fuelBreakdown.map(fuel => {
              const percentage = totalEmissions > 0 ? ((fuel.totalEmissions || 0) / totalEmissions * 100) : 0;
              let color = '#dc2626'; // red for diesel
              if (fuel._id === 'CNG') color = '#059669'; // green for CNG
              else if (fuel._id === 'Electric') color = '#2563eb'; // blue for electric
              
              return `
                <div class="fuel-bar-container">
                  <div class="fuel-bar" style="background: ${color}; width: ${Math.max(percentage, 5)}%;"></div>
                  <div class="fuel-info">
                    <div class="fuel-type">${fuel._id}</div>
                    <div class="fuel-stats">${formatNumber(fuel.totalEmissions || 0)} kg CO₂ (${percentage.toFixed(1)}%)</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    
    // Add summary card if no data
    if (!insights.inefficientRoutes?.length && !insights.poorLoadUtilization?.length && !insights.fuelBreakdown?.length) {
      html += `
        <div class="insight-card">
          <div class="insight-header">
            <div class="insight-icon" style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe);">
              🌱
            </div>
            <div class="insight-title">Getting Started</div>
          </div>
          <div class="insight-content">
            <p>Add shipments to get personalized sustainability recommendations and insights!</p>
            <ul style="margin-top: 1rem; padding-left: 1.5rem;">
              <li>Track emissions across routes</li>
              <li>Identify inefficient operations</li>
              <li>Get optimization suggestions</li>
              <li>Monitor fuel type performance</li>
            </ul>
          </div>
        </div>
      `;
    }
    
    el.innerHTML = html;
  } catch (e) {
    document.getElementById('insightsContent').innerHTML = '<p>Could not load insights.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadCharts();
  loadInsights();
});
