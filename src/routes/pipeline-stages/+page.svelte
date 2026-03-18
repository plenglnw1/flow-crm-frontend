<script lang="ts">
	import PipelineColumn, { type Stage } from '$lib/components/pipeline/PipelineColumn.svelte';
	import type { DealCard } from '$lib/components/pipeline/PipelineDealCard.svelte';

	type StageWithDeals = Stage & { deals: DealCard[]; dotColorClass: string };

	const stages: StageWithDeals[] = [
		{
			id: 'prospect',
			name: 'Prospect',
			position: 0,
			dotColorClass: 'bg-gray-400',
			deals: [
				{
					id: 'd1',
					customerName: 'Acme Co., Ltd.',
					organizationName: 'Acme Group',
					value: 250000,
					isStale: false,
					nextAction: 'โทรนัดเดโม',
					expectedCloseDate: '18 Mar 2026',
					daysInStage: 2
				}
			]
		},
		{
			id: 'contacted',
			name: 'Contacted',
			position: 1,
			dotColorClass: 'bg-emerald-300',
			deals: [
				{
					id: 'd2',
					customerName: 'Blue Ocean',
					value: 89000,
					isStale: true,
					daysInStage: 5
				}
			]
		},
		{
			id: 'quoted',
			name: 'Quoted',
			position: 2,
			dotColorClass: 'bg-yellow-300',
			deals: []
		},
		{
			id: 'negotiation',
			name: 'Negotiation',
			position: 3,
			dotColorClass: 'bg-slate-400',
			deals: []
		},
		{
			id: 'won',
			name: 'Won',
			position: 4,
			dotColorClass: 'bg-green-500',
			deals: []
		}
	];

	let draggedItem: DealCard | null = null;
	let sourceStageIndex: number | null = null;
	let showToast = false;
	let toastMessage = '';

	const totalValue = () =>
		stages.reduce((sum, s) => sum + s.deals.reduce((dSum, d) => dSum + d.value, 0), 0);

	function triggerToast(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => (showToast = false), 3000);
	}

	function startDrag(event: DragEvent, deal: DealCard) {
		draggedItem = deal;
		const stage = stages.find((s) => s.deals.some((d) => d.id === deal.id));
		sourceStageIndex = stage?.position ?? 0;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
		const target = event.currentTarget as HTMLElement | null;
		if (target) target.style.opacity = '0.5';
	}

	function dragOver(_event: DragEvent, _targetIndex: number) {
		// UI-only parity with Alpine version; no-op for now.
	}

	function isInvalidDrop(targetIndex: number) {
		if (draggedItem === null || sourceStageIndex === null) return false;
		return targetIndex < sourceStageIndex;
	}

	function drop(event: DragEvent, _targetStageId: string, targetIndex: number) {
		const target = event.target as HTMLElement | null;
		if (target) target.style.opacity = '1';

		if (sourceStageIndex === null) return;
		if (targetIndex < sourceStageIndex) {
			triggerToast('ห้ามย้อนสถานะการขาย เพื่อรักษาความถูกต้องของ Process');
			return;
		}
		if (targetIndex === sourceStageIndex) return;

		// UI only: do not persist changes yet.
		triggerToast('UI only: drag & drop ยังไม่บันทึกข้อมูล');
	}
</script>

<div class="min-h-screen bg-white">
	<div class="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
			<p class="text-slate-500 mt-1">
				มูลค่ารวม <span class="font-bold text-slate-800">฿{totalValue().toLocaleString()}</span>
			</p>
		</div>

		<div class="flex items-center gap-3">
			<button
				type="button"
				class="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
				disabled
			>
				<svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				เพิ่ม Stage
			</button>

			<button
				type="button"
				class="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all font-medium"
				disabled
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				เพิ่มดีลใหม่
			</button>
		</div>
	</div>

	<div class="p-6 overflow-x-auto">
		<div class="flex gap-6 min-w-max pb-10">
			{#each stages as stage (stage.id)}
				<PipelineColumn
					stage={{ id: stage.id, name: stage.name, position: stage.position }}
					deals={stage.deals}
					dotColorClass={stage.dotColorClass}
					invalidDrop={isInvalidDrop(stage.position)}
					onDrop={drop}
					onDragOver={dragOver}
					onDealDragStart={startDrag}
				/>
			{/each}
		</div>
	</div>

	{#if showToast}
		<div
			class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 transition ease-out duration-300"
		>
			<svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<span>{toastMessage}</span>
		</div>
	{/if}
</div>

