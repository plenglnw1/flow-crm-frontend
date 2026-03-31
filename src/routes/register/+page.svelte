<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';

	let { form }: { form: ActionData } = $props();

	let name = $state('');
	let email = $state('');
	let invite_token = $state('');
	let isLoading = $state(false);

	$effect(() => {
		const v = form?.values;
		if (!v) return;
		if (v.name !== undefined) name = String(v.name ?? '');
		if (v.email !== undefined) email = String(v.email ?? '');
		if (v.invite_token !== undefined) invite_token = String(v.invite_token ?? '');
	});

	const handleSubmit: SubmitFunction = () => {
		isLoading = true;
		return async ({ update }) => {
			await update();
			isLoading = false;
		};
	};
</script>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
	<a
		href="/"
		class="absolute top-6 left-6 text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium text-sm"
	>
		← Home
	</a>

	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-slate-900">Create a sales account</h1>
		<p class="text-slate-500 text-sm mt-1 max-w-md mx-auto">
			Sales only — use the organization invite code from your manager (managers register on the Laravel admin site).
		</p>
	</div>

	<div class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
		<form method="POST" use:enhance={handleSubmit} class="space-y-5">
			<div>
				<label for="name" class="block text-sm font-medium text-slate-700">Full name</label>
				<input
					id="name"
					name="name"
					required
					class="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
					placeholder="Somchai Yingrak"
					bind:value={name}
					disabled={isLoading}
				/>
				<p class="text-xs text-slate-400 mt-1">At least two words (server validation)</p>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-slate-700">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					class="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
					bind:value={email}
					disabled={isLoading}
				/>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="password" class="block text-sm font-medium text-slate-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						minlength="8"
						class="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
						disabled={isLoading}
					/>
				</div>
				<div>
					<label for="password_confirmation" class="block text-sm font-medium text-slate-700">Confirm</label>
					<input
						id="password_confirmation"
						name="password_confirmation"
						type="password"
						required
						minlength="8"
						class="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
						disabled={isLoading}
					/>
				</div>
			</div>

			<div class="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
				<label for="invite_token" class="block text-sm font-medium text-slate-700">Organization invite code</label>
				<input
					id="invite_token"
					name="invite_token"
					required
					class="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 font-mono tracking-wider uppercase text-center text-lg"
					placeholder="e.g. CLINICA2026"
					bind:value={invite_token}
					disabled={isLoading}
				/>
			</div>

			{#if form?.message}
				<div class="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{form.message}</div>
			{/if}

			<button
				type="submit"
				disabled={isLoading}
				class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-60"
			>
				{isLoading ? 'Submitting...' : 'Create account'}
			</button>

			<p class="text-center text-sm text-slate-500">
				Already have an account? <a href="/login" class="text-emerald-600 font-medium hover:underline">Sign in</a>
			</p>
		</form>
	</div>
</div>