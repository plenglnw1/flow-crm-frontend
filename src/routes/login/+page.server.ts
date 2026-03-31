import { fail, redirect, type Actions } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { applySetCookie, getSetCookies } from '$lib/server/laravel-cookies.server';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required', email });
		}

		if (!API_URL) {
			return fail(500, { message: 'Missing API_URL. Please set API_URL in frontend .env', email });
		}

		// Laravel Breeze uses CSRF for web login. Grab it from GET /login first.
		const preflight = await fetch(`${API_URL}/login`, {
			method: 'GET',
			redirect: 'manual',
			headers: {
				Accept: 'text/html,application/xhtml+xml'
			}
		});

		const preflightCookies = getSetCookies(preflight.headers);
		const preflightCookieHeader = preflightCookies.map((c) => c.split(';')[0]).join('; ');

		const html = await preflight.text();
		const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i);
		const csrfToken = csrfMatch?.[1];

		if (!csrfToken) {
			return fail(500, { message: 'Cannot find CSRF token from backend login page', email });
		}

		// Post to Laravel Breeze login (web route), store session cookies.
		const res = await fetch(`${API_URL}/login`, {
			method: 'POST',
			redirect: 'manual',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'text/html,application/xhtml+xml',
				cookie: preflightCookieHeader,
				'X-CSRF-TOKEN': csrfToken,
				Referer: `${API_URL}/login`
			},
			body: new URLSearchParams({ _token: csrfToken, email, password }).toString()
		});

		// Persist cookies from preflight and login response.
		for (const sc of preflightCookies) {
			applySetCookie(cookies, sc);
		}
		for (const sc of getSetCookies(res.headers)) {
			applySetCookie(cookies, sc);
		}

		// Laravel returns 302 on success.
		if (res.status === 302 || res.status === 303) {
			const location = res.headers.get('location') ?? '';
			// Breeze redirects back to /login on failure (with errors in session).
			if (location.includes('/login')) {
				return fail(401, { message: 'Invalid email or password', email });
			}

			throw redirect(303, '/pipeline-stages');
		}

		return fail(401, { message: 'Sign in failed — check your details and try again', email });
	}
};