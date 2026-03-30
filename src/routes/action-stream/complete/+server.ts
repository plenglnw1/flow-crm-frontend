import { API_URL } from '$env/static/private';
import { backendCookieHeaderFromRequest, getBackendCsrf } from '$lib/server/backend-proxy.server';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);
	const csrfToken = await getBackendCsrf(cookieHeader);

	if (!API_URL || !csrfToken) {
		return json({ ok: false, error: 'Missing API_URL or CSRF token' }, { status: 500 });
	}

	const body = (await request.json()) as { activityId: string };

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept: 'application/json',
		'X-CSRF-TOKEN': csrfToken
	};
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/sales/activities/${body.activityId}/complete`, {
		method: 'POST',
		redirect: 'manual',
		headers,
		body: new URLSearchParams({ _token: csrfToken }).toString()
	});

	return json({ ok: res.ok });
};

