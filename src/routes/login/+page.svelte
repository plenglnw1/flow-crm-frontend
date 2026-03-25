<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, SubmitFunction } from './$types';

	let { form }: { form: ActionData } = $props();
	let isLoading = $state(false);

	const handleLogin: SubmitFunction = () => {
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
		class="absolute top-6 left-6 text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium text-sm group"
	>
		<div class="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</div>
		<span class="hidden sm:inline">Back to Home</span>
	</a>

	<div class="mb-8 text-center">
		<div class="flex justify-center mb-3">
			<div
				class="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white"
			>
				<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
					/>
				</svg>
			</div>
		</div>
		<h1 class="text-3xl font-bold text-slate-800 tracking-tight">FlowCRM</h1>
		<p class="text-slate-500 text-sm mt-2">Welcome back! Please enter your details.</p>
	</div>

	<div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-8">
		<form method="POST" use:enhance={handleLogin} class="space-y-5">
			<div>
				<label for="email" class="block text-sm font-medium text-slate-700">Email</label>
				<input
					id="email"
					name="email"
					class="block mt-1 w-full px-4 py-2 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
					type="email"
					placeholder="john@example.com"
					autocomplete="username"
					required
					disabled={isLoading}
					value={form?.email ?? ''}
				/>
			</div>

			<div>
				<div class="flex justify-between items-center mb-1">
					<label for="password" class="block text-sm font-medium text-slate-700">Password</label>
					<a class="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline" href="/forgot-password">
						Forgot password?
					</a>
				</div>

				<input
					id="password"
					name="password"
					class="block w-full px-4 py-2 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl shadow-sm"
					type="password"
					placeholder="••••••••"
					autocomplete="current-password"
					required
					disabled={isLoading}
				/>
			</div>

			{#if form?.message}
				<div class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
					<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{form.message}</span>
				</div>
			{/if}

			<div class="pt-2">
				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2"
				>
					{#if isLoading}
						<svg
							class="animate-spin h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Signing in...
					{:else}
						Sign in
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					{/if}
				</button>
			</div>

			<p class="text-center text-sm text-slate-500 pt-4">
				ยังไม่มีบัญชี Sales?
				<a href="/register" class="text-emerald-600 font-semibold hover:underline">สมัครด้วยรหัสเชิญ</a>
			</p>
		</form>
	</div>
</div>