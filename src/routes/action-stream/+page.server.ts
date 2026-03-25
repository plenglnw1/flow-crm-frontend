import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

type ActivityPriorityKey = 'urgent' | 'medium' | 'normal';

type Activity = {
	id: string;
	priority_key: ActivityPriorityKey;
	priority: number;
	priority_label: string;
	action_type: string;
	customer_nickname: string;
	customer_name: string;
	title: string;
	description?: string | null;
	warning: string;
	time: string;
	due_date?: string | null;
	amount: number;
	line_id?: string | null;
	last_contact?: string | null;
	script: string;
};

export const load: PageServerLoad = async ({ request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/sales/activities?completed=0`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		return { activities: [] };
	}

	const data = await res.json();
	return {
		activities: (data.activities ?? []) as Activity[]
	};
};

