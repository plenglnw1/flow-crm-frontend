<script lang="ts">
	import { customerFormalLabel } from '$lib/customer-display';
	import CustomerStatusBadge from './CustomerStatusBadge.svelte';

	export type CustomerListItem = {
		id: number;
		name: string;
		nickname?: string | null;
		is_active: boolean;
		lifetime_value?: number;
		organization_name?: string | null;
		phone_num?: string | null;
		line_id?: string | null;
		avatar_url?: string | null;
	};

	let {
		customer,
		isSelected = false,
		onclick
	} = $props<{
		customer: CustomerListItem;
		isSelected?: boolean;
		onclick?: () => void;
	}>();

	const initials = $derived((customer.nickname || customer.name).slice(0, 1).toUpperCase());
</script>

<button
	type="button"
	class="w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group {isSelected
		? 'border-emerald-500 bg-white ring-1 ring-emerald-500 shadow-sm'
		: 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'}"
	{onclick}
>
	<div class="flex items-center gap-4">
		<div
			class="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden {isSelected
				? 'bg-emerald-100 text-emerald-700'
				: 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'} transition-colors"
		>
			{#if customer.avatar_url}
				<img
					src={customer.avatar_url}
					alt=""
					class="w-full h-full object-cover"
					referrerpolicy="no-referrer"
				/>
			{:else}
				{initials}
			{/if}
		</div>
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<span class="font-bold text-slate-900 leading-none">
					{customer.nickname ? customer.nickname : customer.name}
				</span>
				<CustomerStatusBadge isActive={customer.is_active} />
			</div>
			<span class="text-sm text-slate-500 leading-none truncate max-w-[180px]">
				{customerFormalLabel(customer.name)}
				{customer.organization_name ? ` (${customer.organization_name})` : ''}
			</span>
		</div>
	</div>
	<div class="flex flex-col items-end gap-1">
		<svg
			class="w-5 h-5 text-slate-400 {isSelected
				? 'text-emerald-500'
				: 'group-hover:text-emerald-400'} transition-colors"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		<span class="font-semibold {isSelected ? 'text-emerald-600' : 'text-emerald-500'}">
			THB {(customer.lifetime_value ?? 0).toLocaleString()}
		</span>
	</div>
</button>
