<script lang="ts">
	import { customerFormalLabel } from '$lib/customer-display';
	import { onMount } from 'svelte';

	let { data } = $props();

	const stats = data.stats;
	const activities = data.activities ?? [];
	const chartData = data.chartData;
	const targetProgress = data.target_progress;

	const thMonths = [
		'ม.ค.',
		'ก.พ.',
		'มี.ค.',
		'เม.ย.',
		'พ.ค.',
		'มิ.ย.',
		'ก.ค.',
		'ส.ค.',
		'ก.ย.',
		'ต.ค.',
		'พ.ย.',
		'ธ.ค.'
	];

	let activitiesOpen = $state(true);

	onMount(() => {
		const s = localStorage.getItem('sales-dashboard-activities-open');
		if (s !== null) activitiesOpen = s === 'true';
	});

	function toggleActivitiesOpen() {
		activitiesOpen = !activitiesOpen;
		localStorage.setItem('sales-dashboard-activities-open', String(activitiesOpen));
	}

	function formatTHB(amount: number) {
		return `฿${(amount ?? 0).toLocaleString('th-TH')}`;
	}

	function priorityBadgeClasses(key: 'urgent' | 'medium' | 'normal') {
		if (key === 'urgent') return 'bg-rose-50 text-rose-600 border border-rose-100';
		if (key === 'medium') return 'bg-amber-50 text-amber-600 border border-amber-100';
		return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
	}

	// Tiny SVG line chart (no external chart lib)
	function buildSparkline(values: number[]) {
		const w = 520;
		const h = 140;
		const pad = 18;
		const max = Math.max(...values, 0);
		const min = Math.min(...values, 0);
		const range = Math.max(max - min, 1);

		const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
		const points = values.map((v, i) => {
			const x = pad + step * i;
			const t = (v - min) / range;
			const y = h - pad - t * (h - pad * 2);
			return `${x},${y}`;
		});

		return { points: points.join(' '), w, h };
	}

	let spark = $derived(buildSparkline(chartData?.data ?? []));
</script>

<div class="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Sales Dashboard</h1>
		<p class="text-slate-500 mt-1">ภาพรวมกิจกรรมของคุณวันนี้</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">ต้องทำวันนี้</p>
			<p class="text-3xl font-bold text-rose-500 mt-2">{stats.todo_today}</p>
		</div>
		<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">ดีลค้างเกิน 3 วัน</p>
			<p class="text-3xl font-bold text-amber-500 mt-2">{stats.overdue_deals}</p>
		</div>
		<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">ลูกค้ายืนยันใบเสนอราคา</p>
			<p class="text-3xl font-bold text-emerald-600 mt-2">{stats.confirmed_quotes}</p>
		</div>
		<div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
			<p class="text-xs text-slate-500 font-medium">Revenue เดือนนี้</p>
			<p class="text-3xl font-bold text-slate-900 mt-2">{formatTHB(stats.revenue_month)}</p>
			<p class="text-xs mt-1 font-medium text-slate-500">
				เติบโต {stats.revenue_growth >= 0 ? '+' : ''}{stats.revenue_growth}% จากเดือนก่อน
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
		<div class="lg:col-span-2 space-y-6">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
				<div class="p-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
					<h2 class="font-bold text-slate-800">กิจกรรมที่ต้องทำวันนี้</h2>
					<div class="flex items-center gap-2">
						<span class="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-bold">
							{activities.length} รายการ
						</span>
						<button
							type="button"
							class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50/80"
							onclick={toggleActivitiesOpen}
							aria-expanded={activitiesOpen}
						>
							{activitiesOpen ? 'ซ่อนรายการ' : 'แสดงรายการ'}
						</button>
					</div>
				</div>
				{#if activitiesOpen}
					<div class="divide-y divide-slate-50">
						{#if activities.length === 0}
							<div class="p-6 text-center text-slate-500">ไม่มีงานที่ต้องทำวันนี้</div>
						{:else}
							{#each activities as a (a.id)}
								<div class="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
									<div class="min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<span class={`text-xs px-2 py-0.5 rounded ${priorityBadgeClasses(a.priority_key)}`}>{a.priority_label}</span>
											<p class="font-bold text-slate-800 truncate">
												[{a.action_type}] {customerFormalLabel(a.customer_name)}
											</p>
										</div>
										<p class="text-sm text-slate-600 mt-1">
											{a.title}
										</p>
										{#if a.description}
											<p class="text-xs text-slate-500 mt-1 line-clamp-1">{a.description}</p>
										{/if}
									</div>

									<div class="text-right shrink-0">
										<p class="text-xs text-slate-400 font-medium">{a.time}</p>
										<p class="font-bold text-slate-900 mt-1">{formatTHB(a.amount)}</p>
										{#if a.line_id}
											<a
												href={`https://line.me/ti/p/~${a.line_id.replace('@', '')}`}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs text-emerald-700 hover:underline block mt-2 font-semibold"
											>
												Open in LINE
											</a>
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
				<h2 class="font-bold text-slate-800 mb-2">Revenue Snapshot</h2>
				<p class="text-xs text-slate-400 mb-4">รายได้ที่ปิดดีล (Won) ตามเดือน</p>

				{#if (chartData?.data?.length ?? 0) === 0}
					<div class="text-center text-slate-500 py-10">ไม่มีข้อมูล</div>
				{:else}
					<div class="flex flex-col gap-4">
						<svg viewBox={`0 0 ${spark.w} ${spark.h}`} class="w-full h-[170px]">
							<polyline points={spark.points} fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<div class="flex justify-between text-xs text-slate-500">
							{#each chartData?.labels ?? [] as label}
								<span>{label}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-6">
			<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
				<h3 class="font-bold text-slate-800 mb-1">เป้าหมายรายได้</h3>
				<p class="text-xs text-slate-500">
					{#if targetProgress?.period_month && targetProgress?.period_year}
						เดือน {thMonths[targetProgress.period_month - 1] ?? ''} พ.ศ. {targetProgress.period_year + 543}
						· จากตาราง Target และยอดปิดดีล Won จริง
					{:else}
						จากตาราง Target และยอดปิดดีล Won จริง
					{/if}
				</p>
				<div class="mt-4 space-y-3">
					{#if targetProgress?.has_target}
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">ความคืบหน้าเดือนนี้</span>
							<span class="font-bold text-slate-900">{targetProgress.progress_percent}%</span>
						</div>
						<div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
							<div
								class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
								style="width: {Math.min(100, targetProgress.progress_percent)}%"
							></div>
						</div>
						<div class="text-xs text-slate-600 space-y-1">
							<p>
								เป้าหมายเดือนนี้:
								<span class="font-semibold text-slate-800">{formatTHB(targetProgress.target_amount)}</span>
							</p>
							<p>
								ปิดได้แล้ว (Won ในเดือน):
								<span class="font-semibold text-emerald-700">{formatTHB(targetProgress.achieved_amount)}</span>
							</p>
							<p>
								ปิดได้วันนี้:
								<span class="font-semibold text-slate-800">{formatTHB(targetProgress.revenue_today)}</span>
							</p>
							<p class="text-slate-500">
								ก้าวเป้าหมายสะสมถึงวันนี้ (เฉลี่ยเท่าๆ กันทั้งเดือน):
								{formatTHB(targetProgress.pace_amount_by_today)}
							</p>
						</div>
					{:else}
						<p class="text-sm text-slate-600">
							ยังไม่มีเป้าหมายรายได้เดือนนี้ในระบบ — หัวหน้าทีมตั้งค่า Target ได้จากแดชบอร์ดหลังบ้าน
						</p>
						{#if targetProgress && (targetProgress.revenue_today > 0 || targetProgress.achieved_amount > 0)}
							<p class="text-xs text-slate-500">
								ยอด Won เดือนนี้ (ยังไม่เทียบเป้า): {formatTHB(targetProgress.achieved_amount)}
								· วันนี้ {formatTHB(targetProgress.revenue_today)}
							</p>
						{/if}
					{/if}
				</div>
			</div>

			<div class="bg-amber-50 rounded-2xl border border-amber-100 p-5">
				<div class="flex items-center gap-2 text-amber-700 font-bold">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					สัญญาณเตือน
				</div>
				<p class="text-sm text-slate-700 mt-2">
					{stats.overdue_deals} ดีลของคุณมีงานค้าง (อิงจากกิจกรรมที่ยังไม่เสร็จ)
				</p>
			</div>
		</div>
	</div>
</div>

