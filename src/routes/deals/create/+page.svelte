<script lang="ts">
	import DealFormFields from '$lib/components/deals/DealFormFields.svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="max-w-3xl mx-auto py-6 space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a
				href="#"
				class="p-2 text-slate-500 hover:bg-white rounded-lg transition-all"
				on:click|preventDefault={() => goto('/pipeline-stages')}
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
			</a>
			<div>
				<h1 class="text-2xl font-bold text-slate-900">New deal</h1>
				<p class="text-sm text-slate-500">Fill in the basics to start tracking</p>
			</div>
		</div>

		<button type="submit" form="createDealForm" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			Create deal
		</button>
	</div>

	<form id="createDealForm" method="POST" class="space-y-6">
		<DealFormFields customers={data.customers} stages={data.stages} initialStageId={data.initialStageId} />
	</form>
</div>

