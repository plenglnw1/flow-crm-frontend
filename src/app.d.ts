// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
				role: string;
				team_id?: string | null;
				organization_id?: string | null;
			} | null; // ถ้าเป็น null แปลว่ายังไม่ได้ล็อกอิน
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
