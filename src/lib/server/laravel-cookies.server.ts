import type { Cookies } from '@sveltejs/kit';

/** Parse Set-Cookie headers from a fetch Response (Node / Undici). */
export function getSetCookies(headers: Headers): string[] {
	const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
	if (typeof anyHeaders.getSetCookie === 'function') {
		return anyHeaders.getSetCookie();
	}
	const raw = headers.get('set-cookie');
	return raw ? [raw] : [];
}

/** Apply one Set-Cookie string to SvelteKit cookies API (values already encoded from Laravel). */
export function applySetCookie(cookiesApi: Cookies, setCookie: string): void {
	const [pair, ...attrs] = setCookie.split(';').map((s) => s.trim());
	const eqIdx = pair.indexOf('=');
	if (eqIdx === -1) return;
	const name = pair.slice(0, eqIdx);
	const value = pair.slice(eqIdx + 1);

	const options: Record<string, unknown> = { path: '/', encode: (v: string) => v };
	for (const attr of attrs) {
		const [k, v] = attr.split('=');
		const key = k.toLowerCase();
		if (key === 'httponly') options.httpOnly = true;
		else if (key === 'secure') options.secure = true;
		else if (key === 'samesite')
			options.sameSite = (v?.toLowerCase() ?? 'lax') as 'lax' | 'strict' | 'none';
		else if (key === 'path') options.path = v ?? '/';
		else if (key === 'domain') options.domain = v;
		else if (key === 'expires') options.expires = new Date(v);
		else if (key === 'max-age') options.maxAge = Number(v);
	}

	cookiesApi.set(name, value, options as unknown as Parameters<Cookies['set']>[2]);
}