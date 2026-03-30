import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBackendCsrf, backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ params, request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/sales/customers/${params.id}`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		return { customer: null };
	}

	const data = (await res.json()) as {
		customer: unknown;
	};

	return data;
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Missing API_URL or CSRF token' });
		}

		const formData = await request.formData();
		const isActive = formData.get('is_active');
		formData.set('is_active', isActive ? '1' : '0');

		// Method spoofing for Laravel PUT route
		formData.set('_method', 'PUT');
		formData.set('_token', csrfToken);

		const res = await fetch(`${API_URL}/api/sales/customers/${params.id}`, {
			method: 'POST',
			redirect: 'manual',
			headers: {
				Accept: 'application/json',
				'X-CSRF-TOKEN': csrfToken,
				...(cookieHeader ? { cookie: cookieHeader } : {})
			},
			body: formData
		});

		if (!res.ok) {
			const result = await res.json().catch(() => ({}));
			return fail(res.status, {
				error: true,
				message: result.message || 'Failed to update customer'
			});
		}

		throw redirect(303, `/customers/${params.id}`);
	}
};

