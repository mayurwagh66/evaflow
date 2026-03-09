const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  originCity: { type: String, required: true },
  originCoords: { lat: Number, lng: Number },
  destinationCity: { type: String, required: true },
  destinationCoords: { lat: Number, lng: Number },
  truckType: { type: String, enum: ['Mini', 'Light', 'Medium', 'Heavy', 'Trailer'], required: true },
  fuelType: { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'LNG', 'Electric'], required: true },
  shipmentWeight: { type: Number, required: true }, // in kg
  shipmentDate: { type: Date, required: true },
  carrierName: { type: String, required: true },
  distance: { type: Number, default: 0 }, // in km
  co2Emission: { type: Number, default: 0 }, // in kg
  co2PerTonKm: { type: Number, default: 0 },
  loadFactor: { type: Number, default: 1 }, // utilization 0-1
  lane: { type: String, default: '' }, // "Origin → Destination"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

shipmentSchema.index({ shipmentDate: 1 });
shipmentSchema.index({ lane: 1 });
shipmentSchema.index({ carrierName: 1 });
shipmentSchema.index({ originCity: 1, destinationCity: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
