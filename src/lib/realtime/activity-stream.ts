import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';

export async function subscribeToActivityStream(
	userId: string,
	onUpdate: () => void
): Promise<() => void> {
	if (!browser || !userId) {
		return () => {};
	}

	const [{ default: Echo }, { default: Pusher }] = await Promise.all([
		import('laravel-echo'),
		import('pusher-js')
	]);

	(globalThis as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

	const broadcastAppKey = publicEnv.PUBLIC_BROADCAST_APP_KEY ?? '';
	const broadcastHost = publicEnv.PUBLIC_BROADCAST_HOST || window.location.hostname;
	const wsPort = Number(publicEnv.PUBLIC_BROADCAST_PORT || '6001');
	const forceTLS = (publicEnv.PUBLIC_BROADCAST_SCHEME || 'http') === 'https';
	const apiUrl = (publicEnv.PUBLIC_API_URL || '').replace(/\/$/, '');

	if (!broadcastAppKey || !apiUrl) {
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
		authEndpoint: `${apiUrl}/broadcasting/auth`,
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

