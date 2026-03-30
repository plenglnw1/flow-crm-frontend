<script lang="ts">
	type CustomerOption = { id: string; label: string; name?: string; nickname?: string };
	type StageOption = { id: string; name: string; is_won: boolean; position?: number };

	type DealLike = {
		name?: string;
		customer_id?: string;
		value?: number | string;
		expected_close_date?: string | null;
		next_action?: string | null;
		next_action_date?: string | null;
		description?: string | null;
		lost_reason?: string | null;
		stage_id?: string | null;
	};

	let {
		customers,
		stages,
		deal = {},
		initialStageId
	} = $props<{
		customers: CustomerOption[];
		stages: StageOption[];
		deal?: DealLike;
		initialStageId?: string;
	}>();

	const wonStageId = $derived(stages.find((s: StageOption) => s.is_won)?.id ?? '');

	let name = $state(deal.name ?? '');
	let customerId = $state(deal.customer_id ?? '');
	let value = $state(String(deal.value ?? ''));
	let expectedCloseDate = $state(deal.expected_close_date ?? '');
	let description = $state(deal.description ?? '');
	let nextAction = $state(deal.next_action ?? '');
	let nextActionDate = $state(deal.next_action_date ?? '');
	let lostReason = $state(deal.lost_reason ?? '');

	// Prefer `initialStageId` (e.g. force "lost" when deal has lost_at set).
	let stage = $state<string>(initialStageId ?? deal.stage_id ?? (stages[0]?.id ?? ''));

	const isLost = $derived(stage === 'lost');
	const isWon = $derived(stage !== 'lost' && stage !== '' && stage === wonStageId);

	const lostReasonOptions = [
		{ value: 'price', label: 'สู้ราคาไม่ได้' },
		{ value: 'competitor', label: 'คู่แข่งดีกว่า' },
		{ value: 'not_interested', label: 'ลูกค้าเปลี่ยนใจ/ไม่สนใจ' },
		{ value: 'other', label: 'อื่นๆ' }
	];
</script>

<div class="space-y-6">
	<!-- Deal detail -->
	<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
		<div class="flex items-center gap-2 mb-2">
			<h2 class="text-lg font-bold text-slate-900">รายละเอียดดีล</h2>
			<p class="text-sm text-slate-500">ข้อมูลเบื้องต้นสำหรับการขาย</p>
		</div>

		<div class="space-y-4">
			<div>
				<label class="text-sm font-semibold text-slate-700">ชื่อดีล (Deal Name)</label>
				<input
					class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					name="name"
					required
					bind:value={name}
					placeholder="เช่น ขายคอนโดคุณต้น"
				/>
			</div>

			<div>
				<label class="text-sm font-semibold text-slate-700">ลูกค้า (Customer)</label>
				<select
					name="customer_id"
					class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					required
					bind:value={customerId}
				>
					<option value="" disabled>ค้นหาจาก ชื่อ, ชื่อเล่น, Line ID...</option>
					{#each customers as c (c.id)}
						<option value={c.id}>{c.label}</option>
					{/each}
				</select>
				<p class="text-xs text-slate-400 mt-1">พิมพ์เพื่อค้นหาชื่อเล่นได้ทันที</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="text-sm font-semibold text-slate-700">มูลค่า (บาท)</label>
					<input
						type="number"
						step="0.01"
						name="value"
						required
						bind:value={value}
						class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
						placeholder="0.00"
					/>
				</div>

				<div>
					<label class="text-sm font-semibold text-slate-700">คาดว่าจะปิดวันที่</label>
					<input
						type="date"
						name="expected_close_date"
						bind:value={expectedCloseDate}
						class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Stage & progress -->
	<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
		<div>
			<h2 class="text-lg font-bold text-slate-900">ความคืบหน้า</h2>
			<p class="text-sm text-slate-500">อัปเดตสถานะและวางแผนงานถัดไป</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="md:col-span-2">
				<label class="text-sm font-semibold text-slate-700">ขั้นตอนการขาย (Stage)</label>
				<select
					name="stage"
					class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 bg-white font-medium"
					bind:value={stage}
					required
				>
					{#each stages as s (s.id)}
						<option value={s.id} class={s.is_won ? 'text-emerald-600 font-bold' : ''}>
							{s.name}{s.is_won ? ' (ปิดการขายสำเร็จ)' : ''}
						</option>
					{/each}
					<option value="lost" class="text-red-600 font-bold">Closed Lost (แพ้ดีล)</option>
				</select>
			</div>

			{#if isLost}
				<div class="md:col-span-2 bg-red-50 p-4 rounded-lg border border-red-200">
					<label class="text-sm font-bold text-red-700">สาเหตุที่เสียดีล (Lost Reason) *</label>
					<select
						name="lost_reason"
						class="w-full mt-2 px-3 py-2 rounded border border-red-300 text-red-900 bg-white"
						bind:value={lostReason}
						required
					>
						<option value="">ระบุสาเหตุ...</option>
						{#each lostReasonOptions as o}
							<option value={o.value}>{o.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if !isLost && !isWon}
				<div class="md:col-span-2 my-2 border-t border-slate-100"></div>

				<div class="md:col-span-2">
					<div class="flex items-center gap-2 mb-1.5">
						<label class="text-sm font-bold text-emerald-700">สิ่งที่ต้องทำถัดไป (Next Action)</label>
						<span class="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">MANDATORY</span>
					</div>
					<input
						type="text"
						name="next_action"
						placeholder="เช่น โทรยืนยันนัด, ส่งใบเสนอราคาแก้ไข"
						class="w-full px-4 py-2.5 rounded-lg border-2 border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all text-slate-800"
						bind:value={nextAction}
						required
					/>
					<p class="text-xs text-slate-400 mt-1">ระบบจะสร้าง Task ในปฏิทินให้อัตโนมัติ</p>
				</div>

				<div>
					<label class="text-sm font-bold text-emerald-700">กำหนดทำวันที่</label>
					<input
						type="date"
						name="next_action_date"
						class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
						bind:value={nextActionDate}
						required
					/>
				</div>
			{/if}
		</div>
	</div>

	<!-- Extra -->
	<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
		<label class="text-sm font-semibold text-slate-700">รายละเอียดเพิ่มเติม</label>
		<textarea
			name="description"
			rows={3}
			class="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
			bind:value={description}
		/>
	</div>

</div>

