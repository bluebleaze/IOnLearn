/** @type {import('next').NextConfig} */
const nextConfig = {

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