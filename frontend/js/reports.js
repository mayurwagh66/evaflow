let currentReport = null;

document.getElementById('generateReport')?.addEventListener('click', async () => {
  const start = document.getElementById('reportStartDate')?.value;
  const end = document.getElementById('reportEndDate')?.value;
  let url = '/api/reports?';
  if (start) url += 'startDate=' + encodeURIComponent(start) + '&';
  if (end) url += 'endDate=' + encodeURIComponent(end);
  try {
    const report = await fetch(url).then(r => r.json());
    currentReport = report;
    renderReport(report);
  } catch (e) {
    document.getElementById('reportContent').innerHTML = `<div class="alert alert-error">${e.message}</div>`;
  }
});

function renderReport(r) {
  const s = r.summary || {};
  let html = `
    <div class="report-section">
      <div class="report-title">📊 Executive Summary</div>
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: start;">
        <div>
          <p style="margin-bottom: 1rem; color: var(--eva-text-muted); line-height: 1.6;">
            <strong>Analysis Period:</strong> ${r.period?.startDate || 'All'} to ${r.period?.endDate || 'All'}<br>
            <strong>Generated:</strong> ${new Date(r.generatedAt || Date.now()).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 1rem; border-radius: var(--eva-radius-sm); border-left: 4px solid var(--eva-primary);">
            <strong style="color: var(--eva-primary-dark);">Key Insights:</strong>
            <ul style="margin: 0.5rem 0 0 1.5rem; color: var(--eva-text);">
              <li>Total of <strong>${(s.shipmentCount || 0).toLocaleString()}</strong> shipments analyzed</li>
              <li><strong>${(s.totalDistance || 0).toLocaleString()}</strong> km covered across all routes</li>
              <li>Total CO₂ emissions: <strong style="color: var(--eva-danger);">${(s.totalEmissions || 0).toLocaleString()} kg</strong></li>
              <li>Average efficiency: <strong>${s.totalDistance > 0 ? (s.totalEmissions / s.totalDistance * 1000).toFixed(2) : '0'} g/km</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="report-section">
      <div class="report-title">🎯 Performance Metrics</div>
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="report-metric-card">
          <div style="font-size: 2.5rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;">
            ${(s.totalEmissions || 0).toLocaleString()}
          </div>
          <div style="font-size: 0.875rem; color: var(--eva-text-muted); font-weight: 500;">Total CO₂ (kg)</div>
          <div style="font-size: 0.75rem; color: #dc2626; margin-top: 0.25rem;">🌍 Carbon Footprint</div>
        </div>
        <div class="report-metric-card">
          <div style="font-size: 2.5rem; font-weight: 700; color: #2563eb; margin-bottom: 0.5rem;">
            ${(s.shipmentCount || 0).toLocaleString()}
          </div>
          <div style="font-size: 0.875rem; color: var(--eva-text-muted); font-weight: 500;">Total Shipments</div>
          <div style="font-size: 0.75rem; color: #2563eb; margin-top: 0.25rem;">📦 Fleet Activity</div>
        </div>
        <div class="report-metric-card">
          <div style="font-size: 2.5rem; font-weight: 700; color: #059669; margin-bottom: 0.5rem;">
            ${(s.totalDistance || 0).toLocaleString()}
          </div>
          <div style="font-size: 0.875rem; color: var(--eva-text-muted); font-weight: 500;">Distance (km)</div>
          <div style="font-size: 0.75rem; color: #059669; margin-top: 0.25rem;">🛣️ Total Coverage</div>
        </div>
        <div class="report-metric-card">
          <div style="font-size: 2.5rem; font-weight: 700; color: #7c3aed; margin-bottom: 0.5rem;">
            ${s.totalDistance > 0 ? (s.totalEmissions / s.totalDistance * 1000).toFixed(2) : '0'}
          </div>
          <div style="font-size: 0.875rem; color: var(--eva-text-muted); font-weight: 500;">Avg Efficiency (g/km)</div>
          <div style="font-size: 0.75rem; color: #7c3aed; margin-top: 0.25rem;">⚡ Performance Rate</div>
        </div>
      </div>
    </div>

    <div class="report-section">
      <div class="report-title">🛣️ Lane Performance Analysis</div>
      <div style="background: #f8fafc; padding: 1rem; border-radius: var(--eva-radius-sm); margin-bottom: 1rem; border-left: 4px solid var(--eva-primary);">
        <strong style="color: var(--eva-primary-dark);">Top Performing Routes by Emission Volume</strong>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35%;">Route Lane</th>
              <th style="width: 20%;">Total Emissions (kg)</th>
              <th style="width: 15%;">Shipments</th>
              <th style="width: 15%;">Avg per Shipment (kg)</th>
              <th style="width: 15%;">Efficiency Rating</th>
            </tr>
          </thead>
          <tbody>
            ${(r.laneSummary || []).slice(0, 10).map((l, index) => {
              const avgPerShipment = l.totalEmissions / l.shipmentCount;
              const efficiency = avgPerShipment < 50 ? '🟢 Excellent' : avgPerShipment < 100 ? '🟡 Good' : '🔴 Needs Attention';
              const efficiencyColor = avgPerShipment < 50 ? '#059669' : avgPerShipment < 100 ? '#d97706' : '#dc2626';
              return `
                <tr style="${index === 0 ? 'border-top: 2px solid var(--eva-primary);' : ''}">
                  <td><strong style="color: var(--eva-primary-dark);">${l._id}</strong></td>
                  <td style="color: #dc2626; font-weight: 700; font-size: 1rem;">${(l.totalEmissions || 0).toLocaleString()}</td>
                  <td><span style="background: #eff6ff; color: #2563eb; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 600;">${l.shipmentCount || 0}</span></td>
                  <td style="font-weight: 600;">${avgPerShipment.toFixed(2)}</td>
                  <td><span style="color: ${efficiencyColor}; font-weight: 600;">${efficiency}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="report-section">
      <div class="report-title">⚠️ High Emission Routes Alert</div>
      <div class="alert alert-warning" style="margin-bottom: 1rem; border-radius: var(--eva-radius-sm);">
        <strong>🚨 Critical Alert:</strong> The following routes require immediate optimization attention to reduce carbon footprint
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35%;">Priority Route</th>
              <th style="width: 20%;">Total Emissions (kg)</th>
              <th style="width: 15%;">Shipments</th>
              <th style="width: 15%;">Avg per Shipment (kg)</th>
              <th style="width: 15%;">Action Required</th>
            </tr>
          </thead>
          <tbody>
            ${(r.topHighEmissionRoutes || []).map((h, index) => {
              const avgPerShipment = h.totalEmissions / h.shipmentCount;
              const urgency = index === 0 ? '🔴 Critical' : index <= 2 ? '🟡 High' : '🟠 Medium';
              return `
                <tr style="background: ${index === 0 ? '#fef2f2' : 'transparent'}; ${index === 0 ? 'border-left: 4px solid #dc2626;' : ''}">
                  <td><strong style="color: #dc2626;">${index + 1}. ${h._id}</strong></td>
                  <td style="color: #dc2626; font-weight: 700; font-size: 1.1rem;">${(h.totalEmissions || 0).toLocaleString()}</td>
                  <td><span style="background: #fef2f2; color: #dc2626; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 600; border: 1px solid #fecaca;">${h.shipmentCount || 0}</span></td>
                  <td style="font-weight: 700; color: #dc2626;">${avgPerShipment.toFixed(2)}</td>
                  <td><span class="badge badge-danger" style="font-size: 0.75rem;">${urgency}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="report-section">
      <div class="report-title">🚚 Carrier Performance Analysis</div>
      <div style="background: #f0fdf4; padding: 1rem; border-radius: var(--eva-radius-sm); margin-bottom: 1rem; border-left: 4px solid var(--eva-success);">
        <strong style="color: var(--eva-success);">Carrier Efficiency Comparison</strong>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35%;">Carrier Name</th>
              <th style="width: 20%;">Total Emissions (kg)</th>
              <th style="width: 15%;">Shipments</th>
              <th style="width: 15%;">Avg per Shipment (kg)</th>
              <th style="width: 15%;">Performance</th>
            </tr>
          </thead>
          <tbody>
            ${(r.carrierPerformance || []).map((c, index) => {
              const avgPerShipment = c.totalEmissions / c.shipmentCount;
              const performance = avgPerShipment < 50 ? '🌟 Excellent' : avgPerShipment < 100 ? '✅ Good' : '⚠️ Review';
              const performanceColor = avgPerShipment < 50 ? '#059669' : avgPerShipment < 100 ? '#2563eb' : '#d97706';
              return `
                <tr>
                  <td><strong style="color: var(--eva-primary-dark);">${c._id}</strong></td>
                  <td style="color: #2563eb; font-weight: 600; font-size: 1rem;">${(c.totalEmissions || 0).toLocaleString()}</td>
                  <td><span style="background: #eff6ff; color: #2563eb; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 600;">${c.shipmentCount || 0}</span></td>
                  <td style="font-weight: 600;">${avgPerShipment.toFixed(2)}</td>
                  <td><span style="color: ${performanceColor}; font-weight: 600;">${performance}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('reportContent').innerHTML = html;
}

// Enhanced PDF download
document.getElementById('downloadPdf')?.addEventListener('click', async () => {
  if (!currentReport) {
    alert('Please generate a report first before downloading PDF.');
    return;
  }

  try {
    // Show loading state
    const downloadBtn = document.getElementById('downloadPdf');
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = '🔄 Generating PDF...';
    downloadBtn.disabled = true;

    // Get report parameters
    const start = document.getElementById('reportStartDate')?.value;
    const end = document.getElementById('reportEndDate')?.value;
    let url = '/api/reports/pdf';
    const params = new URLSearchParams();
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
    if (params.toString()) url += '?' + params.toString();

    // Request enhanced PDF from backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF report');
    }

    // Download the PDF
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `EvaFlow-Carbon-Emissions-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    // Show success message
    downloadBtn.textContent = '✅ PDF Generated!';
    setTimeout(() => {
      downloadBtn.textContent = originalText;
      downloadBtn.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF report. Please try again.');
    
    // Reset button
    const downloadBtn = document.getElementById('downloadPdf');
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generateReport')?.click();
});
