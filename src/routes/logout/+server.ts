import { API_URL } from '$env/static/private';
import { redirect, type RequestHandler } from '@sveltejs/kit';

function getSetCookies(headers: Headers): string[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyHeaders = headers as any;
	if (typeof anyHeaders.getSetCookie === 'function') {
		return anyHeaders.getSetCookie() as string[];
	}
	const raw = headers.get('set-cookie');
	return raw ? [raw] : [];
}

function clearAuthCookies(cookies: { delete: (name: string, opts: any) => void }) {
	// Cookies we proxy from Laravel
	cookies.delete('flow-crm-session', { path: '/' });
	cookies.delete('XSRF-TOKEN', { path: '/' });
}

async function getCsrfFromAuthedPage(cookieHeader: string | null) {
	if (!API_URL || !cookieHeader) return null;

	// Any page that uses layouts/app.blade.php contains csrf meta.
	const res = await fetch(`${API_URL}/pipeline-stages`, {
		method: 'GET',
		redirect: 'manual',
		headers: {
			Accept: 'text/html,application/xhtml+xml',
			cookie: cookieHeader
		}
	});

	if (!res.ok) return null;
	const html = await res.text();
	const match = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i);
	return match?.[1] ?? null;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const cookieHeader = request.headers.get('cookie');

	try {
		if (API_URL && cookieHeader) {
			const csrfToken = await getCsrfFromAuthedPage(cookieHeader);

			if (csrfToken) {
				await fetch(`${API_URL}/logout`, {
					method: 'POST',
					redirect: 'manual',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Accept: 'text/html,application/xhtml+xml',
						cookie: cookieHeader,
						'X-CSRF-TOKEN': csrfToken,
						Referer: `${API_URL}/pipeline-stages`
					},
					body: new URLSearchParams({ _token: csrfToken }).toString()
				});
			}
		}
	} finally {
		// Always clear local cookies regardless of backend response.
		clearAuthCookies(cookies);
	}

	throw redirect(303, '/login');
};

export const GET: RequestHandler = async ({ cookies }) => {
	clearAuthCookies(cookies);
	throw redirect(303, '/login');
};

