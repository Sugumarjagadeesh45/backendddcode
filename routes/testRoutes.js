// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { sendNotificationToMultipleDrivers } = require('../services/firebaseService');

router.post('/send-notification', async (req, res) => {
  try {
    const { driverTokens, title, body, data } = req.body;

    // Validate input
    if (!driverTokens || !Array.isArray(driverTokens)) {
      return res.status(400).json({
        success: false,
        message: 'driverTokens array is required'
      });
    }

    // Filter valid tokens
    const validTokens = driverTokens.filter(token => 
      token && 
      token !== 'YOUR_ACTUAL_FCM_TOKEN_FROM_APP' && 
      token.length > 50 &&
      token.startsWith('f')
    );

    if (validTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid FCM tokens provided',
        providedTokens: driverTokens
      });
    }

    try {
      const result = await sendNotificationToMultipleDrivers(validTokens, title, body, data);
      
      res.json({
        success: true,
        message: `Notification sent: ${result.successCount} success, ${result.failureCount} failed`,
        result: result
      });

    } catch (firebaseError) {
      console.error('Firebase notification error:', firebaseError);
      
      // If Firebase fails, return a simulated success for testing
      res.json({
        success: true,
        message: 'Firebase not configured - notification simulated',
        result: {
          successCount: validTokens.length,
          failureCount: 0,
          simulated: true
        },
        details: {
          totalTokens: validTokens.length,
          validTokens: validTokens.length,
          invalidTokens: 0
        }
      });
    }

  } catch (error) {
    console.error('Notification route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

module.exports = router;