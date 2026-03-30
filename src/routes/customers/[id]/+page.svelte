<script lang="ts">
	import CustomerStatusBadge from '$lib/components/customers/CustomerStatusBadge.svelte';

	let { data } = $props();

	let customer = $derived(data.customer);
	let stats = $derived(data.statistics);
	let deals = $derived(data.deals || []);

	// Utility to format date nicely
	function formatDate(dateString: string | null) {
		if (!dateString) return '-';
		const d = new Date(dateString);
		return new Intl.DateTimeFormat('th-TH', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(d);
	}

	function getLineLink(lineId: string | null) {
		if (!lineId) return '#';
		// Basic parsing to handle with or without @
		const cleanId = lineId.replace('@', '');
		return `https://line.me/ti/p/~${cleanId}`;
	}

	function formatTags(tags: unknown): string {
		if (!tags) return '-';
		// Defensive: avoid printing function source into UI
		if (typeof tags === 'function') return '-';

		if (Array.isArray(tags)) return tags.join(', ');

		if (typeof tags === 'string') {
			// Sometimes backend may store tags as JSON string
			try {
				const parsed = JSON.parse(tags) as unknown;
				if (Array.isArray(parsed)) return parsed.join(', ');
			} catch {
				// ignore JSON parse failure
			}
			return tags;
		}

		return String(tags);
	}

	let expandedDealId = $state<string | null>(null);

	$effect(() => {
		if (!expandedDealId && deals.length > 0) expandedDealId = deals[0]?.id ?? null;
	});

	type DealActivity = {
		id: string;
		title: string;
		type?: string;
		description?: string | null;
		created_at?: string | null;
		user_name?: string | null;
		is_progress_task?: boolean;
		is_stage_progress?: boolean;
	};

	function buildTimelineGroups(activities: DealActivity[]): { progress: DealActivity | null; items: DealActivity[] }[] {
		const ordered = [...(activities ?? [])].sort((a, b) => {
			const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
			const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
			return ta - tb;
		});

		const groups: { progress: DealActivity | null; items: DealActivity[] }[] = [];
		let current: { progress: DealActivity | null; items: DealActivity[] } | null = null;

		for (const a of ordered) {
			const isProgress = Boolean(a.is_progress_task || a.is_stage_progress);
			if (isProgress) {
				if (current) groups.push(current);
				current = { progress: a, items: [] };
			} else {
				if (!current) current = { progress: null, items: [] };
				current.items.push(a);
			}
		}

		if (current) groups.push(current);
		return groups;
	}
</script>

<div class="max-w-4xl mx-auto py-6">
	<!-- Customer Header Card -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
			<div class="flex items-center gap-6">
				<div
					class="w-20 h-20 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold shadow-inner"
				>
					{#if customer.avatar_url}
						<img
							src={customer.avatar_url}
							alt="Profile"
							class="w-full h-full rounded-full object-cover"
						/>
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

			<div class="flex items-center gap-3">
				<a
					href={`/customers/${customer.id}/edit`}
					class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm gap-2 whitespace-nowrap"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 20H7v-4l9.586-9.586z"
						/>
					</svg>
					แก้ไข
				</a>

				<a
					href={getLineLink(customer.line_id)}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm gap-2 whitespace-nowrap"
					onclick={(e) => {
						if (!customer.line_id) e.preventDefault();
					}}
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
					Open in LINE
				</a>
			</div>
		</div>

		<!-- Info Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
			<!-- LINE ID -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">LINE ID</p>
					{#if customer.line_id}
						<p class="font-semibold text-slate-900">{customer.line_id}</p>
					{:else}
						<p class="font-semibold text-slate-900">ยังไม่ถูกตั้งค่า</p>
						<p class="text-xs text-slate-500 mt-1">กรุณาไปกด `แก้ไข` เพื่อใส่ LINE ID</p>
					{/if}
				</div>
			</div>

			<!-- Phone -->
			<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
				<div class="mt-0.5 text-slate-400">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
						/>
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
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
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
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
				</div>
				<div>
					<p class="text-xs text-slate-500 font-medium mb-1">ประเภทธุรกิจ / แท็ก</p>
					<p class="font-semibold text-slate-900">{formatTags(customer.tags)}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
		<div
			class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm"
		>
			<p class="text-3xl font-bold text-emerald-500 mb-2">
				฿{(stats?.lifetime_value ?? 0).toLocaleString()}
			</p>
			<p class="text-sm text-slate-500 font-medium">ยอดขายรวม</p>
		</div>
		<div
			class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm"
		>
			<p class="text-3xl font-bold text-slate-900 mb-2">{stats?.total_deals ?? 0}</p>
			<p class="text-sm text-slate-500 font-medium">จำนวนดีล</p>
		</div>
		<div
			class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm text-center"
		>
			<p class="text-xl font-bold text-slate-900 mb-2">{stats?.last_contacted_diff_human ?? '-'}</p>
			<p class="text-sm text-slate-500 font-medium">
				ติดต่อล่าสุด<br /><span class="text-xs text-slate-400 font-normal"
					>{formatDate(stats?.last_contacted)}</span
				>
			</p>
		</div>
	</div>

	<!-- Deal Timelines -->
	<div>
		<h3 class="text-xl font-bold text-slate-900 mb-6 px-1">Timeline แยกตามดีล</h3>

		<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
			{#if deals.length === 0}
				<div class="text-center py-10 text-slate-500">ยังไม่มีดีลสำหรับลูกค้าท่านนี้</div>
			{:else}
				<div class="space-y-4">
					{#each deals as deal (deal.id)}
						<div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
							<button
								type="button"
								onclick={() => (expandedDealId = deal.id)}
								class="w-full px-4 py-3 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
							>
								<div class="min-w-0">
									<p class="font-bold text-slate-900 truncate">{deal.name}</p>
									<p class="text-xs text-slate-500 mt-1">
										Stage: <span class="font-semibold">{deal.stage?.name || '-'}</span>
									</p>
									<p class="text-xs text-slate-500 mt-1">
										Next: <span class="font-semibold">{deal.next_action || '-'}</span>
									</p>
								</div>
								<div class="text-right shrink-0">
									<p class="text-xs text-slate-400">อัปเดตล่าสุด</p>
									<p class="font-semibold text-slate-800">{deal.updated_at ? formatDate(deal.updated_at) : '-'}</p>
								</div>
							</button>

							{#if expandedDealId === deal.id}
								<div class="px-4 pb-4 pt-2 border-t border-slate-100">
									<div class="mb-4">
										<p class="text-xs text-slate-500 font-medium mb-1">LINE ID</p>
										<p class="font-semibold text-slate-900">{customer.line_id || '-'}</p>
									</div>

									<div class="relative border-l-2 border-slate-200 ml-2 pl-4 space-y-6">
										{#if deal.activities?.length === 0}
											<p class="text-sm text-slate-500">ยังไม่มี timeline ของดีลนี้</p>
										{:else}
											{#each buildTimelineGroups(deal.activities as any) as g}
												<div class="relative">
													<span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></span>
													<div class="ml-3">
														{#if g.progress}
															<p class="text-sm font-bold text-slate-800">
																{g.progress.is_stage_progress
																	? 'Stage Progress'
																	: g.progress.is_progress_task
																		? 'Next Action'
																		: 'Progress'}: {g.progress.title}
															</p>
															<p class="text-xs text-slate-500 mt-1">{g.progress.created_at ? formatDate(g.progress.created_at) : '-'}</p>
														{/if}

														{#if g.items.length > 0}
															<div class="mt-3 space-y-2">
																{#each g.items as act}
																	<div class="bg-slate-50 border border-slate-100 rounded-lg p-3">
																		<p class="text-sm font-semibold text-slate-900">{act.title}</p>
																		<p class="text-xs text-slate-500 mt-1">
																			{act.created_at ? formatDate(act.created_at) : '-'}
																			{#if act.user_name} • {act.user_name}{/if}
																		</p>
																		{#if act.description}
																			<p class="text-xs text-slate-600 mt-2">{act.description}</p>
																		{/if}
																	</div>
																{/each}
															</div>
														{:else}
															<p class="text-xs text-slate-500 mt-3">ยังไม่มี Activities ในรอบความคืบหน้านี้</p>
														{/if}
													</div>
												</div>
											{/each}
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
