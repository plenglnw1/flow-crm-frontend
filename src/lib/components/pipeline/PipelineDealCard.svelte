<script lang="ts">
	export type DealCard = {
		id: string                 ;
		customerName: string       ;
		organizationName?: string  ;
		value: number              ;
		isStale: boolean           ;
		nextAction?: string        ;
		nextActionDate?: string    ;
		expectedCloseDate?: string ;
		ageHours: number           ;
		expectedCloseDate?: string ;
	ageHours: number            ;
	}                           ;

let { deal, onDragStart, onEdit, onDelete } = $props<{
	deal: DealCard                                          ;
	onDragStart: (event: DragEvent, deal: DealCard) => void ;
	onEdit?: (dealId: string) => void                       ;
	onDelete?: (dealId: string) => void                     ;
}>()                                                     ;

function formatAgeHours(ageHours: number): string {
	const safe = Number.isFinite(ageHours) ? Math.max(0, Math.floor(ageHours)) : 0 ;
	const days = Math.floor(safe / 24)                                             ;
	const hours = safe % 24                                                        ;

	if (days > 0 && hours > 0) return `${days} วัน ${hours} ชม.` ;
	if (days > 0) return `${days} วัน`                               ;
	if (hours > 0) return `${hours} ชม.`                               ;
	return 'น้อยกว่า 1 ชม.';
}

const hasPlannedNextAction = $derived(
	Boolean(deal.nextAction?.trim()) || Boolean(deal.nextActionDate && deal.nextActionDate !== '-')
)                                                                                                ;
</script>

<div
	draggable="true"
	on:dragstart={(e) => onDragStart(e, deal)}
	class="p-4 rounded-xl border border-gray-200 shadow-sm bg-white cursor-move hover:shadow-md hover:border-emerald-300 transition-all relative group"
>
	{                                                                                                                                                          #if onEdit}
		<button
			type="button"
			class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-900/5 hover:bg-slate-900/10 text-slate-600"
			on:click={(e) => {
				e.stopPropagation()                                                                                                                                     ;
				onEdit(deal.id)                                                                                                                                         ;
			}}
			aria-label="Edit deal"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
		</button>
	{/if}

	{                                                                                                                                                                                                             #if onDelete}
		<button
			type="button"
			class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-600/5 hover:bg-red-600/10 text-red-600"
			on:click={(e) => {
				e.stopPropagation()                                                                                                                                                                                        ;
				onDelete(deal.id)                                                                                                                                                                                          ;
			}}
			aria-label="Delete deal"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-5 0h16" />
			</svg>
		</button>
	{/if}

	<div class="mb-3">
		<h3 class="font-bold text-slate-800 text-lg">{deal.customerName}</h3>
		{                                                                                #if deal.organizationName}
			<p class="text-sm text-slate-500">({deal.organizationName})</p>
		{/if}
		<p class="text-emerald-500 font-bold mt-1">฿ {deal.value.toLocaleString()}</p>
	</div>

	{                                                                                                                                             #if deal.isStale && !hasPlannedNextAction}
		<div class="bg-red-50 p-3 rounded-lg border border-red-100 mb-3">
			<div class="flex items-center gap-2 text-red-500 font-bold text-xs mb-1">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				ไม่มี Next Action!
			</div>
			<p class="text-slate-800 font-medium text-sm">กำหนดกิจกรรมด่วน</p>
		</div>
	{:else if deal.isStale && hasPlannedNextAction}
		<div class="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-3">
			<div class="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				Next Action เลยกำหนดแล้ว
			</div>
			<p class="text-xs text-amber-900/70 mb-1">สิ่งที่ต้องทำต่อ:</p>
			<p class="text-slate-800 font-medium text-sm">{deal.nextAction?.trim() || 'รอดำเนินการ'}</p>
			<div class="flex items-center gap-1 mt-2 text-xs text-amber-900/70">
				<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				ครบกำหนด: {deal.nextActionDate ?? '-'}
			</div>
		</div>
	{:else}
		<div class="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
			<p class="text-xs text-slate-400 mb-1">Next Step:</p>
@@ -103,8 +136,11 @@ function formatAgeHours(ageHours: number): string {
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				ครบกำหนด Next Action: {deal.nextActionDate ?? '-'}
			</div>
			{                                                                                                                                           #if deal.expectedCloseDate && deal.expectedCloseDate !== '-'}
				<p class="text-xs text-slate-400 mt-2">ปิดดีลคาดหมาย: {deal.expectedCloseDate}</p>
			{/if}
		</div>
	{/if}
