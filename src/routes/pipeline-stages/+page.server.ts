import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
	const cookieHeader = request.headers.get('cookie');

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	const scope = url.searchParams.get('scope') ?? 'mine';
	const teamId = url.searchParams.get('team_id') ?? '';
	const qs = new URLSearchParams();
	qs.set('scope', scope);
	if (scope === 'team' && teamId) qs.set('team_id', teamId);

	const res = await fetch(`${API_URL}/api/sales/pipeline-board?${qs.toString()}`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		// If backend session isn't valid, hooks.server.ts should already redirect.
		return { stages: [], deals: [], teams: [], read_only: false, my_team_id: null, active_team_id: null, scope };
	}

	const data = (await res.json()) as {
		scope: string;
		read_only: boolean;
		my_team_id: string | null;
		active_team_id: string | null;
		teams: Array<{ id: string; name: string }>;
		stages: Array<{ id: string; name: string; position: number; is_won: boolean }>;
		deals: Array<{
			id: string;
			stage_id: string | null;
			stage_position?: number | null;
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
			age_hours: number;
			updated_at?: string | null;
		}>;
	};

	return data;
};

