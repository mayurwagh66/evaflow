module.exports = (req, res) => {
  res.json({
    totalEmissions: 0,
    shipmentsCount: 0,
    averageEmissionPerShipment: 0
  });
};
