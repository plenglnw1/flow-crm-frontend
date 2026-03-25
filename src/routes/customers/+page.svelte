<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CustomerListCard, {
		type CustomerListItem
	} from '$lib/components/customers/CustomerListCard.svelte';
	import CustomerStatusBadge from '$lib/components/customers/CustomerStatusBadge.svelte';

	let { data } = $props();

	// Assuming data.customers has Laravel pagination structure: data.customers.data
	let customersList: CustomerListItem[] = $derived(data.customers?.data ?? []);
	let totalCustomers = $derived(data.customers?.total ?? 0);

	let searchQuery = $state($page.url.searchParams.get('search') ?? '');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let selectedCustomer = $state<CustomerListItem | null>(null);

	// By default, select the first on load if exists and none selected
	$effect(() => {
		if (customersList.length > 0 && !selectedCustomer) {
			selectedCustomer = customersList[0];
		}
	});

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchQuery) {
				url.searchParams.set('search', searchQuery);
			} else {
				url.searchParams.delete('search');
			}
			goto(url, { keepFocus: true, replaceState: true });
		}, 300);
	}

	function selectCustomer(customer: CustomerListItem) {
		selectedCustomer = customer;
	}
</script>

<div class="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
	<!-- Header Section -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
			<p class="text-sm text-slate-500 mt-1">ลูกค้าทั้งหมด {totalCustomers} ราย</p>
		</div>
		<button
			type="button"
			class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
			onclick={() => goto('/customers/create')}
		>
			<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			เพิ่มลูกค้าใหม่
		</button>
	</div>

	<!-- Main Content Area -->
	<div class="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
		<!-- Left Panel: List -->
		<div class="w-full lg:w-1/3 flex flex-col h-full bg-slate-50">
			<!-- Search & Filter Bar -->
			<div class="flex gap-2 mb-4 shrink-0">
				<div class="relative flex-1">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<input
						type="text"
						class="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 shadow-sm bg-white"
						placeholder="ค้นหาชื่อ, ชื่อเล่น, LINE ID..."
						value={searchQuery}
						oninput={handleSearch}
					/>
				</div>
				<button
					class="inline-flex items-center gap-x-1.5 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
				>
					<svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
						/>
					</svg>
					Filter
				</button>
			</div>

			<!-- Customer List Scrollable Area -->
			<div class="flex-1 overflow-y-auto pr-1 space-y-3 pb-4">
				{#if customersList.length === 0}
					<div class="text-center py-10 bg-white rounded-xl border border-slate-200 border-dashed">
						<p class="text-sm text-slate-500">ไม่พบรายชื่อลูกค้า</p>
					</div>
				{:else}
					{#each customersList as customer}
						<CustomerListCard
							{customer}
							isSelected={selectedCustomer?.id === customer.id}
							onclick={() => selectCustomer(customer)}
						/>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Right Panel: Preview Detail -->
		<div
			class="w-full lg:w-2/3 h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
		>
			{#if selectedCustomer}
				<!-- Header block -->
				<div
					class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<div class="flex items-center gap-5">
						<div
							class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold"
						>
							{(selectedCustomer.nickname || selectedCustomer.name).slice(0, 1).toUpperCase()}
						</div>
						<div>
							<div class="flex items-center gap-3">
								<h2 class="text-xl font-bold text-slate-900">คุณ{selectedCustomer.name}</h2>
								<CustomerStatusBadge isActive={selectedCustomer.is_active} />
							</div>
							<p class="text-slate-500 mt-1">ชื่อเล่น: {selectedCustomer.nickname || '-'}</p>
						</div>
					</div>
					<div>
						<button
							class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm gap-2"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
							Open in LINE
						</button>
					</div>
				</div>

				<!-- Stats placeholder area for now as step 1-3 -->
				<div class="p-6 flex-1 overflow-y-auto">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
						<!-- Some mock details since we don't have full data in the list API usually, but to match layout -->
						<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
							<div class="flex items-start gap-3">
								<svg
									class="w-5 h-5 text-slate-400 mt-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								<div>
									<p class="text-xs text-slate-500 font-medium mb-1">LINE ID</p>
									<p class="font-medium text-slate-900">@... (คลิกเพื่อดูรายละเอียดเพิ่มเติม)</p>
								</div>
							</div>
						</div>
						<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
							<div class="flex items-start gap-3">
								<svg
									class="w-5 h-5 text-slate-400 mt-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
								<div>
									<p class="text-xs text-slate-500 font-medium mb-1">เบอร์โทร</p>
									<p class="font-medium text-slate-900">-</p>
								</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div
							class="rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center shadow-sm"
						>
							<p class="text-2xl font-bold text-emerald-500 mb-1">
								฿{(selectedCustomer.lifetime_value ?? 0).toLocaleString()}
							</p>
							<p class="text-xs text-slate-500 font-medium">ยอดขายรวม</p>
						</div>
						<div
							class="rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center shadow-sm"
						>
							<p class="text-2xl font-bold text-slate-900 mb-1">-</p>
							<p class="text-xs text-slate-500 font-medium">จำนวนดีล</p>
						</div>
						<div
							class="rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center shadow-sm"
						>
							<p class="text-xl font-bold text-slate-900 mb-1">-</p>
							<p class="text-xs text-slate-500 font-medium">ติดต่อล่าสุด</p>
						</div>
					</div>

					<!-- Link to view full details wrapper for step 4 later -->
					<div class="text-center py-4">
						<p class="text-sm text-slate-500 mb-3">
							แสดงข้อมูลเบื้องต้น หากต้องการรับข้อมูลทั้งหมดสามารถกดปุ่มนี้
						</p>
						<button
							class="text-emerald-600 font-medium hover:text-emerald-700 transition"
							onclick={() => goto(`/customers/${selectedCustomer?.id}`)}
						>
							ดูข้อมูลลูกค้าและกิจกรรมแบบเต็ม &rarr;
						</button>
					</div>
				</div>
			{:else}
				<div class="flex-1 flex flex-col items-center justify-center text-slate-400">
					<svg
						class="w-16 h-16 mb-4 text-slate-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p class="text-lg font-medium text-slate-500">เลือกรายชื่อลูกค้าเพื่อดูรายละเอียด</p>
					<p class="text-sm mt-1">คลิกที่การ์ดลูกค้าจากรายการด้านซ้าย</p>
				</div>
			{/if}
		</div>
	</div>
</div>
