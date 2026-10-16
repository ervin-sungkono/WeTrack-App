import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {},
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      pathname: storageBucket ? `/v0/b/${storageBucket}/o/**` : '/v0/b/**',
    }],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})(nextConfig);
