<script lang="ts">
	import { page } from '$app/state';

	let {
		href,
		label,
		icon = 'generic',
		collapsed = false
	} = $props<{
		href: string;
		label: string;
		icon?: 'pipeline' | 'template' | 'customers' | 'generic';
		collapsed?: boolean;
	}>();

	const isActive = () => page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<a
	{href}
	class="group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200"
	class:bg-slate-800={isActive()}
	class:text-white={isActive()}
	class:text-slate-400={!isActive()}
	class:hover:bg-slate-800={!isActive()}
	class:hover:text-white={!isActive()}
>
	{#if icon === 'pipeline'}
		<svg
			class="h-6 w-6 shrink-0 transition-colors"
			class:group-hover:text-emerald-400={!isActive()}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
			/>
		</svg>
	{:else if icon === 'template'}
		<svg
			class="h-6 w-6 shrink-0 transition-colors"
			class:group-hover:text-emerald-400={!isActive()}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
			/>
		</svg>
	{:else if icon === 'customers'}
		<svg
			class="h-6 w-6 shrink-0 transition-colors"
			class:group-hover:text-emerald-400={!isActive()}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else}
		<svg
			class="h-6 w-6 shrink-0 transition-colors"
			class:group-hover:text-emerald-400={!isActive()}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	{/if}

	{#if !collapsed}
		<span class="font-medium whitespace-nowrap transition-opacity duration-200">{label}</span>
	{/if}
</a>
