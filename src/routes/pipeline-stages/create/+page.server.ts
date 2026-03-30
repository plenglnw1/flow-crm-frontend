import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { backendCookieHeaderFromRequest, getBackendCsrf } from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);

	if (!API_URL) return { nextPosition: 0, stages: [] };

	const res = await fetch(`${API_URL}/api/sales/pipeline-board`, {
		headers: (() => {
			const headers: Record<string, string> = { Accept: 'application/json' };
			if (cookieHeader) headers.cookie = cookieHeader;
			return headers;
		})(),
		redirect: 'manual'
	});

	if (!res.ok) {
		return { nextPosition: 0, stages: [] };
	}

	const data = (await res.json()) as {
		stages: Array<{ id: string; name: string; position: number; is_won: boolean }>;
		deals: unknown[];
	};

	const maxPos = data.stages.reduce((m, s) => (s.position > m ? s.position : m), -1);

	return { nextPosition: maxPos + 1, stages: data.stages };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const cookieHeader = backendCookieHeaderFromRequest(request);
		const csrfToken = await getBackendCsrf(cookieHeader);

		if (!API_URL || !csrfToken) {
			return fail(500, { message: 'Missing API_URL or CSRF token' });
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '');
		const positionRaw = formData.get('position');
		const position = positionRaw !== null && positionRaw !== '' ? String(positionRaw) : '';
		const description = String(formData.get('description') ?? '');

		// Checkbox + hidden both use name="is_won"; unchecked sends only "0", checked sends "0" then "1".
		const isWonVals = formData.getAll('is_won');
		const isWon = isWonVals.some((v) => String(v) === '1') ? '1' : '0';

		const body = new URLSearchParams();
		body.set('_token', csrfToken);
		body.set('name', name);
		if (position) body.set('position', position);
		body.set('is_won', isWon);
		if (description) body.set('description', description);

		const headers: Record<string, string> = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
			'X-CSRF-TOKEN': csrfToken
		};
		if (cookieHeader) headers.cookie = cookieHeader;

		const res = await fetch(`${API_URL}/pipeline-stages`, {
			method: 'POST',
			redirect: 'manual',
			headers,
			body: body.toString()
		});

		const location = res.headers.get('location') ?? '';
		const looksLikeSuccess = location.includes('/pipeline-stages');

		if (!res.ok && res.status !== 302 && res.status !== 303) {
			return fail(res.status, { message: 'Failed to create pipeline stage' });
		}

		if ((res.status === 302 || res.status === 303) && !looksLikeSuccess) {
			return fail(400, { message: 'Validation failed while creating stage' });
		}

		throw redirect(303, '/pipeline-stages');
	}
};

