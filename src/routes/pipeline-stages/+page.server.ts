import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/sales/pipeline-board`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		// If backend session isn't valid, hooks.server.ts should already redirect.
		return { stages: [], deals: [] };
	}

	const data = (await res.json()) as {
		stages: Array<{ id: string; name: string; position: number; is_won: boolean }>;
		deals: Array<{
			id: string;
			stage_id: string | null;
			name: string;
			value: number;
			description?: string | null;
			expected_close_date?: string | null;
			next_action?: string | null;
			next_action_date?: string | null;
			lost_reason?: string | null;
			lost_at?: string | null;
			won_at?: string | null;
			customer: { name: string | null; nickname: string | null; organization_name: string | null; line_id?: string | null };
			is_stale: boolean;
			days_in_stage: number;
			updated_at?: string | null;
		}>;
	};

	return data;
};

