<script lang="ts">
	import SidebarNavLink from '$lib/components/layout/SidebarNavLink.svelte';

	let { collapsed = $bindable(false), user: _user = null } = $props<{
		collapsed?: boolean                                                ;
		user?: { name: string                                              ; role?: string | null; team_name?: string | null } | null;
	}>()                                                                ;

	const user = $derived(_user) ;

	const links = [
				{
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'generic'
		},
		{
			href: '/customers',
			label: 'Customers',
			icon: 'customers'
		},
		{
			href: '/action-stream',
			label: 'Action Stream',
			icon: 'activity'
		},
		{
			href: '/pipeline-stages',
			label: 'Pipeline',
			icon: 'pipeline'
		},
	] as const                     ;
</script>

<aside
	class="fixed left-0 top-0 z-50 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out shadow-xl flex flex-col"
	class:w-20={collapsed}
	class:w-72={!collapsed}
>
	<div
		class="flex h-16 items-center px-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm"
		class:justify-center={collapsed}
		class:justify-between={!collapsed}
	>
		{                                                                                                                                                                                                   #if !collapsed}
			<a href="/" class="flex items-center gap-3 overflow-hidden whitespace-nowrap group">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
				>
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<span
					class="text-lg font-bold text-white tracking-wide transition-colors group-hover:text-emerald-400"
				>
					FlowCRM
				</span>
			</a>
		{/if}

		{                                                                                                                                                                    #if !collapsed}
			<button
				type="button"
				onclick={() => (collapsed = true)}
				class="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
				aria-label="Collapse sidebar"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
		{:else}
			<button
				type="button"
				onclick={() => (collapsed = false)}
				class="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-md mx-auto"
				aria-label="Expand sidebar"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 5l7 7-7 7M5 5l7 7-7 7"
					/>
				</svg>
			</button>
		{/if}
	</div>

	<nav class="flex-1 overflow-y-auto p-3 space-y-2">
		{                                                 #each links as link (link.href)}
			<SidebarNavLink {collapsed} {...link} />
		{/each}
	</nav>

	<div class="border-t border-slate-800 p-3 bg-slate-900">
		<div class="flex items-center justify-between">
			<a
				href="/profile"
				class="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-800 transition-colors flex-1 overflow-hidden"
			>
				<div
					class="h-10 w-10 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-600 transition-colors"
				>
					<span>{(user?.name?.[0] ?? 'U').toUpperCase()}</span>
				</div>

				{                                                                                   #if !collapsed}
					<div class="flex-1 overflow-hidden">
						<p class="truncate text-sm font-medium text-white">{user?.name ?? 'User'}</p>
						<p class="truncate text-xs text-slate-500 capitalize">{user?.role ?? 'user'}</p>
						<p class="truncate text-[11px] text-slate-600">Team: {user?.team_name ?? '-'}</p>
					</div>
				{/if}
			</a>

			{                                                                                                  #if !collapsed}
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
						title="Log Out"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</form>
			{/if}
		</div>
	</div>
</aside>
