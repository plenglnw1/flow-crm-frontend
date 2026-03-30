import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBackendCsrf, backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');

	const url = new URL(request.url);
	const initialStageId = url.searchParams.get('stage_id') ?? undefined;

	const res = await fetch(`${API_URL}/api/sales/deals/create-data`, {
		headers: (() => {
			const headers: Record<string, string> = { Accept: 'application/json' };
			if (cookieHeader) headers.cookie = cookieHeader;
			return headers;
		})(),
		redirect: 'manual'
	});

	if (!res.ok) {
		return { customers: [], stages: [], initialStageId };
	}

	const data = (await res.json()) as {
		customers: Array<{ id: string; label: string }>;
		stages: Array<{ id: string; name: string; position: number; is_won: boolean }>;
	};

	return {
		customers: data.customers,
		stages: data.stages,
		initialStageId
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Missing API_URL or CSRF token' });
		}

		const formData = await request.formData();
		const body = new URLSearchParams();
		for (const [k, v] of formData.entries()) {
			body.append(k, String(v));
		}
		body.set('_token', csrfToken);

		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
			'X-CSRF-TOKEN': csrfToken
		};
		if (cookieHeader) headers.cookie = cookieHeader;

		const res = await fetch(`${API_URL}/deals`, {
			method: 'POST',
			redirect: 'manual',
			headers,
			body: body.toString()
		});

		const location = res.headers.get('location') ?? '';
		const looksLikeSuccess = location.includes('/pipeline-stages');

		if (!res.ok && res.status !== 302 && res.status !== 303) {
			const message = res.status === 403 ? 'ไม่มีสิทธิ์สร้างดีลให้ทีมอื่น' : 'Failed to create deal';
			return fail(res.status, { message });
		}

		if ((res.status === 302 || res.status === 303) && !looksLikeSuccess) {
			return fail(400, { message: 'Validation failed while creating deal' });
		}

		throw redirect(303, '/pipeline-stages');
	}
};

