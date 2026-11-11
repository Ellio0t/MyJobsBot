import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elliotbarrios.myjobsbot',
  appName: 'JobsBOT',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#070709',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '556644044888-egfrv1scameefjqo6194qcf47eit6hrn.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
