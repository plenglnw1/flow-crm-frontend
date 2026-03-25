import { API_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getBackendCsrf, backendCookieHeaderFromRequest } from '$lib/server/backend-proxy.server';

export const actions: Actions = {
    default: async ({ request }) => {
        const cookieHeader = backendCookieHeaderFromRequest(request);
        const csrfToken = await getBackendCsrf(cookieHeader);

        if (!API_URL || !csrfToken) {
            return fail(500, { message: 'Missing API_URL or CSRF token' });
        }

        const formData = await request.formData();

        // Basic validation for required fields according to spec
        const fullname = formData.get('fullname')?.toString();
        const line_id = formData.get('line_id')?.toString();

        if (!fullname || !line_id) {
            return fail(400, {
                error: true,
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ-นามสกุล, LINE ID)'
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
                const result = await res.json().catch(() => ({}));
                return fail(res.status, {
                    error: true,
                    message: result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
                });
            }
        } catch (err) {
            return fail(500, {
                error: true,
                message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้'
            });
        }

        // Success: Redirect to customer list page
        throw redirect(303, '/customers');
    }
};
