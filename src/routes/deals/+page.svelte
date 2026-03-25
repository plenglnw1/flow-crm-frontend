<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-[60vh] flex items-center justify-center bg-white p-6">
	<div class="max-w-md w-full border border-slate-200 rounded-xl p-6 shadow-sm">
		<h1 class="text-xl font-bold text-slate-900 mb-2">Deals</h1>
		<p class="text-sm text-slate-600 mb-4">ใช้ Pipeline เพื่อจัดการดีล (สร้าง/ย้ายสถานะ/แก้ไขลบจากหน้า edit)</p>
		<div class="flex gap-3">
			<button
				type="button"
				class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all"
				on:click={() => goto('/deals/create')}
			>
				สร้างดีลใหม่
			</button>
			<button
				type="button"
				class="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
				on:click={() => goto('/pipeline-stages')}
			>
				ไป Pipeline
			</button>
		</div>
	</div>
</div>

