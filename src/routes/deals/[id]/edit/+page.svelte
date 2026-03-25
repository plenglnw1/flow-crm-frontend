<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DealFormFields from '$lib/components/deals/DealFormFields.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form?: { message?: string } | null } = $props();

	const deal = data.deal;
	// If deal can't be loaded, show empty state.

	const initialStageId = deal?.lost_at ? 'lost' : deal?.stage_id ?? '';
	const dealLike = deal
		? {
				...deal,
				customer_id: deal.customer?.id ? String(deal.customer.id) : '',
				stage_id: deal.stage_id ?? null
			}
		: null;

	const updatedAt = deal?.updated_at ? new Date(deal.updated_at) : null;
	const daysInStage = updatedAt ? Math.floor((Date.now() - updatedAt.getTime()) / 86400000) : 0;
	const healthColor = daysInStage > 7 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
	const healthText = daysInStage > 7 ? 'Stagnant (นิ่งนานเกิน)' : 'Healthy (สดใหม่)';

	const stageLabel = deal?.lost_at ? 'Lost' : deal?.stage?.name ?? 'Unknown';

	function copyLineScript() {
		// Simple static template; backend currently doesn't store it.
		const text = `สวัสดีครับ คุณ${deal?.customer?.nickname ?? ''} ผมส่งใบเสนอราคาให้พิจารณา...`;
		navigator.clipboard?.writeText(text);
	}
</script>

{#if deal && dealLike}
<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	{#if form?.message}
		<div
			class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
			role="alert"
		>
			{form.message}
		</div>
	{/if}
	{#if page.url.searchParams.get('saved') === '1'}
		<div
			class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
			role="status"
		>
			บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว
		</div>
	{/if}
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold text-slate-900">{deal.name}</h1>
				<span class={`px-2.5 py-0.5 rounded-full text-xs font-bold ${healthColor}`}>{healthText}</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				ลูกค้า: <strong>{deal.customer?.name ?? '-'}</strong> • สร้างเมื่อ{' '}
				{deal.created_at ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(deal.created_at)) : '-'}
			</p>
		</div>

		<div class="flex gap-3">
			<a
				href="#"
				class="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
				on:click|preventDefault={() => goto('/pipeline-stages')}
			>
				กลับ
			</a>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
		<div class="lg:col-span-2">
			<form id="editDealForm" method="POST" action="?/update" class="space-y-6">
				{#key `${deal.id}-${deal.updated_at ?? ''}`}
					<DealFormFields
						customers={data.customers}
						stages={data.stages}
						deal={dealLike}
						initialStageId={initialStageId}
					/>
				{/key}
			</form>

			<div class="flex justify-end mt-6">
				<button
					type="submit"
					form="editDealForm"
					class="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium shadow-lg hover:bg-slate-800 transition-all"
				>
					บันทึกการเปลี่ยนแปลง
				</button>
			</div>
		</div>

		<div class="space-y-6">
			<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<h3 class="font-bold text-slate-800 flex items-center gap-2">
						<span class="text-emerald-500 text-xl">LINE</span>
					</h3>
					<span class="text-xs text-slate-400">Stage: {stageLabel}</span>
				</div>

				<div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 italic mb-3 relative group">
					"สวัสดีครับ คุณ{deal.customer?.nickname ?? ''} ผมส่งใบเสนอราคาให้พิจารณา..."
				</div>

				<button
					type="button"
					on:click={copyLineScript}
					class="w-full py-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 text-sm font-bold transition-colors flex items-center justify-center gap-2"
				>
					คัดลอกข้อความ
				</button>
			</div>

			<!-- Delete action -->
			<form method="POST" action="?/delete" id="deleteDealForm" class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
				<button
					type="submit"
					on:click={(e) => {
						if (!confirm('ต้องการลบดีลนี้ใช่ไหม?')) e.preventDefault();
					}}
					class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
				>
					ลบดีล
				</button>
			</form>

			<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
				<h3 class="font-bold text-slate-800 mb-4">Timeline กิจกรรม</h3>
				<div class="relative border-l-2 border-slate-200 ml-3 space-y-6">
					{#each data.activities as a (a.id)}
						<div class="relative pl-6">
							<div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></div>
							<p class="text-sm font-bold text-slate-800">{a.title}</p>
							<p class="text-xs text-slate-500">
								{a.created_at ? a.created_at : '-'}
								{#if a.user_name} โดย {a.user_name}{/if}
							</p>
						</div>
					{/each}
					{#if data.activities.length === 0}
						<p class="text-sm text-slate-500 ml-3">ยังไม่มีรายการกิจกรรม</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
{/if}

