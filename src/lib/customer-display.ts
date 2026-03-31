/**
 * Shared rules: lists and cards show the stored legal name; nickname, LINE, and phone belong on detail panels.
 */

export function customerStoredName(raw: string | null | undefined): string {
	return (raw ?? '').trim();
}

/** Primary list/header label: stored name, or "Customer" when empty. */
export function customerFormalLabel(raw: string | null | undefined): string {
	const s = customerStoredName(raw);
	if (!s) return 'Customer';
	return s;
}

const THAI_KHUN = '\u0e04\u0e38\u0e13'; // honorific prefix (no Thai literals in source)

/** First character of the legal name (not nickname). Strips common honorific prefix for initials only. */
export function customerNameInitial(raw: string | null | undefined): string {
	const s = customerStoredName(raw);
	if (!s) return '?';
	const stripped = s.startsWith(THAI_KHUN) ? s.slice(THAI_KHUN.length).trim() : s;
	const first = stripped.slice(0, 1);
	return first ? first.toUpperCase() : '?';
}

/** Nickname when present; otherwise null. */
export function customerNicknameOrNull(nickname: string | null | undefined): string | null {
	const n = (nickname ?? '').trim();
	return n.length > 0 ? n : null;
}
