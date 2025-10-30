// In your existing routes or create new file routes/notificationRoutes.js
router.post('/drivers/update-fcm-token', auth, async (req, res) => {
  try {
    const { driverId } = req.user;
    const { fcmToken } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { driverId },
      { fcmToken, lastUpdate: new Date() },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    res.json({ success: true, message: "FCM token updated successfully" });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ success: false, message: "Failed to update FCM token" });
  }
});