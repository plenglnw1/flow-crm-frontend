<script lang="ts">
	let { isActive = true } = $props<{ isActive: boolean }>();
</script>

{#if isActive}
	<span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
		Active
	</span>
{:else}
	<span class="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset">
		Inactive
	</span>
{/if}
