import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	backendCookieHeaderFromRequest,
	copyBackendSetCookies,
	getBackendCsrf
} from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, cookies }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Server configuration error' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim() ?? '';
		const email = data.get('email')?.toString()?.trim() ?? '';

		if (!name || !email) {
			return fail(400, { message: 'Name and email are required', name, email });
		}

		const res = await fetch(`${API_URL}/api/sales/profile`, {
			method: 'PATCH',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-CSRF-TOKEN': csrfToken,
				'X-Requested-With': 'XMLHttpRequest',
				...(cookieHeader ? { cookie: cookieHeader } : {})
			},
			body: JSON.stringify({ name, email }),
			redirect: 'manual'
		});

		await copyBackendSetCookies(cookies, res);

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			const msg =
				(err?.message as string) ||
				(err?.errors && Object.values(err.errors).flat().join(', ')) ||
				'Could not update profile';
			return fail(res.status, { message: msg, name, email });
		}

		return { success: true as const, message: 'Profile saved.' };
	},

	updatePassword: async ({ request, cookies }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Server configuration error' });
		}

		const data = await request.formData();
		const current_password = data.get('current_password')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const password_confirmation = data.get('password_confirmation')?.toString() ?? '';

		const res = await fetch(`${API_URL}/api/sales/profile/password`, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-CSRF-TOKEN': csrfToken,
				'X-Requested-With': 'XMLHttpRequest',
				...(cookieHeader ? { cookie: cookieHeader } : {})
			},
			body: JSON.stringify({ current_password, password, password_confirmation }),
			redirect: 'manual'
		});

		await copyBackendSetCookies(cookies, res);

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			const msg =
				(err?.message as string) ||
				(err?.errors && Object.values(err.errors).flat().join(', ')) ||
				'Could not update password';
			return fail(res.status, { message: msg, passwordForm: true });
		}

		return { success: true as const, message: 'Password updated.', passwordForm: true };
	},

	destroyAccount: async ({ request, cookies }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Server configuration error' });
		}

		const data = await request.formData();
		const password = data.get('password')?.toString() ?? '';

		const res = await fetch(`${API_URL}/api/sales/profile`, {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-CSRF-TOKEN': csrfToken,
				'X-Requested-With': 'XMLHttpRequest',
				...(cookieHeader ? { cookie: cookieHeader } : {})
			},
			body: JSON.stringify({ password }),
			redirect: 'manual'
		});

		await copyBackendSetCookies(cookies, res);

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			const msg =
				(err?.message as string) ||
				(err?.errors && Object.values(err.errors).flat().join(', ')) ||
				'Could not delete account';
			return fail(res.status, { message: msg, deleteForm: true });
		}

		throw redirect(303, '/login');
	}
};
