<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
		<h1 class="text-2xl font-bold text-slate-900">Pipeline Templates</h1>
		<p class="text-slate-600 mt-2">
			หน้านี้กำลังปรับปรุงให้เชื่อมกับข้อมูลจริง (ทีม/องค์กร) แทน mock data
		</p>

		<div class="mt-6 flex flex-wrap gap-3">
			<button
				type="button"
				class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
				onclick={() => goto('/pipeline-stages')}
			>
				ไปที่ Pipeline
			</button>
		</div>
	</div>
</div>

