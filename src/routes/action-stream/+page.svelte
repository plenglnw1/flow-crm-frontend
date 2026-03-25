<script lang="ts">
	import { goto } from '$app/navigation';
	import { customerFormalLabel, customerNicknameOrNull } from '$lib/customer-display';

	type ActivityPriorityKey = 'urgent' | 'medium' | 'normal';
	type Activity = {
		id: string;
		priority_key: ActivityPriorityKey;
		priority: number;
		priority_label: string;
		action_type: string;
		customer_nickname: string;
		customer_name: string;
		title: string;
		description?: string | null;
		warning: string;
		time: string;
		due_date?: string | null;
		amount: number;
		line_id?: string | null;
		last_contact?: string | null;
		script: string;
	};

	let { data }: { data: { activities: Activity[] } } = $props();

	let selectedId = $state<string>(data.activities[0]?.id ?? '');
	let toast = $state<string | null>(null);
	let priorityFilter = $state<'all' | 'urgent' | 'medium'>('all');

	function computeVisibleActivities(): Activity[] {
		const list = data.activities ?? [];
		if (priorityFilter === 'urgent') return list.filter((a) => a.priority_key === 'urgent');
		if (priorityFilter === 'medium') return list.filter((a) => a.priority_key === 'medium');
		return list;
	}

	let visibleActivities = $derived(computeVisibleActivities());

	function computeActiveActivity(): Activity | null {
		return visibleActivities.find((a) => a.id === selectedId) ?? visibleActivities[0] ?? null;
	}

	let activeActivity = $derived(computeActiveActivity());

	// Keep selection valid when filters change.
	$effect(() => {
		if (!visibleActivities.some((a) => a.id === selectedId)) {
			selectedId = visibleActivities[0]?.id ?? '';
		}
	});

	function priorityBadgeClasses(key: ActivityPriorityKey) {
		if (key === 'urgent') return 'bg-rose-50 text-rose-500 border border-rose-100';
		if (key === 'medium') return 'bg-amber-50 text-amber-600 border border-amber-100';
		return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
	}

	function lineLink(lineId: string | null | undefined) {
		if (!lineId) return '#';
		const cleanId = lineId.replace('@', '');
		return `https://line.me/ti/p/~${cleanId}`;
	}

	async function copyScript() {
		const a = activeActivity;
		if (!a?.script) return;
		await navigator.clipboard?.writeText(a.script);
		toast = 'คัดลอกข้อความแล้ว!';
		setTimeout(() => (toast = null), 2500);
	}

	async function markCompleted() {
		const a = activeActivity;
		if (!a) return;

		const res = await fetch('/action-stream/complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ activityId: a.id })
		});

		if (!res.ok) return;
		window.location.reload();
	}
</script>

<div class="max-w-screen-2xl mx-auto p-4 md:p-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Action Stream</h1>
			<p class="text-slate-500 mt-1">กิจกรรมที่ต้องทำ เรียงตามความสำคัญ</p>
		</div>

		<div class="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
			<button
				type="button"
				class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {priorityFilter === 'all'
					? 'bg-slate-800 text-white shadow-sm'
					: 'text-slate-600 hover:bg-slate-50'}"
				onclick={() => (priorityFilter = 'all')}
			>
				ทั้งหมด
			</button>

			<button
				type="button"
				class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {priorityFilter === 'urgent'
					? 'bg-slate-800 text-white shadow-sm'
					: 'text-slate-600 hover:bg-slate-50'}"
				onclick={() => (priorityFilter = 'urgent')}
			>
				ด่วน
			</button>

			<button
				type="button"
				class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors {priorityFilter === 'medium'
					? 'bg-slate-800 text-white shadow-sm'
					: 'text-slate-600 hover:bg-slate-50'}"
				onclick={() => (priorityFilter = 'medium')}
			>
				ปานกลาง
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- List -->
		<div class="lg:col-span-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 custom-scrollbar">
			{#if visibleActivities.length === 0}
				<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-slate-500">
					ไม่มีงานที่ต้องทำ
				</div>
			{:else}
				{#each visibleActivities as a (a.id)}
					<button
						type="button"
						class="w-full text-left p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative group hover:shadow-md bg-white {a.id === activeActivity?.id
							? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-emerald-500/10'
							: 'border-transparent shadow-sm hover:border-slate-200'}"
						onclick={() => (selectedId = a.id)}
					>
						<div class="flex items-start justify-between mb-1">
							<div class="flex items-center gap-2">
								<span class={`text-xs px-2 py-0.5 rounded font-bold ${priorityBadgeClasses(a.priority_key)}`}>
									{a.priority_label}
								</span>
								<h3 class="font-bold text-slate-800">
									<span class="text-emerald-600">[{a.action_type}]</span>
									{customerFormalLabel(a.customer_name)}
								</h3>
							</div>
							<svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>

						<p class="text-sm text-slate-600 mb-2 line-clamp-1">{a.title}</p>

						{#if a.warning}
							<div class="flex items-center gap-1.5 text-xs text-amber-500 font-medium mb-3">
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								<span>{a.warning}</span>
							</div>
						{:else}
							<div class="mb-3 h-4"></div>
						{/if}

						<div class="flex justify-between items-end border-t border-slate-50 pt-2">
							<div class="flex items-center gap-1 text-xs text-slate-400">
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{a.time}
							</div>
							<div class="font-bold text-slate-800 text-sm">฿{a.amount.toLocaleString()}</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>

		<!-- Detail -->
		<div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 min-h-[600px] relative">
			{#if activeActivity}
				<div class="space-y-5">
					<div class="flex justify-between items-start mb-2">
						<div>
							<div class="flex items-center gap-3 mb-2">
								<span
									class={`text-lg px-3 py-1 rounded-lg font-bold ${priorityBadgeClasses(activeActivity.priority_key)}`}
								>
									{activeActivity.priority_label}
								</span>
								<span class="text-slate-500 text-sm flex items-center gap-1">
									กำหนด <span>{activeActivity.time}</span>
								</span>
							</div>

							<h2 class="text-2xl font-bold text-slate-800">
								<span class="text-emerald-500">[{activeActivity.action_type}]</span>
								{customerFormalLabel(activeActivity.customer_name)}
							</h2>
							<p class="text-slate-500 mt-1">{activeActivity.title}</p>
						</div>

						<div class="text-right">
							<p class="text-xs text-slate-400 mb-1">มูลค่าดีล</p>
							<p class="text-3xl font-bold text-emerald-500">฿{activeActivity.amount.toLocaleString()}</p>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-4 mb-6">
						<div class="bg-slate-50 p-4 rounded-xl">
							<p class="text-xs text-slate-400 mb-1">ชื่อเล่น</p>
							<p class="font-bold text-slate-800 text-lg">
								{customerNicknameOrNull(activeActivity.customer_nickname) ?? '—'}
							</p>
						</div>
						<div class="bg-slate-50 p-4 rounded-xl">
							<p class="text-xs text-slate-400 mb-1">LINE ID</p>
							<p class="font-bold text-slate-800 text-lg">{activeActivity.line_id ?? '-'}</p>
						</div>
						<div class="bg-slate-50 p-4 rounded-xl">
							<p class="text-xs text-slate-400 mb-1">ติดต่อล่าสุด</p>
							<p class="font-bold text-slate-800 text-lg">{activeActivity.last_contact ?? '-'}</p>
						</div>
					</div>

					{#if activeActivity.warning}
						<div class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
							<div class="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<div>
								<h4 class="font-bold text-amber-600">สัญญาณ</h4>
								<p class="text-slate-600 text-sm">{activeActivity.warning}</p>
							</div>
						</div>
					{/if}

					<div class="mb-8">
						<p class="text-sm font-semibold text-slate-500 mb-2">Script สำหรับส่ง</p>
						<div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-700 leading-relaxed text-lg shadow-inner">
							<p class="whitespace-pre-wrap">{activeActivity.script || '— ไม่มี Script สำหรับ Stage นี้ —'}</p>
						</div>
					</div>

					<div class="flex gap-4 mb-6">
						<button
							type="button"
							class="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
							onclick={copyScript}
						>
							<svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
							</svg>
							Copy Message
						</button>

						<a
							href={lineLink(activeActivity.line_id)}
							target="_blank"
							rel="noopener noreferrer"
							class="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							Open in LINE
						</a>
					</div>

					<div class="text-center">
						<button
							type="button"
							class="text-emerald-500 hover:text-emerald-600 font-medium text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
							onclick={markCompleted}
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							ทำเสร็จแล้ว
						</button>
					</div>
				</div>
			{:else}
				<div class="text-slate-500">ไม่มีข้อมูล</div>
			{/if}
		</div>
	</div>

	{#if toast}
		<div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50">
			<span>{toast}</span>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 20px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #94a3b8;
	}
</style>

