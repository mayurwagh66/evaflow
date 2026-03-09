const express = require('express');
const router = express.Router();
const MemoryStore = require('../services/memoryStore');
const { getDistance, getGeocode } = require('../services/distanceService');
const { calculateCO2, calculateCO2PerTonKm } = require('../config/emissionFactors');
const upload = require('../middleware/upload');
const xlsx = require('xlsx');

// Add single shipment
router.post('/', async (req, res) => {
  try {
    const { originCity, destinationCity, truckType, fuelType, shipmentWeight, shipmentDate, carrierName, loadFactor } = req.body;

    if (!originCity || !destinationCity || !truckType || !fuelType || !shipmentWeight || !shipmentDate || !carrierName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { getDistance } = require('../services/distanceService');
    const { distance } = await getDistance(originCity, destinationCity);

    const weight = parseFloat(shipmentWeight);
    const loadF = loadFactor ? parseFloat(loadFactor) : 1;
    const co2 = calculateCO2(distance, weight, truckType, fuelType, loadF);
    const co2PerTonKm = calculateCO2PerTonKm(co2, distance, weight);

    const originCoords = await getGeocode(originCity);
    const destinationCoords = await getGeocode(destinationCity);
    const lane = `${originCity} → ${destinationCity}`;

    const shipment = await MemoryStore.create({
      originCity,
      originCoords: originCoords || {},
      destinationCity,
      destinationCoords: destinationCoords || {},
      truckType,
      fuelType,
      shipmentWeight: weight,
      shipmentDate: new Date(shipmentDate),
      carrierName,
      distance,
      co2Emission: co2,
      co2PerTonKm,
      loadFactor: loadF,
      lane
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error('Add shipment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk upload CSV/Excel
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = req.file.originalname.toLowerCase().split('.').pop();
    let rows = [];

    if (ext === 'csv') {
      const { parse } = require('csv-parse/sync');
      const fs = require('fs');
      const content = fs.readFileSync(req.file.path, 'utf-8');
      rows = parse(content, { columns: true, skip_empty_lines: true });
    } else {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet);
    }

    const { getDistance } = require('../services/distanceService');
    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const originCity = row.origin || row.originCity || row.Origin;
      const destinationCity = row.destination || row.destinationCity || row.Destination;
      const truckType = row.truckType || row.truck_type || row['Truck Type'] || 'Medium';
      const fuelType = row.fuelType || row.fuel_type || row['Fuel Type'] || 'Diesel';
      const shipmentWeight = parseFloat(row.shipmentWeight || row.weight || row.Weight || 0);
      const shipmentDate = row.shipmentDate || row.date || row.Date;
      const carrierName = row.carrierName || row.carrier || row.Carrier || 'Unknown';

      if (!originCity || !destinationCity || !shipmentDate || !shipmentWeight) {
        errors.push({ row: i + 1, reason: 'Missing required fields' });
        continue;
      }

      try {
        const { distance } = await getDistance(originCity, destinationCity);
        const co2 = calculateCO2(distance, shipmentWeight, truckType, fuelType, 1);
        const co2PerTonKm = calculateCO2PerTonKm(co2, distance, shipmentWeight);
        const lane = `${originCity} → ${destinationCity}`;

        const shipment = await MemoryStore.create({
          originCity,
          destinationCity,
          truckType,
          fuelType,
          shipmentWeight,
          shipmentDate: new Date(shipmentDate),
          carrierName,
          distance,
          co2Emission: co2,
          co2PerTonKm,
          loadFactor: 1,
          lane
        });
        created.push(shipment);
      } catch (e) {
        errors.push({ row: i + 1, reason: e.message });
      }
    }

    const fs = require('fs');
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({ created: created.length, errors, shipments: created });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, carrier, lane, limit = 100 } = req.query;
    const filter = {};
    if (startDate) filter.shipmentDate = { $gte: new Date(startDate) };
    if (endDate) filter.shipmentDate = { ...filter.shipmentDate, $lte: new Date(endDate) };
    if (carrier) filter.carrierName = new RegExp(carrier, 'i');
    if (lane) filter.lane = new RegExp(lane, 'i');

    const shipments = await MemoryStore.find(filter);
    const limitedShipments = shipments.slice(0, parseInt(limit));
    res.json(limitedShipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shipment by ID
router.get('/:id', async (req, res) => {
  try {
    const shipment = await MemoryStore.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete shipment
router.delete('/:id', async (req, res) => {
  try {
    const shipment = await MemoryStore.findByIdAndDelete(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ message: 'Shipment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
