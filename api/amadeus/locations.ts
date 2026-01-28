export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const url = new URL(request.url);
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Authorization header required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const amadeusUrl = `https://test.api.amadeus.com/v1/reference-data/locations${url.search}`;

        const response = await fetch(amadeusUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to search locations' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    }
}
