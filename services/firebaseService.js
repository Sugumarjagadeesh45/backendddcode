const admin = require('firebase-admin');

// Initialize Firebase Admin
let firebaseInitialized = false;

const initializeFirebase = () => {
  try {
    if (!firebaseInitialized) {
      // For development/testing, you can use the service account from environment variables
      // Or create a service account key file from Firebase Console
      
      // Method 1: Using environment variables (recommended for production)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
          universe_domain: "googleapis.com"
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Method 2: Using default configuration (for development)
        console.log('⚠️ Using default Firebase configuration');
        admin.initializeApp();
      }

      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
};

// Send notification to driver
const sendNotificationToDriver = async (driverId, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    // Get driver's FCM token from database
    const Driver = require('../models/driver/driver');
    const driver = await Driver.findOne({ driverId });
    
    if (!driver || !driver.fcmToken) {
      console.log(`❌ Driver ${driverId} not found or no FCM token`);
      return false;
    }

    const message = {
      token: driver.fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default'
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_priority_channel',
          sound: 'default',
          vibrateTimings: [0, 500, 500, 500],
          priority: 'max',
          defaultSound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification sent to driver ${driverId}:`, response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending notification to driver ${driverId}:`, error);
    return false;
  }
};

// Send notification to multiple drivers
const sendNotificationToMultipleDrivers = async (driverIds, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    const Driver = require('../models/driver/driver');
    const drivers = await Driver.find({ driverId: { $in: driverIds } });
    
    const validTokens = drivers
      .filter(driver => driver.fcmToken)
      .map(driver => driver.fcmToken);

    if (validTokens.length === 0) {
      console.log('❌ No valid FCM tokens found for drivers');
      return false;
    }

    const message = {
      tokens: validTokens,
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default'
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_priority_channel',
          sound: 'default',
          vibrateTimings: [0, 500, 500, 500],
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notifications sent to ${response.successCount} drivers`);
    return response;
  } catch (error) {
    console.error('❌ Error sending notifications to multiple drivers:', error);
    return false;
  }
};

module.exports = {
  initializeFirebase,
  sendNotificationToDriver,
  sendNotificationToMultipleDrivers
};