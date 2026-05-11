require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { scheduleDailyRefresh } = require('./services/currencyService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Background jobs
  scheduleDailyRefresh();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
