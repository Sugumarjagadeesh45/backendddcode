// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const AdminUser = require('../models/adminUser');
const jwt = require('jsonwebtoken');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, password });
    
    // Find admin user by username (using email as username)
    const admin = await AdminUser.findOne({ username: email });
    console.log('👤 Found admin:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('❌ Admin not found with username:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await admin.validatePassword(password);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for admin:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', admin.username);
    
    res.json({
      token,
      role: admin.role,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/driver-status', (req, res) => {
  try {
    const drivers = Array.from(activeDriverSockets.values()).map(driver => ({
      driverId: driver.driverId,
      driverName: driver.driverName,
      status: driver.status,
      vehicleType: driver.vehicleType,
      location: driver.location,
      lastUpdate: driver.lastUpdate,
      socketId: driver.socketId
    }));

    res.json({
      totalDrivers: drivers.length,
      drivers: drivers
    });
  } catch (err) {
    console.error('Error fetching driver status:', err);
    res.status(500).json({ error: 'Failed to fetch driver status' });
  }
});

// Get current ride status
router.get('/ride-status', (req, res) => {
  try {
    const ridesList = Object.entries(rides).map(([rideId, ride]) => ({
      rideId,
      status: ride.status,
      userId: ride.userId,
      driverId: ride.driverId,
      driverName: ride.driverName,
      pickup: ride.pickup,
      drop: ride.drop,
      vehicleType: ride.vehicleType,
      timestamp: ride.timestamp,
      acceptedAt: ride.acceptedAt,
      completedAt: ride.completedAt
    }));

    res.json({
      totalRides: ridesList.length,
      rides: ridesList
    });
  } catch (err) {
    console.error('Error fetching ride status:', err);
    res.status(500).json({ error: 'Failed to fetch ride status' });
  }
});

// ================================
// Admin Controller Routes
// ================================

// User & Driver Management
router.get('/dashboard-data', adminController.getDashboardData);
router.get('/users', adminController.getUsers);
router.get('/drivers', adminController.getDrivers);
router.put('/driver/:id/toggle', adminController.toggleDriverStatus);

// Rides
router.get('/rides', adminController.getRides);
router.post('/ride/:rideId/assign', adminController.assignRide);

// Points & Stock
router.post('/user/:id/adjust-points', adminController.adjustUserPoints);
router.post('/grocery/adjust-stock', adminController.adjustGroceryStock);

module.exports = router;











// // routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');

// // User & Driver Management
// router.get('/dashboard-data', adminController.getDashboardData);
// router.get('/users', adminController.getUsers);
// router.get('/drivers', adminController.getDrivers);
// router.put('/driver/:id/toggle', adminController.toggleDriverStatus);

// // Rides
// router.get('/rides', adminController.getRides);
// router.post('/ride/:rideId/assign', adminController.assignRide);

// // Points & Stock
// router.post('/user/:id/adjust-points', adminController.adjustUserPoints);
// router.post('/grocery/adjust-stock', adminController.adjustGroceryStock);

// module.exports = router;
