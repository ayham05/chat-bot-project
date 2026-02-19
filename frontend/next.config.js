/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Server-side runtime config (available in API routes)
    serverRuntimeConfig: {
        internalApiUrl: process.env.INTERNAL_API_URL || 'http://backend:8000',
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
