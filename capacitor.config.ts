import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elliotbarrios.myjobsbot',
  appName: 'MYJOBSBOT',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#111111',
      showSpinner: false,
    },
  },
};

export default config;
