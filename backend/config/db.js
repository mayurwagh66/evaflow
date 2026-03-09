const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use in-memory storage for now
    console.log('✓ Using in-memory storage (database disabled)');
  } catch (error) {
    console.error('Database setup error:', error.message);
  }
};

module.exports = connectDB;
