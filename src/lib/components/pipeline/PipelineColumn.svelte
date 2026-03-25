<script lang="ts">
	import PipelineDealCard, { type DealCard } from '$lib/components/pipeline/PipelineDealCard.svelte';

	export type Stage = {
		id: string;
		name: string;
		position: number;
	};

	let {
		stage,
		deals = [],
		dotColorClass = 'bg-slate-300',
		invalidDrop = false,
		onDrop,
		onDragOver,
		onDealDragStart,
		onAddDeal,
		onEdit,
		onDelete
	} = $props<{
		stage: Stage;
		deals?: DealCard[];
		dotColorClass?: string;
		invalidDrop?: boolean;
		onDrop: (event: DragEvent, targetStageId: string, targetIndex: number) => void;
		onDragOver: (event: DragEvent, targetIndex: number) => void;
		onDealDragStart: (event: DragEvent, deal: DealCard) => void;
		onAddDeal: (stageId: string) => void;
		onEdit?: (dealId: string) => void;
		onDelete?: (dealId: string) => void;
	}>();

	const totalAmount = $derived(deals.reduce((sum: number, d: DealCard) => sum + d.value, 0));
	const count = $derived(deals.length as number);

	const totalText = () => {
		if (totalAmount <= 0) return '0';
		return `${Math.round(totalAmount / 1000).toLocaleString()}k`;
	};
</script>

<div
	class={`flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-slate-50/50 border border-slate-200/60 ${invalidDrop ? 'bg-red-50/50 cursor-not-allowed opacity-60' : ''}`}
	on:dragover|preventDefault={(e) => onDragOver(e, stage.position)}
	on:drop={(e) => onDrop(e, stage.id, stage.position)}
>
	<div class="p-4 flex items-center justify-between border-b border-slate-100 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
		<div class="flex items-center gap-2">
			<div class={`w-3 h-3 rounded-full ${dotColorClass}`}></div>
			<h3 class="font-bold text-slate-700">{stage.name}</h3>
			<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-semibold">{count}</span>
		</div>
		<div class="text-sm font-semibold text-slate-400">฿{totalText()}</div>
	</div>

	<div class="p-3 space-y-3 flex-1 overflow-y-auto min-h-[500px]">
		{#each deals as deal (deal.id)}
			<PipelineDealCard {deal} onDragStart={onDealDragStart} onEdit={onEdit} onDelete={onDelete} />
		{/each}

		<button
			type="button"
			class="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group"
			on:click={() => onAddDeal(stage.id)}
		>
			<svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			เพิ่มดีล
		</button>
	</div>
</div>

