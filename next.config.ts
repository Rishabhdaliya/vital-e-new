import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Firebase variables
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    NEXT_PUBLIC_SKIP_OTP: process.env.NEXT_PUBLIC_SKIP_OTP,
    NEXT_PUBLIC_MSG91_WIDGET_ID: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
    NEXT_PUBLIC_MSG91_TOKEN_AUTH: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
    MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
    MSG91_OTP_TEMPLATE_ID: process.env.MSG91_OTP_TEMPLATE_ID,
  },
};

export default nextConfig;
