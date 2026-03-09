module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'EvaFlow API is running',
    environment: process.env.NODE_ENV || 'development'
  });
};
