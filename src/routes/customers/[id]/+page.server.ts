import { API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
	const cookieHeader = request.headers.get('cookie');

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (cookieHeader) headers.cookie = cookieHeader;

	const res = await fetch(`${API_URL}/api/customers/${params.id}`, {
		headers,
		redirect: 'manual'
	});

	if (!res.ok) {
		if (res.status === 404) {
			error(404, 'ไม่พบข้อมูลลูกค้า');
		}
		error(500, 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
	}

	const data = await res.json();
	
	// API returns { customer, statistics, deals, activities }
	return data;
};
