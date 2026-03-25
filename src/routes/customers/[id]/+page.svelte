<script lang="ts">
	import CustomerStatusBadge from '$lib/components/customers/CustomerStatusBadge.svelte';

	let { data } = $props();

	let customer = $derived(data.customer);
	let stats = $derived(data.statistics);
	// activities are loaded latest-first from the backend
	let activities = $derived(data.activities || []);

	// Utility to format date nicely
	function formatDate(dateString: string | null) {
		if (!dateString) return '-';
		const d = new Date(dateString);
		return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
	}

	function getLineLink(lineId: string | null) {
		if (!lineId) return '#';
		// Basic parsing to handle with or without @
		const cleanId = lineId.replace('@', '');
		return `https://line.me/ti/p/~${cleanId}`;
	}
</script>

<div class="max-w-4xl mx-auto py-6">
	<!-- Customer Header Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
			<div class="flex items-center gap-6">
				<div class="w-20 h-20 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold shadow-inner">
					{#if customer.avatar_url}
						<img src={customer.avatar_url} alt="Profile" class="w-full h-full rounded-full object-cover" />
					{:else}
						{(customer.nickname || customer.fullname || 'U').slice(0, 1).toUpperCase()}
					{/if}
				</div>
				<div>
					<div class="flex items-center gap-3 mb-1">
						<h1 class="text-2xl font-bold text-slate-900">คุณ{customer.fullname}</h1>
						<CustomerStatusBadge isActive={customer.is_active} />
					</div>
					<p class="text-slate-500 font-medium">ชื่อเล่น: {customer.nickname || '-'}</p>
				</div>
			</div>
			
			<a 
				href={getLineLink(customer.line_id)}
				target="_blank" rel="noopener noreferrer"
				class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm gap-2 whitespace-nowrap"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
				</svg>
				Open in LINE
			</a>
		</div>

		<!-- Info Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
			<!-- LINE ID -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">LINE ID</p>
					<p class="font-semibold text-slate-900">{customer.line_id || '-'}</p>
				</div>
			</div>

			<!-- Phone -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">เบอร์โทร</p>
					<p class="font-semibold text-slate-900">{customer.phone || '-'}</p>
				</div>
			</div>

			<!-- Province -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">จังหวัด</p>
					<p class="font-semibold text-slate-900">{customer.province || '-'}</p>
				</div>
			</div>

			<!-- Tags/Business type representing -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">ประเภทธุรกิจ / แท็ก</p>
					<p class="font-semibold text-slate-900">
						{#if customer.tags}
							{Array.isArray(customer.tags) ? customer.tags.join(', ') : customer.tags}
						{:else}
							-
						{/if}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
		<div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
			<p class="text-3xl font-bold text-emerald-500 mb-2">฿{(stats?.lifetime_value ?? 0).toLocaleString()}</p>
			<p class="text-sm text-slate-500 font-medium">ยอดขายรวม</p>
		</div>
		<div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm">
			<p class="text-3xl font-bold text-slate-900 mb-2">{stats?.total_deals ?? 0}</p>
			<p class="text-sm text-slate-500 font-medium">จำนวนดีล</p>
		</div>
		<div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm text-center">
			<p class="text-xl font-bold text-slate-900 mb-2">{stats?.last_contacted_diff_human ?? '-'}</p>
			<p class="text-sm text-slate-500 font-medium">ติดต่อล่าสุด<br/><span class="text-xs text-slate-400 font-normal">{formatDate(stats?.last_contacted)}</span></p>
		</div>
	</div>

	<!-- Activity Timeline -->
	<div>
		<h3 class="text-xl font-bold text-slate-900 mb-6 px-1">ประวัติกิจกรรม</h3>
		
		<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
			{#if activities.length === 0}
				<div class="text-center py-10 text-slate-500">ยังไม่มีประวัติกิจกรรมกับลูกค้าท่านนี้</div>
			{:else}
				<div class="relative border-l border-slate-200 ml-4 space-y-8">
					{#each activities as activity}
						<div class="relative pl-8">
							<!-- Timeline dot -->
							<span class="absolute -left-3.5 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-white">
								<svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<!-- Choosing an icon based on activity type conceptually -->
									{#if activity.type?.includes('call')}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
									{:else if activity.type?.includes('message') || activity.type?.includes('email')}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									{/if}
								</svg>
							</span>
							
							<div class="flex flex-col mb-1 sm:flex-row sm:items-center sm:justify-between gap-1">
								<h4 class="text-base font-bold text-slate-900">{activity.title || activity.description || 'ทำกิจกรรม'}</h4>
								<time class="text-sm font-medium text-slate-400">{formatDate(activity.created_at)}</time>
							</div>
							<p class="text-slate-600 text-sm">{activity.description}</p>
							{#if activity.user}
								<p class="text-xs text-slate-400 mt-2 font-medium">ทำโดย: {activity.user.name}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
