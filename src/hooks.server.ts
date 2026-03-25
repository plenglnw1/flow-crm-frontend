import { redirect, type Handle } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';

type MeResponse = {
	id: string;
	name: string;
	email: string;
	role: string;
	team_id?: string | null;
	organization_id?: string | null;
};

async function fetchMe(cookieHeader: string | null): Promise<MeResponse | null> {
	if (!cookieHeader) return null;
	if (!API_URL) return null;

	try {
		const res = await fetch(`${API_URL}/me`, {
			headers: {
				Accept: 'application/json',
				cookie: cookieHeader
			},
			redirect: 'manual'
		});

		if (!res.ok) return null;
		return (await res.json()) as MeResponse;
	} catch {
		// Backend down / DNS issue shouldn't crash the frontend.
		return null;
	}
}

// Include /deals so layout can show the sidebar (locals.user) and enforce Sales-only app rules.
const protectedPrefixes = ['/pipeline-stages', '/pipeline-templates', '/deals', '/profile', '/logout', '/customers'];

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeader = event.request.headers.get('cookie');
	const pathname = event.url.pathname;
	const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
	const shouldHydrateUser = isProtected || pathname === '/login';

	const user = shouldHydrateUser ? await fetchMe(cookieHeader) : null;
	event.locals.user = user ?? null;

	if (isProtected && !event.locals.user) {
		throw redirect(303, '/login');
	}

	// Only Sales should use the Svelte "app" area.
	if (isProtected && event.locals.user && event.locals.user.role !== 'sales') {
		const target =
			event.locals.user.role === 'admin'
				? `${API_URL}/organizations`
				: event.locals.user.role === 'manager'
					? `${API_URL}/teams`
					: `${API_URL}/dashboard`;
		throw redirect(303, target);
	}

	if (pathname === '/login' && event.locals.user) {
		if (event.locals.user.role === 'sales') {
			throw redirect(303, '/pipeline-stages');
		}
		const target =
			event.locals.user.role === 'admin'
				? `${API_URL}/organizations`
				: event.locals.user.role === 'manager'
					? `${API_URL}/teams`
					: `${API_URL}/dashboard`;
		throw redirect(303, target);
	}

	return resolve(event);
};

