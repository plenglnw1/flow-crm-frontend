import { API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	if (!API_URL) {
		return new Response(JSON.stringify({ error: 'Missing API_URL' }), { status: 500 });
	}

	// Echo/Pusher calls this endpoint from the browser.
	// We forward the request + cookies to Laravel so broadcasting auth works cross-origin.
	const cookieHeader = request.headers.get('cookie');
	const contentType = request.headers.get('content-type') ?? 'application/json';
	const bodyText = await request.text();

	const res = await fetch(`${API_URL}/broadcasting/auth`, {
		method: 'POST',
		headers: {
			'Content-Type': contentType,
			...(cookieHeader ? { cookie: cookieHeader } : {})
		},
		body: bodyText
	});

	const resText = await res.text();

	return new Response(resText, {
		status: res.status,
		headers: {
			'Content-Type': res.headers.get('content-type') ?? 'application/json'
		}
	});
};

