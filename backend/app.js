require('dotenv').config();

const express = require('express');
const cors = require('cors');
const requestLogger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Import route modules
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const goalRoutes = require('./src/routes/goals');
const workoutPlanRoutes = require('./src/routes/workoutPlans');
const exerciseRoutes = require('./src/routes/exercises');
const workoutRecordRoutes = require('./src/routes/workoutRecords');
const checkinRoutes = require('./src/routes/checkins');
const dietRecordRoutes = require('./src/routes/dietRecords');
const weightRecordRoutes = require('./src/routes/weightRecords');
const bodyMetricRoutes = require('./src/routes/bodyMetrics');
const courseRoutes = require('./src/routes/courses');
const notificationRoutes = require('./src/routes/notifications');
const pointRoutes = require('./src/routes/points');
const pointsMallRoutes = require('./src/routes/pointsMall');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ code: 0, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'ok' });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users/goals', goalRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-records', workoutRecordRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/diet-records', dietRecordRoutes);
app.use('/api/weight-records', weightRecordRoutes);
app.use('/api/body-metrics', bodyMetricRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/points-mall', pointsMallRoutes);

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({ code: 404, data: null, message: 'Route not found' });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[FitBuddy API] Server running on port ${PORT}`);
    console.log(`[FitBuddy API] Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
