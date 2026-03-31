import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getBackendCsrf, backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

export const actions: Actions = {
    default: async ({ request }) => {
        const cookieHeader = backendCookieHeaderFromRequest(request);
        const csrfToken = await getBackendCsrf(cookieHeader);

        if (!API_URL || !csrfToken) {
            return fail(500, { error: true, message: 'Missing API_URL or CSRF token', errors: {} });
        }

        const formData = await request.formData();
        const values = Object.fromEntries(
            Array.from(formData.entries())
                .filter(([k]) => k !== 'avatar')
                .map(([k, v]) => [k, String(v)])
        ) as Record<string, string>;

        // Basic validation for required fields according to spec
        const fullname = formData.get('fullname')?.toString();
        const line_id = formData.get('line_id')?.toString();

        if (!fullname || !line_id) {
            return fail(400, {
                error: true,
                message: 'Please fill required fields (full name, LINE ID)',
                errors: {
                    ...(!fullname ? { fullname: 'Full name is required' } : {}),
                    ...(!line_id ? { line_id: 'LINE ID is required' } : {})
                },
                values
            });
        }

        // is_active checkbox value handling (HTML checkbox sends 'on' if checked, otherwise missing)
        const isActive = formData.get('is_active');
        formData.set('is_active', isActive ? '1' : '0');

        // Laravel CSRF token + cookie forwarding
        formData.set('_token', csrfToken);

        try {
            // Forward the FormData to Backend
            const res = await fetch(`${API_URL}/api/sales/customers`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    ...(cookieHeader ? { cookie: cookieHeader } : {})
                },
                body: formData,
                redirect: 'manual'
            });

            if (!res.ok) {
                const result = await res.json().catch(() => ({} as Record<string, any>));
                const errors = result.errors
                    ? Object.fromEntries(
                            Object.entries(result.errors as Record<string, string[]>).map(([k, arr]) => [
                                k,
                                arr?.[0] ?? 'Invalid input'
                            ])
                        )
                    : {};
                return fail(res.status, {
                    error: true,
                    message: result.message || 'Could not save customer — try again',
                    errors,
                    values
                });
            }
        } catch (err) {
            return fail(500, {
                error: true,
                message: 'Cannot reach server right now',
                errors: {},
                values
            });
        }

        // Success: Redirect to customer list page
        throw redirect(303, '/customers');
    }
};
