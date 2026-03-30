import { fail, redirect, type Actions } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { applySetCookie, getSetCookies } from '$lib/server/laravel-cookies.server';

/** Sales self-registration only — POSTs to Laravel /register/sales. */
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const name = String(form.get('name') ?? '');
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const password_confirmation = String(form.get('password_confirmation') ?? '');
		const invite_token = String(form.get('invite_token') ?? '').trim();

		if (!name || !email || !password || !invite_token) {
			return fail(400, {
				message: 'กรุณากรอกข้อมูลให้ครบ รวมรหัสเชิญองค์กร',
				values: { name, email, invite_token }
			});
		}

		if (!API_URL) {
			return fail(500, {
				message: 'Missing API_URL in frontend .env',
				values: { name, email, invite_token }
			});
		}

		const registerPath = '/register/sales';

		const preflight = await fetch(`${API_URL}${registerPath}`, {
			method: 'GET',
			redirect: 'manual',
			headers: { Accept: 'text/html,application/xhtml+xml' }
		});

		const preflightCookies = getSetCookies(preflight.headers);
		const preflightCookieHeader = preflightCookies.map((c) => c.split(';')[0]).join('; ');

		const html = await preflight.text();
		const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i);
		const csrfToken = csrfMatch?.[1];

		if (!csrfToken) {
			return fail(500, {
				message: 'ดึง CSRF จาก backend ไม่ได้',
				values: { name, email, invite_token }
			});
		}

		const body = new URLSearchParams();
		body.set('_token', csrfToken);
		body.set('name', name);
		body.set('email', email);
		body.set('password', password);
		body.set('password_confirmation', password_confirmation);
		body.set('invite_token', invite_token);

		const res = await fetch(`${API_URL}${registerPath}`, {
			method: 'POST',
			redirect: 'manual',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'text/html,application/xhtml+xml',
				cookie: preflightCookieHeader,
				'X-CSRF-TOKEN': csrfToken,
				Referer: `${API_URL}${registerPath}`
			},
			body: body.toString()
		});

		for (const sc of preflightCookies) {
			applySetCookie(cookies, sc);
		}
		for (const sc of getSetCookies(res.headers)) {
			applySetCookie(cookies, sc);
		}

		if (res.status !== 302 && res.status !== 303) {
			return fail(400, {
				message: 'สมัครไม่สำเร็จ — ตรวจสอบรหัสเชิญ ชื่อ–นามสกุล หรืออีเมลซ้ำ',
				values: { name, email, invite_token }
			});
		}

		const location = res.headers.get('location') ?? '';

		if (location.includes('/register')) {
			return fail(400, {
				message:
					'ข้อมูลไม่ผ่านการตรวจสอบบนเซิร์ฟเวอร์ — ตรวจสอบรหัสเชิญ หรือว่ามีทีมในองค์กรแล้วหรือยัง',
				values: { name, email, invite_token }
			});
		}

		if (location.includes('/login')) {
			return fail(400, {
				message: 'เซสชันไม่ถูกต้อง ลองอีกครั้ง',
				values: { name, email, invite_token }
			});
		}

		throw redirect(303, '/pipeline-stages');
	}
};