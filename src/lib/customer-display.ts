/**
 * กฎเดียวกันทั้งแอป: รายการ/การ์ดใช้ "ชื่อจริง" เท่านั้น · ชื่อเล่น/ LINE / เบอร์ แสดงในหน้ารายละเอียดหรือแผงขวา
 */

export function customerStoredName(raw: string | null | undefined): string {
	return (raw ?? '').trim();
}

/** แสดงในลิสต์และหัวข้อหลัก: คุณ + ชื่อ–นามสกุล (ไม่ซ้ำคำว่า คุณ) */
export function customerFormalLabel(raw: string | null | undefined): string {
	const s = customerStoredName(raw);
	if (!s) return 'ลูกค้า';
	if (s.startsWith('คุณ')) return s;
	return `คุณ${s}`;
}

/** ตัวอักษรแรกของชื่อจริง (ไม่ใช่ชื่อเล่น) */
export function customerNameInitial(raw: string | null | undefined): string {
	const s = customerStoredName(raw);
	if (!s) return '?';
	const stripped = s.startsWith('คุณ') ? s.slice(2).trim() : s;
	const first = stripped.slice(0, 1);
	return first ? first.toUpperCase() : '?';
}

/** แสดงชื่อเล่นในที่ที่เหมาะสม (ถ้าไม่มีคืนค่า null) */
export function customerNicknameOrNull(nickname: string | null | undefined): string | null {
	const n = (nickname ?? '').trim();
	return n.length > 0 ? n : null;
}
