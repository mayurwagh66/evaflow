const MemoryStore = require('./services/memoryStore');
const { getDistance, getGeocode } = require('./services/distanceService');
const { calculateCO2, calculateCO2PerTonKm } = require('./config/emissionFactors');

async function addSampleData() {
  const sampleShipments = [
    {
      originCity: 'Mumbai',
      destinationCity: 'Delhi',
      truckType: 'Heavy',
      fuelType: 'Diesel',
      shipmentWeight: 5000,
      shipmentDate: new Date('2026-01-15'),
      carrierName: 'ABC Logistics'
    },
    {
      originCity: 'Delhi',
      destinationCity: 'Bangalore',
      truckType: 'Medium',
      fuelType: 'Diesel',
      shipmentWeight: 3500,
      shipmentDate: new Date('2026-01-20'),
      carrierName: 'XYZ Transport'
    },
    {
      originCity: 'Bangalore',
      destinationCity: 'Chennai',
      truckType: 'Light',
      fuelType: 'CNG',
      shipmentWeight: 2000,
      shipmentDate: new Date('2026-02-05'),
      carrierName: 'Green Freight'
    },
    {
      originCity: 'Mumbai',
      destinationCity: 'Hyderabad',
      truckType: 'Medium',
      fuelType: 'Diesel',
      shipmentWeight: 4500,
      shipmentDate: new Date('2026-02-10'),
      carrierName: 'ABC Logistics'
    },
    {
      originCity: 'Pune',
      destinationCity: 'Delhi',
      truckType: 'Heavy',
      fuelType: 'Diesel',
      shipmentWeight: 6000,
      shipmentDate: new Date('2026-02-15'),
      carrierName: 'Fast Cargo'
    },
    {
      originCity: 'Chennai',
      destinationCity: 'Kolkata',
      truckType: 'Medium',
      fuelType: 'Petrol',
      shipmentWeight: 4000,
      shipmentDate: new Date('2026-03-01'),
      carrierName: 'XYZ Transport'
    },
    {
      originCity: 'Delhi',
      destinationCity: 'Jaipur',
      truckType: 'Light',
      fuelType: 'Diesel',
      shipmentWeight: 1500,
      shipmentDate: new Date('2026-03-05'),
      carrierName: 'Green Freight'
    },
    {
      originCity: 'Mumbai',
      destinationCity: 'Ahmedabad',
      truckType: 'Medium',
      fuelType: 'CNG',
      shipmentWeight: 3000,
      shipmentDate: new Date('2026-03-08'),
      carrierName: 'ABC Logistics'
    }
  ];

  console.log('Adding sample shipment data...');
  
  for (const shipment of sampleShipments) {
    try {
      const { distance } = await getDistance(shipment.originCity, shipment.destinationCity);
      const co2 = calculateCO2(distance, shipment.shipmentWeight, shipment.truckType, shipment.fuelType, 1);
      const co2PerTonKm = calculateCO2PerTonKm(co2, distance, shipment.shipmentWeight);
      const originCoords = await getGeocode(shipment.originCity);
      const destinationCoords = await getGeocode(shipment.destinationCity);
      const lane = `${shipment.originCity} → ${shipment.destinationCity}`;

      await MemoryStore.create({
        ...shipment,
        originCoords: originCoords || {},
        destinationCoords: destinationCoords || {},
        distance,
        co2Emission: co2,
        co2PerTonKm,
        loadFactor: 1,
        lane
      });

      console.log(`✓ Added shipment: ${lane} (${distance.toFixed(0)}km, ${co2.toFixed(2)}kg CO₂)`);
    } catch (error) {
      console.error(`Error adding shipment ${shipment.originCity} → ${shipment.destinationCity}:`, error.message);
    }
  }

  console.log('\nSample data added successfully!');
  console.log('Charts should now be visible on the dashboard.');
}

// Run the function
addSampleData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error adding sample data:', error);
  process.exit(1);
});
