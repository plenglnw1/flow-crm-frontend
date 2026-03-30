<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';

	type LayoutData = {
		user?: { id: string; name: string; email: string; role: string; team_name?: string | null } | null;
	};

	let { data, children } = $props<{ data: LayoutData; children: unknown }>();
	let sidebarCollapsed = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
	{#if data.user}
		<AppSidebar bind:collapsed={sidebarCollapsed} user={data.user} />
	{/if}

	<main
		class="min-h-screen transition-all duration-300 ease-in-out bg-slate-50"
		class:ml-20={data.user && sidebarCollapsed}
		class:ml-72={data.user && !sidebarCollapsed}
	>
		<div class="p-6 md:p-8">
			{@render children()}
		</div>
	</main>
</div>
