import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
    const cookieHeader = request.headers.get('cookie');

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (cookieHeader) headers.cookie = cookieHeader;

    const res = await fetch(`${API_URL}/api/sales/customers/${params.id}`, {
        headers,
        redirect: 'manual'
    });

    if (!res.ok) {
        if (res.status === 404) {
            error(404, 'Customer not found');
        }
        error(500, 'Server error while loading customer');
    }

    const data = await res.json();

    // API returns { customer, statistics, deals, activities }
    return data;
};
