import { getBackendCsrf, backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';
import { API_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);
	const csrfToken = await getBackendCsrf(cookieHeader);

	if (!API_URL || !csrfToken) {
		return json({ ok: false, error: 'Missing API_URL or CSRF' }, { status: 500 });
	}

	const body = (await request.json()) as { dealId: string; targetStageId: string };

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept: 'application/json',
		'X-CSRF-TOKEN': csrfToken
	};
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/sales/deals/${body.dealId}/move-stage`, {
		method: 'PUT',
		redirect: 'manual',
		headers,
		body: new URLSearchParams({ _token: csrfToken, stage_id: body.targetStageId }).toString()
	});

	if (!res.ok) {
		return json({ ok: false }, { status: 500 });
	}

	return json({ ok: true });
};

