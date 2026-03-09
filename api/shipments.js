module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.json([]);
  } else if (req.method === 'POST') {
    res.json({ message: 'Shipment created successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
