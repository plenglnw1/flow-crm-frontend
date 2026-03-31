import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getBackendCsrf,
	backendCookieHeaderFromRequest
} from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ request, params }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);
	const dealId = params.id;

	const res = await fetch(`${API_URL}/api/sales/deals/${dealId}/edit-data`, {
		headers: (() => {
			const headers: Record<string, string> = { Accept: 'application/json' };
			if (cookieHeader) headers.cookie = cookieHeader;
			return headers;
		})(),
		redirect: 'manual'
	});

	if (!res.ok) {
		return { deal: null, customers: [], stages: [], activities: [] };
	}

	const data = await res.json();

	return {
		deal: data.deal,
		customers: data.customers,
		stages: data.stages,
		activities: data.activities
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const dealId = params.id;
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
		body.set('_method', 'PUT');

		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
			'X-CSRF-TOKEN': csrfToken
		};
		if (cookieHeader) headers.cookie = cookieHeader;

		const res = await fetch(`${API_URL}/deals/${dealId}`, {
			method: 'POST',
			redirect: 'manual',
			headers,
			body: body.toString()
		});

		const location = res.headers.get('location') ?? '';
		const looksLikeSuccess = location.includes('/pipeline-stages');

		if (!res.ok && res.status !== 302 && res.status !== 303) {
			const message =
				res.status === 403
					? 'You cannot edit this deal'
					: 'Failed to update deal';
			return fail(res.status, { message });
		}

		if ((res.status === 302 || res.status === 303) && !looksLikeSuccess) {
			return fail(400, { message: 'Validation failed while updating deal' });
		}

		// Stay on edit page so the layout stays consistent and load() refetches fresh deal data.
		throw redirect(303, `/deals/${dealId}/edit?saved=1`);
	},

	delete: async ({ request, params }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const dealId = params.id;
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Missing API_URL or CSRF token' });
		}

		const body = new URLSearchParams();
		body.set('_token', csrfToken);
		body.set('_method', 'DELETE');

		const headers: Record<string, string> = {
			Accept: 'application/json',
			'X-CSRF-TOKEN': csrfToken,
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		if (cookieHeader) headers.cookie = cookieHeader;

		const res = await fetch(`${API_URL}/deals/${dealId}`, {
			method: 'POST',
			redirect: 'manual',
			headers,
			body: body.toString()
		});

		const location = res.headers.get('location') ?? '';
		const looksLikeSuccess = location.includes('/pipeline-stages');

		if (!res.ok && res.status !== 302 && res.status !== 303) {
			const message =
				res.status === 403
					? 'You cannot delete this deal'
					: 'Failed to delete deal';
			return fail(res.status, { message });
		}

		if ((res.status === 302 || res.status === 303) && !looksLikeSuccess) {
			return fail(400, { message: 'Delete failed' });
		}

		throw redirect(303, '/pipeline-stages');
	}
};

