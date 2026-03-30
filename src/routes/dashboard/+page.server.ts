import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

export const load: PageServerLoad = async ({ request }) => {
	const cookieHeader = backendCookieHeaderFromRequest(request);

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	if (!API_URL) {
		throw error(500, 'Missing API_URL');
	}

	const res = await fetch(`${API_URL}/api/sales/dashboard`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		throw error(res.status, 'Failed to load dashboard data');
	}

	return (await res.json()) as {
		stats: {
			todo_today: number;
			overdue_deals: number;
			confirmed_quotes: number;
			revenue_month: number;
			revenue_growth: number;
		};
		chartData?: {
			labels: string[];
			data: number[];
			projected?: number[];
		};
		activities: Array<{
			id: string;
			priority_key: 'urgent' | 'medium' | 'normal';
			priority: number;
			priority_label: string;
			action_type: string;
			customer_name: string;
			title: string;
			description?: string | null;
			warning?: string;
			time: string;
			due_date?: string | null;
			amount: number;
			line_id?: string | null;
			script?: string;
		}>;
	};
};