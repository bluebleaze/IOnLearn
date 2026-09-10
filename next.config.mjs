import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    'overstep-ungloved-subscript.ngrok-free.dev',
  ],

  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination:
          "https://uburubur-85adc.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};


export default nextConfig;