import { API_URL } from '$env/static/private';
import { getBackendCsrf, backendCookieHeaderFromRequest, copyBackendSetCookies } from '$lib/server/backend-proxy.server';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);
	const csrfToken = await getBackendCsrf(cookieHeader);

	if (!API_URL || !csrfToken) {
		return json({ ok: false, error: 'Missing API_URL or CSRF token' }, { status: 500 });
	}

	const body = (await request.json()) as { dealId: string };

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept: 'application/json',
		'X-CSRF-TOKEN': csrfToken
	};
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/deals/${body.dealId}`, {
		method: 'POST',
		redirect: 'manual',
		headers,
		body: new URLSearchParams({ _token: csrfToken, _method: 'DELETE' }).toString()
	});

	// Keep session/CSRF in sync if backend rotates cookies
	copyBackendSetCookies(cookies, res);

	// Laravel destroy returns redirect (302/303). Count those as success.
	if (!res.ok && !(res.status === 302 || res.status === 303)) {
		return json({ ok: false }, { status: 500 });
	}

	return json({ ok: true });
};

