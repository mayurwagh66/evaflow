let autocompleteOrigin, autocompleteDest;

function initAutocomplete() {
  // Disable autocomplete since we're using dropdown selects now
  // The Google Places Autocomplete was designed for text inputs, not select elements
  console.log('Autocomplete disabled - using city dropdowns instead');
}

document.getElementById('shipmentDate').value = new Date().toISOString().slice(0, 10);

document.getElementById('shipmentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('addAlert');
  try {
    const payload = {
      originCity: document.getElementById('originCity').value.trim(),
      destinationCity: document.getElementById('destinationCity').value.trim(),
      truckType: document.getElementById('truckType').value,
      fuelType: document.getElementById('fuelType').value,
      shipmentWeight: parseFloat(document.getElementById('shipmentWeight').value),
      shipmentDate: document.getElementById('shipmentDate').value,
      carrierName: document.getElementById('carrierName').value.trim()
    };
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    alertEl.innerHTML = `<div class="alert alert-success">Shipment added. CO₂: ${data.co2Emission?.toFixed(2)} kg, Distance: ${data.distance?.toFixed(0)} km</div>`;
    document.getElementById('shipmentForm').reset();
    document.getElementById('shipmentDate').value = new Date().toISOString().slice(0, 10);
    loadShipments();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});

document.getElementById('uploadZone')?.addEventListener('click', () => document.getElementById('bulkFile').click());
document.getElementById('bulkFile')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  const resultEl = document.getElementById('bulkResult');
  resultEl.innerHTML = '<p>Uploading...</p>';
  try {
    const res = await fetch('/api/shipments/bulk', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    resultEl.innerHTML = `<div class="alert alert-success">Uploaded: ${data.created} shipments. ${data.errors?.length ? 'Errors: ' + data.errors.length : ''}</div>`;
    loadShipments();
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
  e.target.value = '';
});

async function loadShipments() {
  try {
    const list = await fetch('/api/shipments?limit=50').then(r => r.json());
    const tbody = document.getElementById('shipmentsBody');
    if (!tbody) return;
    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${s.lane || s.originCity + ' → ' + s.destinationCity}</td>
        <td>${s.carrierName}</td>
        <td>${s.shipmentWeight} kg</td>
        <td>${s.distance?.toFixed(0) || '-'} km</td>
        <td>${s.co2Emission?.toFixed(2) || '-'}</td>
        <td>${s.shipmentDate ? new Date(s.shipmentDate).toLocaleDateString() : '-'}</td>
      </tr>
    `).join('') || '<tr><td colspan="6">No shipments yet. Add one above.</td></tr>';
  } catch (e) {
    document.getElementById('shipmentsBody').innerHTML = '<tr><td colspan="6">Could not load shipments.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAutocomplete();
  loadShipments();
  
  // Add city selection validation
  const originSelect = document.getElementById('originCity');
  const destSelect = document.getElementById('destinationCity');
  
  originSelect?.addEventListener('change', () => {
    if (destSelect) {
      // Enable destination select and update options
      destSelect.disabled = false;
      const selectedOrigin = originSelect.value;
      
      // Prevent selecting same city for destination
      Array.from(destSelect.options).forEach(option => {
        if (option.value === selectedOrigin) {
          option.disabled = true;
          option.textContent = option.value + ' (selected as origin)';
        } else {
          option.disabled = false;
          option.textContent = option.value.replace(' (selected as origin)', '');
        }
      });
    }
  });
  
  destSelect?.addEventListener('change', () => {
    if (originSelect) {
      const selectedDest = destSelect.value;
      
      // Prevent selecting same city for origin
      Array.from(originSelect.options).forEach(option => {
        if (option.value === selectedDest) {
          option.disabled = true;
          option.textContent = option.value + ' (selected as destination)';
        } else {
          option.disabled = false;
          option.textContent = option.value.replace(' (selected as destination)', '');
        }
      });
    }
  });
});
