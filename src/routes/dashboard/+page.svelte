<script lang="ts">
	import { customerFormalLabel } from '$lib/customer-display';
	import { onMount } from 'svelte';

	let { data } = $props();

	const stats = data.stats;
	const activities = data.activities ?? [];
	const chartData = data.chartData;
	const targetProgress = data.target_progress;

	function monthYearLabel(month: number, year: number) {
		return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
	}

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
		return `THB ${(amount ?? 0).toLocaleString('en-US')}`;
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

<div class="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Sales Dashboard</h1>
		<p class="mt-1 text-slate-500">Your activity overview for today</p>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs font-medium text-slate-500">Due today</p>
			<p class="mt-2 text-3xl font-bold text-rose-500">{stats.todo_today}</p>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs font-medium text-slate-500">Deals overdue (&gt;3 days)</p>
			<p class="mt-2 text-3xl font-bold text-amber-500">{stats.overdue_deals}</p>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs font-medium text-slate-500">Quotes confirmed</p>
			<p class="mt-2 text-3xl font-bold text-emerald-600">{stats.confirmed_quotes}</p>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs font-medium text-slate-500">Revenue this month</p>
			<p class="mt-2 text-3xl font-bold text-slate-900">{formatTHB(stats.revenue_month)}</p>
			<p class="mt-1 text-xs font-medium text-slate-500">
				{stats.revenue_growth >= 0 ? '+' : ''}{stats.revenue_growth}% vs last month
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div
					class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"
				>
					<h2 class="font-bold text-slate-800">Tasks due today</h2>
					<div class="flex items-center gap-2">
						<span class="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
							{activities.length} {activities.length === 1 ? 'item' : 'items'}
						</span>
						<button
							type="button"
							class="rounded-lg border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
							onclick={toggleActivitiesOpen}
							aria-expanded={activitiesOpen}
						>
							{activitiesOpen ? 'Hide list' : 'Show list'}
						</button>
					</div>
				</div>
				{#if activitiesOpen}
					<div class="divide-y divide-slate-50">
						{#if activities.length === 0}
							<div class="p-6 text-center text-slate-500">Nothing due today</div>
						{:else}
							{#each activities as a (a.id)}
								<div
									class="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-start"
								>
									<div class="min-w-0">
										<div class="flex flex-wrap items-center gap-2">
											<span
												class={`rounded px-2 py-0.5 text-xs ${priorityBadgeClasses(a.priority_key)}`}
												>{a.priority_label}</span
											>
											<p class="truncate font-bold text-slate-800">
												[{a.action_type}] {customerFormalLabel(a.customer_name)}
											</p>
										</div>
										<p class="mt-1 text-sm text-slate-600">
											{a.title}
										</p>
										{#if a.description}
											<p class="mt-1 line-clamp-1 text-xs text-slate-500">{a.description}</p>
										{/if}
									</div>

									<div class="shrink-0 text-right">
										<p class="text-xs font-medium text-slate-400">{a.time}</p>
										<p class="mt-1 font-bold text-slate-900">{formatTHB(a.amount)}</p>
										{#if a.line_id}
											<a
												href={`https://line.me/ti/p/~${a.line_id.replace('@', '')}`}
												target="_blank"
												rel="noopener noreferrer"
												class="mt-2 block text-xs font-semibold text-emerald-700 hover:underline"
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

			<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 class="mb-2 font-bold text-slate-800">Revenue Snapshot</h2>
				<p class="mb-4 text-xs text-slate-400">Won deal revenue by month</p>

				{#if (chartData?.data?.length ?? 0) === 0}
					<div class="py-10 text-center text-slate-500">No data</div>
				{:else}
					<div class="flex flex-col gap-4">
						<svg viewBox={`0 0 ${spark.w} ${spark.h}`} class="h-[170px] w-full">
							<polyline
								points={spark.points}
								fill="none"
								stroke="#10b981"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
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
			<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h3 class="mb-1 font-bold text-slate-800">Revenue target</h3>
				<p class="text-xs text-slate-500">
					{#if targetProgress?.period_month && targetProgress?.period_year}
						{monthYearLabel(targetProgress.period_month, targetProgress.period_year)}
						· From Target settings and actual Won revenue
					{:else}
						From Target settings and actual Won revenue
					{/if}
				</p>
				<div class="mt-4 space-y-3">
					{#if targetProgress?.has_target}
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">Progress this month</span>
							<span class="font-bold text-slate-900">{targetProgress.progress_percent}%</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
							<div
								class="h-2.5 rounded-full bg-emerald-500 transition-all duration-300"
								style="width: {Math.min(100, targetProgress.progress_percent)}%"
							></div>
						</div>
						<div class="space-y-1 text-xs text-slate-600">
							<p>
								Monthly target:
								<span class="font-semibold text-slate-800"
									>{formatTHB(targetProgress.target_amount)}</span
								>
							</p>
							<p>
								Won this month:
								<span class="font-semibold text-emerald-700"
									>{formatTHB(targetProgress.achieved_amount)}</span
								>
							</p>
							<p>
								Won today:
								<span class="font-semibold text-slate-800"
									>{formatTHB(targetProgress.revenue_today)}</span
								>
							</p>
							<p class="text-slate-500">
								Pace to date (even spread):
								{formatTHB(targetProgress.pace_amount_by_today)}
							</p>
						</div>
					{:else}
						<p class="text-sm text-slate-600">
							No revenue target for this month — managers can set targets in the admin dashboard.
						</p>
						{#if targetProgress && (targetProgress.revenue_today > 0 || targetProgress.achieved_amount > 0)}
							<p class="text-xs text-slate-500">
								Won this month (no target): {formatTHB(targetProgress.achieved_amount)}
								· Today {formatTHB(targetProgress.revenue_today)}
							</p>
						{/if}
					{/if}
				</div>
			</div>

			<div class="rounded-2xl border border-amber-100 bg-amber-50 p-5">
				<div class="flex items-center gap-2 font-bold text-amber-700">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					Heads-up
				</div>
				<p class="mt-2 text-sm text-slate-700">
					{stats.overdue_deals} {stats.overdue_deals === 1 ? 'deal has' : 'deals have'} open work (incomplete
					activities).
				</p>
			</div>
		</div>
	</div>
</div>
