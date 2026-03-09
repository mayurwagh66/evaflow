const axios = require('axios');

const getDistance = async (origin, destination) => {
  // Mock distance calculation for demo purposes (no billing required)
  const mockDistances = {
    'mumbai-delhi': 1420,
    'delhi-mumbai': 1420,
    'mumbai-bangalore': 980,
    'bangalore-mumbai': 980,
    'delhi-bangalore': 2100,
    'bangalore-delhi': 2100,
    'mumbai-chennai': 1330,
    'chennai-mumbai': 1330,
    'delhi-chennai': 2180,
    'chennai-delhi': 2180,
    'mumbai-kolkata': 1650,
    'kolkata-mumbai': 1650,
    'delhi-kolkata': 1460,
    'kolkata-delhi': 1460,
    'bangalore-chennai': 350,
    'chennai-bangalore': 350,
    'hyderabad-mumbai': 710,
    'mumbai-hyderabad': 710,
    'hyderabad-bangalore': 570,
    'bangalore-hyderabad': 570,
    'hyderabad-delhi': 1260,
    'delhi-hyderabad': 1260,
    'pune-mumbai': 150,
    'mumbai-pune': 150,
    'ahmedabad-mumbai': 530,
    'mumbai-ahmedabad': 530,
    'jaipur-delhi': 270,
    'delhi-jaipur': 270,
    'lucknow-delhi': 550,
    'delhi-lucknow': 550,
    'surat-mumbai': 300,
    'mumbai-surat': 300,
    'kanpur-delhi': 480,
    'delhi-kanpur': 480,
    'nagpur-mumbai': 820,
    'mumbai-nagpur': 820,
    'indore-mumbai': 590,
    'mumbai-indore': 590,
  };
  
  const key = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const reverseKey = `${destination.toLowerCase()}-${origin.toLowerCase()}`;
  
  let distance = mockDistances[key] || mockDistances[reverseKey];
  
  // If no exact match, generate realistic distance based on city names
  if (!distance) {
    const cityHash = origin.length + destination.length;
    distance = Math.abs(Math.sin(cityHash) * 1500) + 200; // 200-1700 km range
  }
  
  return {
    distance: Math.round(distance),
    duration: Math.round(distance * 2) // Mock duration (2 min per km)
  };
};

const getGeocode = async (address) => {
  // Mock geocoding for demo purposes
  const mockCoords = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'indore': { lat: 22.7196, lng: 75.8577 },
    'thane': { lat: 19.2183, lng: 72.9781 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'vadodara': { lat: 22.3072, lng: 73.1812 },
    'ghaziabad': { lat: 28.6692, lng: 77.4538 },
    'ludhiana': { lat: 30.9010, lng: 75.8573 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'nashik': { lat: 19.9975, lng: 73.7898 },
    'faridabad': { lat: 28.4089, lng: 77.3178 },
    'meerut': { lat: 28.9845, lng: 77.7064 },
    'rajkot': { lat: 22.3039, lng: 70.8022 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'srinagar': { lat: 34.0837, lng: 74.7973 },
    'dhanbad': { lat: 23.7957, lng: 86.4304 },
    'jodhpur': { lat: 26.2389, lng: 73.0243 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    'raipur': { lat: 21.2514, lng: 81.6296 },
    'allahabad': { lat: 25.4358, lng: 81.8463 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'vijayawada': { lat: 16.5062, lng: 80.6480 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'guwahati': { lat: 26.1445, lng: 91.7362 },
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'hubli-dharwad': { lat: 15.3647, lng: 75.1240 },
    'mysore': { lat: 12.2958, lng: 76.6394 },
    'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
    'salem': { lat: 11.6643, lng: 78.1460 },
    'tiruppur': { lat: 11.1085, lng: 77.3411 },
    'gurgaon': { lat: 28.4595, lng: 77.0266 },
    'bhiwandi': { lat: 19.2971, lng: 73.0467 },
    'jalandhar': { lat: 31.3260, lng: 75.5762 },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    'navi mumbai': { lat: 19.0331, lng: 73.0297 },
    'ranchi': { lat: 23.3441, lng: 85.3096 },
    'amravati': { lat: 20.9333, lng: 77.7546 },
    'kochi': { lat: 9.9674, lng: 76.2456 },
    'kota': { lat: 25.2138, lng: 75.8648 },
    'kolhapur': { lat: 16.7030, lng: 74.2433 },
    'bhilai': { lat: 21.1891, lng: 81.2748 },
    'ajmer': { lat: 26.4499, lng: 74.6399 },
    'gwalior': { lat: 26.2124, lng: 78.1809 },
    'ujjain': { lat: 23.1825, lng: 75.6572 },
    'jammu': { lat: 32.7266, lng: 74.8570 },
    'tirupati': { lat: 13.6288, lng: 79.4192 },
    'gorakhpur': { lat: 26.7537, lng: 83.3730 },
    'bareilly': { lat: 28.3670, lng: 79.4304 },
    'moradabad': { lat: 28.8356, lng: 78.7708 },
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    'bikaner': { lat: 28.0229, lng: 73.3119 },
    'siliguri': { lat: 26.7271, lng: 88.3958 },
    'panipat': { lat: 29.3909, lng: 76.9695 },
    'aligarh': { lat: 27.8876, lng: 78.0801 },
    'jamshedpur': { lat: 22.8046, lng: 86.2023 },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'dehradun': { lat: 30.3165, lng: 78.0322 },
    'cuttack': { lat: 20.4625, lng: 85.8830 },
    'firozabad': { lat: 27.1477, lng: 78.4117 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    'rourkela': { lat: 22.2528, lng: 84.8836 },
    'durgapur': { lat: 23.5486, lng: 87.2318 },
    'vapi': { lat: 20.3710, lng: 72.9083 },
    'bokaro': { lat: 23.2914, lng: 86.1520 }
  };
  
  const city = address.toLowerCase();
  return mockCoords[city] || { 
    lat: Math.random() * 20 + 10, // Random lat between 10-30 (India range)
    lng: Math.random() * 30 + 70  // Random lng between 70-100 (India range)
  };
};

module.exports = { getDistance, getGeocode };
