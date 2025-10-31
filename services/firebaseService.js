// services/firebaseService.js
const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    console.log('✅ Firebase already initialized');
    return;
  }

  try {
    // Check if Firebase app already exists
    if (admin.apps.length > 0) {
      console.log('✅ Firebase app already exists');
      firebaseInitialized = true;
      return;
    }

    // Method 1: Try with service account from environment
    if (process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const serviceAccount = {
          type: process.env.FIREBASE_TYPE || 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized with service account');
        return;
      } catch (serviceAccountError) {
        console.log('❌ Service account initialization failed, trying alternative...');
      }
    }

    // Method 2: Try with application default credentials
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized with application default credentials');
    } catch (defaultError) {
      console.error('❌ Application default credentials also failed');
      throw defaultError;
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw error;
  }
};

const sendNotificationToMultipleDrivers = async (driverTokens, title, body, data = {}) => {
  try {
    // Ensure Firebase is initialized
    initializeFirebase();

    if (!driverTokens || driverTokens.length === 0) {
      throw new Error('No driver tokens provided');
    }

    // Filter valid tokens
    const validTokens = driverTokens.filter(token => 
      token && 
      token !== 'YOUR_ACTUAL_FCM_TOKEN_FROM_APP' && 
      token.length > 50 &&
      token.startsWith('f')
    );

    if (validTokens.length === 0) {
      console.log('❌ No valid FCM tokens found');
      return {
        successCount: 0,
        failureCount: driverTokens.length,
        error: 'No valid FCM tokens provided'
      };
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      tokens: validTokens,
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log('📧 FCM Response:', {
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };

  } catch (error) {
    console.error('❌ Error sending FCM notifications:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  sendNotificationToMultipleDrivers
};