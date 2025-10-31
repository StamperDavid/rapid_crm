/**
 * Routes Index - Modular Route Organization
 *
 * Centralizes all route imports and mounts them to the main app.
 * This replaces the monolithic route definitions in server.js.
 */

const express = require('express');
const router = express.Router();

// Import modular route files
const companiesRoutes = require('./companies');
// const contactsRoutes = require('./contacts');
// const leadsRoutes = require('./leads');
// const dealsRoutes = require('./deals');
// const servicesRoutes = require('./services');
// const vehiclesRoutes = require('./vehicles');
// const driversRoutes = require('./drivers');
// const aiRoutes = require('./ai');

// Mount routes with API versioning
router.use('/companies', companiesRoutes);
// router.use('/contacts', contactsRoutes);
// router.use('/leads', leadsRoutes);
// router.use('/deals', dealsRoutes);
// router.use('/services', servicesRoutes);
// router.use('/vehicles', vehiclesRoutes);
// router.use('/drivers', driversRoutes);
// router.use('/ai', aiRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
