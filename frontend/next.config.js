/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Server-side runtime config (available in API routes)
    serverRuntimeConfig: {
        internalApiUrl: process.env.INTERNAL_API_URL || 'http://backend:8000',
    },
};

module.exports = nextConfig;

