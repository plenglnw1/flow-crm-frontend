import { fail, redirect, type Actions } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { applySetCookie, getSetCookies } from '$lib/server/laravel-cookies.server';

/** Sales self-registration only — POSTs to Laravel /register/sales. */
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const name = String(form.get('name') ?? '');
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const password_confirmation = String(form.get('password_confirmation') ?? '');
		const invite_token = String(form.get('invite_token') ?? '').trim();

		const errors: Record<string, string> = {};
		const nameParts = name
			.trim()
			.split(/\s+/)
			.filter(Boolean);
		if (!name) errors.name = 'Please enter your full name';
		else if (nameParts.length < 2) errors.name = 'Please enter both first and last name';
		if (!email) errors.email = 'Please enter your email';
		if (!password) errors.password = 'Please enter your password';
		if (password && password.length < 8) errors.password = 'Password must be at least 8 characters';
		if (!password_confirmation) errors.password_confirmation = 'Please confirm your password';
		if (password && password_confirmation && password !== password_confirmation) {
			errors.password_confirmation = 'Password confirmation does not match';
		}
		if (!invite_token) errors.invite_token = 'Please enter organization invite code';

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				message: 'Please correct the highlighted fields',
				values: { name, email, invite_token },
				errors
			});
		}

		if (!API_URL) {
			return fail(500, {
				message: 'Missing API_URL in frontend .env',
				values: { name, email, invite_token },
				errors: {}
			});
		}

		const registerPath = '/register/sales';

		const preflight = await fetch(`${API_URL}${registerPath}`, {
			method: 'GET',
			redirect: 'manual',
			headers: { Accept: 'text/html,application/xhtml+xml' }
		});

		const preflightCookies = getSetCookies(preflight.headers);
		const preflightCookieHeader = preflightCookies.map((c) => c.split(';')[0]).join('; ');

		const html = await preflight.text();
		const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i);
		const csrfToken = csrfMatch?.[1];

		if (!csrfToken) {
			return fail(500, {
				message: 'Could not load CSRF token from backend',
				values: { name, email, invite_token }
			});
		}

		const body = new URLSearchParams();
		body.set('_token', csrfToken);
		body.set('name', name);
		body.set('email', email);
		body.set('password', password);
		body.set('password_confirmation', password_confirmation);
		body.set('invite_token', invite_token);

		const res = await fetch(`${API_URL}${registerPath}`, {
			method: 'POST',
			redirect: 'manual',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json, text/html,application/xhtml+xml',
				cookie: preflightCookieHeader,
				'X-CSRF-TOKEN': csrfToken,
				Referer: `${API_URL}${registerPath}`
			},
			body: body.toString()
		});

		for (const sc of preflightCookies) {
			applySetCookie(cookies, sc);
		}
		for (const sc of getSetCookies(res.headers)) {
			applySetCookie(cookies, sc);
		}

		if (res.status === 422) {
			const json = await res.json().catch(() => ({}));
			const fieldErrors = (json.errors ?? {}) as Record<string, string[]>;
			const mapped = Object.fromEntries(
				Object.entries(fieldErrors).map(([k, arr]) => [k, arr?.[0] ?? 'Invalid input'])
			);
			return fail(422, {
				message: 'Please fix the highlighted fields',
				values: { name, email, invite_token },
				errors: mapped
			});
		}

		if (res.status !== 302 && res.status !== 303) {
			return fail(400, {
				message: 'Registration failed — check invite code, full name, or duplicate email',
				values: { name, email, invite_token },
				errors: {}
			});
		}

		const location = res.headers.get('location') ?? '';

		if (location.includes('/register')) {
			return fail(400, {
				message:
					'Server rejected the request — check the invite code and that the organization has a team',
				values: { name, email, invite_token },
				errors: {}
			});
		}

		if (location.includes('/login')) {
			return fail(400, {
				message: 'Invalid session — try again',
				values: { name, email, invite_token },
				errors: {}
			});
		}

		throw redirect(303, '/pipeline-stages');
	}
};