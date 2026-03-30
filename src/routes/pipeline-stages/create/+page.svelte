<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let isWon = $state(false);
</script>

<div class="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center gap-3">
		<a href="/pipeline-stages" class="p-2 text-slate-500 hover:bg-white rounded-lg transition-all">
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-slate-900">เพิ่ม Pipeline Stage</h1>
			<p class="text-sm text-slate-500">สร้างขั้นตอนใหม่สำหรับ Pipeline ของทีมคุณ</p>
		</div>
	</div>

	<form method="POST" class="space-y-6">
		<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
			<div>
				<label class="text-sm font-semibold text-slate-700">ชื่อ Stage</label>
				<input
					name="name"
					required
					class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					placeholder="เช่น Qualification"
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="text-sm font-semibold text-slate-700">Position</label>
					<input
						name="position"
						type="number"
						min="0"
						value={data.nextPosition}
						class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					/>
				</div>

				<div class="flex items-center gap-3 pt-6">
					<input type="hidden" name="is_won" value="0" />
					<input
						type="checkbox"
						name="is_won"
						value="1"
						bind:checked={isWon}
						class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
					/>
					<label class="text-sm font-semibold text-slate-700">ตั้งเป็น Won</label>
				</div>
			</div>

			<div>
				<label class="text-sm font-semibold text-slate-700">คำอธิบาย (optional)</label>
				<textarea
					name="description"
					rows={3}
					class="w-full mt-1.5 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-slate-800"
					placeholder="หมายเหตุเกี่ยวกับ Stage นี้"
				></textarea>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<a href="/pipeline-stages" class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all inline-flex items-center justify-center">
				ยกเลิก
			</a>
			<button
				type="submit"
				class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				สร้าง Stage
			</button>
		</div>
	</form>
</div>

