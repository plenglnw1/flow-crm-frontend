import { API_URL } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';

type CsrfResponse = { csrf_token?: string };

function parseSetCookieHeader(setCookie: string): string[] {
	// set-cookie header can contain commas inside attributes; do not split blindly.
	// In practice for Laravel, cookies are delivered as a single header value per cookie.
	// We'll assume `fetch` provides `headers.getSetCookie()` when available.
	return [setCookie];
}

function readSetCookies(headers: Headers): string[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyHeaders = headers as any;
	if (typeof anyHeaders.getSetCookie === 'function') {
		return anyHeaders.getSetCookie() as string[];
	}

	const raw = headers.get('set-cookie');
	return raw ? parseSetCookieHeader(raw) : [];
}

function applySetCookie(cookies: Cookies, setCookie: string) {
	const [pair, ...attrs] = setCookie.split(';').map((s) => s.trim());
	const eqIdx = pair.indexOf('=');
	if (eqIdx === -1) return;
	const name = pair.slice(0, eqIdx);
	const value = pair.slice(eqIdx + 1);

	// IMPORTANT: values from backend are already encoded; avoid double encoding.
	const options: Parameters<Cookies['set']>[2] = { path: '/', encode: (v: string) => v };
	for (const attr of attrs) {
		const [k, v] = attr.split('=');
		const key = k.toLowerCase();
		if (key === 'httponly') options.httpOnly = true;
		else if (key === 'secure') options.secure = true;
		else if (key === 'samesite') options.sameSite = (v?.toLowerCase() ?? 'lax') as 'lax' | 'strict' | 'none';
		else if (key === 'path') options.path = v ?? '/';
		else if (key === 'domain') options.domain = v;
		else if (key === 'expires' && v) options.expires = new Date(v);
		else if (key === 'max-age' && v) options.maxAge = Number(v);
	}

	cookies.set(name, value, options);
}

export async function getBackendCsrf(cookieHeader: string | null): Promise<string | null> {
	if (!API_URL) return null;
	if (!cookieHeader) return null;

	const res = await fetch(`${API_URL}/api/sales/csrf`, {
		headers: {
			Accept: 'application/json',
			cookie: cookieHeader
		},
		redirect: 'manual'
	});

	if (!res.ok) return null;
	const data = (await res.json()) as CsrfResponse;
	return data.csrf_token ?? null;
}

export async function copyBackendSetCookies(cookies: Cookies, res: Response) {
	const setCookies = readSetCookies(res.headers);
	for (const sc of setCookies) {
		applySetCookie(cookies, sc);
	}
}

export function backendCookieHeaderFromRequest(request: Request) {
	return request.headers.get('cookie');
}

