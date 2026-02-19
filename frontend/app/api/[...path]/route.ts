import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side API proxy route.
 * Forwards all /api/* requests to the backend at runtime.
 * This solves the standalone mode issue where rewrites may not work correctly.
 */
const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = new URL(`/api/${path}`, BACKEND_URL);

    // Forward query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    // Build headers (forward relevant ones)
    const headers = new Headers();
    const forwardHeaders = ['content-type', 'authorization', 'accept', 'accept-language'];
    forwardHeaders.forEach((header) => {
        const value = request.headers.get(header);
        if (value) headers.set(header, value);
    });

    try {
        const fetchOptions: RequestInit = {
            method: request.method,
            headers,
        };

        // Forward body for non-GET/HEAD requests
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = request.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                fetchOptions.body = await request.text();
            } else if (contentType.includes('multipart/form-data')) {
                fetchOptions.body = await request.arrayBuffer();
                // Copy the full content-type header with boundary
                headers.set('content-type', contentType);
            } else {
                fetchOptions.body = await request.text();
            }
        }

        const response = await fetch(url.toString(), fetchOptions);

        // Build response with backend headers
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            // Skip hop-by-hop headers
            if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        const responseBody = await response.arrayBuffer();

        return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`[API Proxy] Failed to proxy /api/${path} to ${BACKEND_URL}:`, error);
        return NextResponse.json(
            { error: 'Backend service unavailable', detail: 'Could not connect to the API server.' },
            { status: 502 }
        );
    }
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: { path: string[] } }) {
    return proxyRequest(request, context);
}
