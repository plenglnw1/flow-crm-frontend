import { API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
    const cookieHeader = request.headers.get('cookie');
    const search = url.searchParams.get('search') ?? '';
    const status = url.searchParams.get('status') ?? '';

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (cookieHeader) headers.cookie = cookieHeader;

    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (status) query.set('status', status);

    const res = await fetch(`${API_URL}/api/customers?${query.toString()}`, {
        headers,
        redirect: 'manual'
    });

    if (!res.ok) {
        return { customers: { data: [], current_page: 1, last_page: 1, total: 0 } };
    }

    const data = await res.json();
    // Assuming Laravel pagination format JSON response
    return { customers: data };
};
