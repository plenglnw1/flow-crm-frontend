<script lang="ts">
	import { goto } from '$app/navigation';
	import PipelineColumn, { type Stage } from '$lib/components/pipeline/PipelineColumn.svelte';
	import type { DealCard } from '$lib/components/pipeline/PipelineDealCard.svelte';

	type BackendStage = { id: string; name: string; position: number; is_won: boolean };
	type BackendDeal = {
		id: string;
		stage_id: string | null;
		name: string;
		value: number;
		next_action?: string | null;
		expected_close_date?: string | null;
		is_stale: boolean;
		days_in_stage: number;
		customer: { name: string | null; organization_name: string | null; nickname: string | null };
	};

	let { data }: { data: { stages: BackendStage[]; deals: BackendDeal[] } } = $props();

	function dotColorClassByStageName(stageName: string) {
		// Stage name in seed is often like "ลูกค้า (Prospect)" so we match by keyword.
		const s = stageName.toLowerCase();
		if (s.includes('prospect')) return 'bg-gray-400';
		if (s.includes('contacted')) return 'bg-emerald-300';
		if (s.includes('quoted')) return 'bg-yellow-300';
		if (s.includes('negotiation')) return 'bg-slate-400';
		if (s.includes('won')) return 'bg-green-500';
		return 'bg-slate-300';
	}

	function formatExpectedCloseDate(input: string | null | undefined) {
		if (!input) return '-';
		const d = new Date(input);
		if (Number.isNaN(d.getTime())) return '-';
		return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
	}

	function mapDeal(d: BackendDeal): DealCard {
		return {
			id: d.id,
			customerName: d.customer.name ?? 'Unknown Customer',
			organizationName: d.customer.organization_name ?? undefined,
			value: d.value,
			isStale: d.is_stale,
			nextAction: d.next_action ?? undefined,
			expectedCloseDate: formatExpectedCloseDate(d.expected_close_date),
			daysInStage: d.days_in_stage
		};
	}

	let draggedItem = $state<DealCard | null>(null);
	let sourceStageIndex = $state<number | null>(null);
	let showToast = $state(false);
	let toastMessage = $state('');

	type StageWithDeals = Stage & { dotColorClass: string; deals: DealCard[] };

	function computeStagesWithDeals(): StageWithDeals[] {
		return data.stages
			.slice()
			.sort((a: BackendStage, b: BackendStage) => a.position - b.position)
			.map((s: BackendStage) => {
				const deals = data.deals
					.filter((d: BackendDeal) => d.stage_id === s.id)
					.map((d: BackendDeal) => mapDeal(d));

				return {
					id: s.id,
					name: s.name,
					position: s.position,
					deals,
					dotColorClass: dotColorClassByStageName(s.name)
				};
			});
	}

	const stagesWithDeals = $derived(computeStagesWithDeals());

	const totalValue = $derived(
		stagesWithDeals.reduce(
			(sum: number, s: StageWithDeals) => sum + s.deals.reduce((ds: number, d: DealCard) => ds + d.value, 0),
			0
		)
	);

	function triggerToast(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => (showToast = false), 3000);
	}

	function startDrag(event: DragEvent, deal: DealCard) {
		draggedItem = deal;
		const stage = stagesWithDeals.find(
			(s: StageWithDeals) => s.deals.some((d: DealCard) => d.id === deal.id)
		);
		sourceStageIndex = stage?.position ?? null;

		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
		const target = event.currentTarget as HTMLElement | null;
		if (target) target.style.opacity = '0.5';
	}

	function dragOver(_event: DragEvent, _targetIndex: number) {
		// No-op
	}

	function isInvalidDrop(targetIndex: number) {
		if (draggedItem === null || sourceStageIndex === null) return false;
		return targetIndex < sourceStageIndex;
	}

	function editDeal(dealId: string) {
		goto(`/deals/${dealId}/edit`);
	}

	function addDeal(stageId: string) {
		goto(`/deals/create?stage_id=${encodeURIComponent(stageId)}`);
	}

	async function drop(event: DragEvent, targetStageId: string, targetIndex: number) {
		const target = event.target as HTMLElement | null;
		if (target) target.style.opacity = '1';

		if (!draggedItem || sourceStageIndex === null) return;

		if (targetIndex < sourceStageIndex) {
			triggerToast('ห้ามย้อนสถานะการขาย เพื่อรักษาความถูกต้องของ Process');
			return;
		}
		if (targetIndex === sourceStageIndex) return;

		const res = await fetch('/pipeline-stages/move-stage', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ dealId: draggedItem.id, targetStageId })
		});

		if (!res.ok) {
			triggerToast('ไม่สามารถย้ายดีลได้ กรุณาลองใหม่');
			return;
		}

		window.location.reload();
	}

	async function deleteDeal(dealId: string) {
		const res = await fetch('/pipeline-stages/delete-deal', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ dealId })
		});

		if (!res.ok) {
			triggerToast('ลบดีลไม่สำเร็จ');
			return;
		}

		window.location.reload();
	}
</script>

<div class="min-h-screen bg-white">
	<div class="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
			<p class="text-slate-500 mt-1">
				มูลค่ารวม <span class="font-bold text-slate-800">฿{totalValue.toLocaleString()}</span>
			</p>
		</div>

		<div class="flex items-center gap-3">
			<button
				type="button"
				class="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
				on:click={() => goto('/pipeline-stages/create')}
			>
				<svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				เพิ่ม Stage
			</button>

			<button
				type="button"
				class="bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all font-medium"
				on:click={() => goto('/deals/create')}
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
			{#each stagesWithDeals as stage (stage.id)}
				<PipelineColumn
					stage={{ id: stage.id, name: stage.name, position: stage.position }}
					deals={stage.deals}
					dotColorClass={stage.dotColorClass}
					invalidDrop={isInvalidDrop(stage.position)}
					onDrop={drop}
					onDragOver={dragOver}
					onDealDragStart={startDrag}
					onAddDeal={addDeal}
					onEdit={editDeal}
					onDelete={deleteDeal}
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

