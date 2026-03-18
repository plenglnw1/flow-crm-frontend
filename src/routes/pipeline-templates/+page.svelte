<script lang="ts">
	import PipelineTemplateCard, {
		type PipelineTemplate
	} from '$lib/components/pipeline-template/PipelineTemplateCard.svelte';

	const templates: PipelineTemplate[] = [
		{
			id: 't1',
			title_th: 'อสังหาริมทรัพย์',
			title_en: 'Real Estate',
			description: 'เหมาะกับงานขายบ้าน/คอนโด พร้อมสคริปต์ภาษาไทยและ Stage ตามกระบวนการขายอสังหา',
			color: 'blue',
			icon: 'office-building',
			is_popular: true,
			stages: ['Prospect', 'Contacted', 'Quoted', 'Negotiation', 'Won'],
			script_count: 18
		},
		{
			id: 't2',
			title_th: 'บริการ/ซ่อมบำรุง',
			title_en: 'Service & Maintenance',
			description: 'สำหรับงานบริการต่อเนื่อง จัดขั้นตอนติดตามและการนัดหมายให้เป็นระบบ',
			color: 'orange',
			icon: 'wrench',
			is_popular: false,
			stages: ['Lead', 'Diagnose', 'Quote', 'Schedule', 'Complete'],
			script_count: 12
		},
		{
			id: 't3',
			title_th: 'อีคอมเมิร์ซ',
			title_en: 'E-commerce',
			description: 'เหมาะกับงานขายออนไลน์ เน้นการ follow-up และปิดการขายอย่างรวดเร็ว',
			color: 'pink',
			icon: 'shopping-bag',
			is_popular: false,
			stages: ['Lead', 'Chat', 'Offer', 'Pay', 'Ship'],
			script_count: 9
		}
	];
</script>

<div class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-900">Workflow Templates</h1>
		<p class="text-slate-500 mt-2 text-lg">เลือก Template ตามอุตสาหกรรมของคุณ พร้อม Pipeline และ Script ภาษาไทย</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each templates as template (template.id)}
			<PipelineTemplateCard {template} />
		{/each}
	</div>
</div>

