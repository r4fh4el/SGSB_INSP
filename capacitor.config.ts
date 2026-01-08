import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.sgsb.inspecao",
  appName: "SGSB Inspeção",
  webDir: "dist/public",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  environment: {
    VITE_APP_TITLE: "SGSB Inspeção",
    VITE_APP_LOGO: "/favicon.png",
    VITE_ANALYTICS_ENDPOINT: "",
    VITE_ANALYTICS_WEBSITE_ID: "",
    VITE_OAUTH_PORTAL_URL: "/app-auth",
    VITE_APP_ID: "offline",
    VITE_OFFLINE_AUTH: "true",
  },
};

export default config;
