/**
 * Configuración del Proyecto Firebase: MYJOBSBOT (myjobsbot)
 * Compatible con variables de entorno Vite (.env / VITE_*)
 */
export const FIREBASE_CONFIG = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'myjobsbot',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:556644044888:web:912f68db04cfe1d7d47a2d',
  androidAppId: import.meta.env.VITE_FIREBASE_ANDROID_APP_ID || '1:556644044888:android:fb2a5874cc47afc7d47a2d',
  iosAppId: import.meta.env.VITE_FIREBASE_IOS_APP_ID || '1:556644044888:ios:b84ca1f1a231303ad47a2d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'myjobsbot.firebasestorage.app',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBFWAKgBQawFYy5ku6UvWKK3HOoUWbNwYE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'myjobsbot.firebaseapp.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '556644044888',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-KFJ5TNVDEW',
  hostingUrl: import.meta.env.VITE_FIREBASE_HOSTING_URL || 'https://myjobsbot.web.app',
  firebaseAppUrl: import.meta.env.VITE_FIREBASE_APP_URL || 'https://myjobsbot.firebaseapp.com',
};
