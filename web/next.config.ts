import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the app via LAN IP in development (phone / other device).
  // Without this, Next blocks /_next/* assets → blank white page + HMR WebSocket errors.
  allowedDevOrigins: [
    "192.168.0.111",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
