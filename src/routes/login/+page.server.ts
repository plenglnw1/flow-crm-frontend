import { fail, redirect, type Actions } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';

function getSetCookies(headers: Headers): string[] {
	// Undici / Node fetch may expose getSetCookie(); fall back to combined header.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyHeaders = headers as any;
	if (typeof anyHeaders.getSetCookie === 'function') {
		return anyHeaders.getSetCookie() as string[];
	}
	const raw = headers.get('set-cookie');
	return raw ? [raw] : [];
}

function applySetCookie(cookiesApi: { set: (name: string, value: string, opts: any) => void }, setCookie: string) {
	const [pair, ...attrs] = setCookie.split(';').map((s) => s.trim());
	const eqIdx = pair.indexOf('=');
	if (eqIdx === -1) return;
	const name = pair.slice(0, eqIdx);
	const value = pair.slice(eqIdx + 1);

	// IMPORTANT: backend cookies are already encoded; don't double-encode.
	const options: Record<string, any> = { path: '/', encode: (v: string) => v };
	for (const attr of attrs) {
		const [k, v] = attr.split('=');
		const key = k.toLowerCase();
		if (key === 'httponly') options.httpOnly = true;
		else if (key === 'secure') options.secure = true;
		else if (key === 'samesite') options.sameSite = (v?.toLowerCase() ?? 'lax') as 'lax' | 'strict' | 'none';
		else if (key === 'path') options.path = v ?? '/';
		else if (key === 'domain') options.domain = v;
		else if (key === 'expires') options.expires = new Date(v);
		else if (key === 'max-age') options.maxAge = Number(v);
	}

	cookiesApi.set(name, value, options);
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { message: 'Email และ Password จำเป็นต้องกรอก', email });
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
				return fail(401, { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', email });
			}

			throw redirect(303, '/pipeline-stages');
		}

		return fail(401, { message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง', email });
	}
};