/**
 * Emission factors in kg CO2 per ton-km
 * Based on truck type and fuel type combinations
 * Source: EPA, DEFRA, and logistics industry standards
 */
const EMISSION_FACTORS = {
  Mini: {
    Diesel: 0.165,
    Petrol: 0.195,
    CNG: 0.120,
    LNG: 0.105,
    Electric: 0.025
  },
  Light: {
    Diesel: 0.125,
    Petrol: 0.150,
    CNG: 0.095,
    LNG: 0.085,
    Electric: 0.022
  },
  Medium: {
    Diesel: 0.095,
    Petrol: 0.115,
    CNG: 0.075,
    LNG: 0.065,
    Electric: 0.020
  },
  Heavy: {
    Diesel: 0.075,
    Petrol: 0.092,
    CNG: 0.062,
    LNG: 0.055,
    Electric: 0.018
  },
  Trailer: {
    Diesel: 0.062,
    Petrol: 0.078,
    CNG: 0.052,
    LNG: 0.048,
    Electric: 0.015
  }
};

/**
 * Calculate CO2 emission in kg
 * Formula: CO2 = Distance (km) × Weight (tons) × Emission Factor × Load Factor
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} weightKg - Weight in kilograms
 * @param {string} truckType - Truck type
 * @param {string} fuelType - Fuel type
 * @param {number} loadFactor - Load utilization 0-1 (default 1)
 */
function calculateCO2(distanceKm, weightKg, truckType, fuelType, loadFactor = 1) {
  const factor = EMISSION_FACTORS[truckType]?.[fuelType] || EMISSION_FACTORS.Medium.Diesel;
  const weightTons = weightKg / 1000;
  const co2 = distanceKm * weightTons * factor * (1 / Math.max(loadFactor, 0.1));
  return Math.round(co2 * 100) / 100;
}

/**
 * Calculate CO2 per ton-km (efficiency metric)
 */
function calculateCO2PerTonKm(co2Kg, distanceKm, weightKg) {
  const tonKm = (weightKg / 1000) * distanceKm;
  if (tonKm === 0) return 0;
  return Math.round((co2Kg / tonKm) * 10000) / 10000;
}

module.exports = {
  EMISSION_FACTORS,
  calculateCO2,
  calculateCO2PerTonKm
};
