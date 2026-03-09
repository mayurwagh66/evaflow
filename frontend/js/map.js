let map;
let currentRoute = null;
let currentMarkers = [];

// Real city coordinates for Leaflet map
const cityCoordinates = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.7041, 77.1025],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Surat': [21.1702, 72.8311],
  'Lucknow': [26.8467, 80.9462],
  'Kanpur': [26.4499, 80.3319],
  'Nagpur': [21.1458, 79.0882],
  'Indore': [22.7196, 75.8577],
  'Bhopal': [23.2599, 77.4126],
  'Visakhapatnam': [17.6868, 83.2185],
  'Patna': [25.5941, 85.1376],
  'Vadodara': [22.3072, 73.1812],
  'Ludhiana': [30.9010, 75.8573],
  'Agra': [27.1767, 78.0081],
  'Nashik': [19.9975, 73.7898],
  'Varanasi': [25.3176, 82.9739],
  'Jodhpur': [26.2389, 73.0243],
  'Raipur': [21.2514, 81.6296],
  'Coimbatore': [11.0168, 76.9558],
  'Vijayawada': [16.5062, 80.6480],
  'Guwahati': [26.1445, 91.7362],
  'Chandigarh': [30.7333, 76.7794],
  'Kochi': [9.9674, 76.2456],
  'Bhubaneswar': [20.2961, 85.8245]
};

// Realistic road waypoints for major routes (following actual Google Maps highway patterns)
const roadRoutes = {
  'Mumbai → Delhi': [
    [19.0760, 72.8777], // Mumbai
    [19.0836, 72.8424], // Mumbai - NH48 start
    [19.9975, 73.7898], // Nashik - NH48
    [20.5937, 78.9629], // Central India - NH44
    [21.1458, 79.0882], // Nagpur - NH44
    [23.2599, 77.4126], // Bhopal - NH44
    [26.9124, 75.7873], // Jaipur - NH48
    [28.7041, 77.1025]  // Delhi
  ],
  'Delhi → Bangalore': [
    [28.7041, 77.1025], // Delhi
    [28.6139, 77.2090], // Delhi - NH44 start
    [27.1767, 78.0081], // Agra - NH44
    [26.8467, 80.9462], // Lucknow - NH27
    [25.3176, 82.9739], // Varanasi - NH19
    [23.8105, 80.8984], // Rewa - NH39
    [21.2514, 81.6296], // Raipur - NH53
    [17.3850, 78.4867], // Hyderabad - NH44
    [15.3173, 76.7340], // Kurnool - NH44
    [12.9716, 77.5946]  // Bangalore
  ],
  'Bangalore → Chennai': [
    [12.9716, 77.5946], // Bangalore
    [12.8424, 77.6797], // Bangalore - NH4 start
    [12.3418, 78.4756], // Hosur - NH4
    [12.5166, 78.7654], // Krishnagiri - NH4
    [13.0827, 80.2707]  // Chennai
  ],
  'Mumbai → Hyderabad': [
    [19.0760, 72.8777], // Mumbai
    [19.0836, 72.8424], // Mumbai - NH65 start
    [18.5204, 73.8567], // Pune - NH65
    [18.6205, 73.7956], // Pune - NH9
    [17.6730, 75.9074], // Solapur - NH65
    [17.3850, 78.4867]  // Hyderabad
  ],
  'Pune → Delhi': [
    [18.5204, 73.8567], // Pune
    [19.9975, 73.7898], // Nashik - NH48
    [21.1458, 79.0882], // Nagpur - NH44
    [23.2599, 77.4126], // Bhopal - NH44
    [26.9124, 75.7873], // Jaipur - NH48
    [28.7041, 77.1025]  // Delhi
  ],
  'Chennai → Kolkata': [
    [13.0827, 80.2707], // Chennai
    [13.6288, 79.4189], // Nellore - NH16
    [16.5062, 80.6480], // Vijayawada - NH16
    [17.6868, 83.2185], // Visakhapatnam - NH16
    [19.8135, 84.7986], // Berhampur - NH16
    [21.5142, 86.9346], // Cuttack - NH16
    [22.5726, 88.3639]  // Kolkata
  ],
  'Delhi → Jaipur': [
    [28.7041, 77.1025], // Delhi
    [28.6139, 77.2090], // Delhi - NH48 start
    [27.1767, 78.0081], // Agra - NH48
    [26.9124, 75.7873]  // Jaipur
  ],
  'Mumbai → Ahmedabad': [
    [19.0760, 72.8777], // Mumbai
    [19.0836, 72.8424], // Mumbai - NH48 start
    [21.1702, 72.8311], // Surat - NH48
    [23.0225, 72.5714]  // Ahmedabad
  ],
  'Delhi → Chennai': [
    [28.7041, 77.1025], // Delhi
    [28.6139, 77.2090], // Delhi - NH44 start
    [26.8467, 80.9462], // Lucknow - NH27
    [25.3176, 82.9739], // Varanasi - NH19
    [23.8105, 80.8984], // Rewa - NH39
    [21.2514, 81.6296], // Raipur - NH53
    [17.6868, 83.2185], // Visakhapatnam - NH16
    [13.6288, 79.4189], // Nellore - NH16
    [13.0827, 80.2707]  // Chennai
  ],
  'Bangalore → Mumbai': [
    [12.9716, 77.5946], // Bangalore
    [15.3173, 76.7340], // Kurnool - NH44
    [17.3850, 78.4867], // Hyderabad - NH44
    [17.6730, 75.9074], // Solapur - NH65
    [18.5204, 73.8567], // Pune - NH48
    [19.0760, 72.8777]  // Mumbai
  ],
  'Hyderabad → Delhi': [
    [17.3850, 78.4867], // Hyderabad
    [21.2514, 81.6296], // Raipur - NH53
    [23.2599, 77.4126], // Bhopal - NH44
    [26.9124, 75.7873], // Jaipur - NH48
    [28.7041, 77.1025]  // Delhi
  ],
  'Kolkata → Delhi': [
    [22.5726, 88.3639], // Kolkata
    [21.5142, 86.9346], // Cuttack - NH16
    [19.8135, 84.7986], // Berhampur - NH16
    [17.6868, 83.2185], // Visakhapatnam - NH16
    [17.3850, 78.4867], // Hyderabad - NH44
    [23.2599, 77.4126], // Bhopal - NH44
    [26.9124, 75.7873], // Jaipur - NH48
    [28.7041, 77.1025]  // Delhi
  ],
  'Chennai → Bangalore': [
    [13.0827, 80.2707], // Chennai
    [12.5166, 78.7654], // Krishnagiri - NH4
    [12.3418, 78.4756], // Hosur - NH4
    [12.8424, 77.6797], // Bangalore - NH4
    [12.9716, 77.5946]  // Bangalore
  ]
};

function initMap() {
  // Initialize Leaflet map centered on India
  map = L.map('map').setView([20.5937, 78.9629], 5);
  
  // Add OpenStreetMap tiles (Google Maps-like appearance)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Don't add any markers or routes initially
}

function clearMap() {
  // Remove current route if exists
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
  
  // Remove all markers
  currentMarkers.forEach(marker => map.removeLayer(marker));
  currentMarkers = [];
}

function showRoadRoute(origin, destination, emissions, distance) {
  const routeInfo = document.getElementById('routeInfo');
  
  // Clear existing map elements
  clearMap();
  
  const routeKey = `${origin} → ${destination}`;
  const waypoints = roadRoutes[routeKey] || [cityCoordinates[origin], cityCoordinates[destination]];
  
  // Create realistic road route (Google Maps style)
  currentRoute = L.polyline(waypoints, {
    color: '#34A853', // Google Maps green
    weight: 6,
    opacity: 0.9,
    smoothFactor: 1,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);
  
  // Add origin and destination markers
  if (cityCoordinates[origin]) {
    const originMarker = L.marker(cityCoordinates[origin])
      .addTo(map)
      .bindPopup(`<strong>Origin: ${origin}</strong>`);
    currentMarkers.push(originMarker);
  }
  
  if (cityCoordinates[destination]) {
    const destMarker = L.marker(cityCoordinates[destination])
      .addTo(map)
      .bindPopup(`<strong>Destination: ${destination}</strong>`);
    currentMarkers.push(destMarker);
  }
  
  // Pan to the route
  const bounds = currentRoute.getBounds();
  map.fitBounds(bounds, { padding: [50, 50] });
  
  // Update route info
  routeInfo.innerHTML = `
    <h3>📍 Route Information</h3>
    <div class="stat">
      <span class="stat-label">Route:</span>
      <span class="stat-value">${origin} → ${destination}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Distance:</span>
      <span class="stat-value">${distance?.toFixed(0) || 'N/A'} km</span>
    </div>
    <div class="stat">
      <span class="stat-label">CO₂ Emissions:</span>
      <span class="stat-value">${emissions?.toFixed(2) || 'N/A'} kg</span>
    </div>
    <div class="stat">
      <span class="stat-label">Efficiency:</span>
      <span class="stat-value">${((emissions / (distance || 1)) * 1000).toFixed(2)} g/km</span>
    </div>
    <div class="stat">
      <span class="stat-label">Route Type:</span>
      <span class="stat-value" style="color: #34A853;">🛣️ Road Route</span>
    </div>
  `;
}

async function loadLanes() {
  try {
    const lanes = await fetch('/api/lanes/analytics').then(r => r.json());
    const sel = document.getElementById('laneSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select lane --</option>' + (lanes || []).map(l => {
      const lane = (l.lane || l._id || '').replace(/"/g, '&quot;');
      return `<option value="${lane}">${l.lane || l._id} (${l.totalEmissions?.toFixed(0)} kg CO₂)</option>`;
    }).join('');
  } catch (e) {
    console.error('Lanes load error:', e);
  }
}

document.getElementById('loadRoute')?.addEventListener('click', async () => {
  const val = document.getElementById('laneSelect')?.value;
  if (!val) return;
  
  const parts = val.replace(/&quot;/g, '"').split(' → ');
  const origin = parts[0]?.trim();
  const dest = parts[1]?.trim();
  
  if (!origin || !dest) return;
  
  // Get lane data
  try {
    const lanes = await fetch('/api/lanes/analytics').then(r => r.json());
    const laneData = lanes.find(l => (l.lane || l._id) === val);
    const emissions = laneData?.totalEmissions || 0;
    const distance = laneData?.totalDistance || 0;
    
    showRoadRoute(origin, dest, emissions, distance);
  } catch (e) {
    console.error('Error loading lane data:', e);
    showRoadRoute(origin, dest, 0, 0);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadLanes();
});
