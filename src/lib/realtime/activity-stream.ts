import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';

export async function subscribeToActivityStream(
	userId: string,
	onUpdate: () => void
): Promise<() => void> {
	if (!browser || !userId) {
		return () => {};
	}

	let Echo: any;
	let Pusher: any;
	try {
		// Vite จะพยายาม resolve imports แม้เป็น dynamic import
		// ถ้า node_modules ยังไม่ติดตั้ง ระบบจะ crash ทันที
		// ใช้ @vite-ignore เพื่อให้ build ผ่าน และ fallback เป็นไม่ realtime
		const [echoMod, pusherMod] = await Promise.all([
			import(/* @vite-ignore */ 'laravel-echo'),
			import(/* @vite-ignore */ 'pusher-js')
		]);
		Echo = (echoMod as any).default ?? echoMod;
		Pusher = (pusherMod as any).default ?? pusherMod;
	} catch (err) {
		console.warn('Realtime libs not available, fallback to polling.', err);
		return () => {};
	}

	(globalThis as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

	const broadcastAppKey = publicEnv.PUBLIC_BROADCAST_APP_KEY ?? '';
	const broadcastHost = publicEnv.PUBLIC_BROADCAST_HOST || window.location.hostname;
	const wsPort = Number(publicEnv.PUBLIC_BROADCAST_PORT || '6001');
	const forceTLS = (publicEnv.PUBLIC_BROADCAST_SCHEME || 'http') === 'https';
	if (!broadcastAppKey) {
		return () => {};
	}

	const echo = new Echo({
		broadcaster: 'pusher',
		key: broadcastAppKey,
		wsHost: broadcastHost,
		wsPort,
		wssPort: wsPort,
		forceTLS,
		enabledTransports: ['ws', 'wss'],
		// Use same-origin SvelteKit endpoint so browser cookies work cross-origin.
		authEndpoint: '/broadcasting/auth',
		withCredentials: true
	});

	const channel = echo.private(`sales.user.${userId}`);
	channel.listen('.activity.stream.updated', () => {
		onUpdate();
	});

	return () => {
		echo.leaveChannel(`private-sales.user.${userId}`);
		echo.disconnect();
	};
}

