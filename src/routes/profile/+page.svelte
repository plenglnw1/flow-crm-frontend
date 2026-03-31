<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	const profileKey = $derived(`${data.user?.name ?? ''}|${data.user?.email ?? ''}|${form?.message ?? ''}`);
</script>

<div class="py-8">
	<div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
		{#if form?.message && form.success === true && !form.passwordForm && !form.deleteForm}
			<div
				class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
			>
				{form.message}
			</div>
		{/if}

		{#if form?.message && form.success !== true && !form.passwordForm && !form.deleteForm}
			<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
				{form.message}
			</div>
		{/if}

		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg border border-slate-100">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Profile Information</h2>
				<p class="mt-1 text-sm text-slate-500">
					Update your account&apos;s profile information and email address.
				</p>

				{#key profileKey}
					<form
						method="POST"
						action="?/updateProfile"
						class="mt-6 space-y-4"
						use:enhance={() =>
							async ({ result, update }) => {
								await update();
								if (result.type === 'success') {
									await invalidateAll();
								}
							}}
					>
						<div>
							<label class="block text-sm font-medium text-slate-700" for="name">Name</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
								value={typeof form?.name === 'string' ? form.name : (data.user?.name ?? '')}
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-700" for="email">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
								value={typeof form?.email === 'string' ? form.email : (data.user?.email ?? '')}
							/>
						</div>
						<div class="pt-2">
							<button
								type="submit"
								class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
							>
								Save
							</button>
						</div>
					</form>
				{/key}
			</div>
		</div>

		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg border border-slate-100">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Update Password</h2>
				<p class="mt-1 text-sm text-slate-500">
					Use a long, random password. You will stay signed in after changing it.
				</p>

				{#if form?.passwordForm && form?.message && form.success === true}
					<p class="mt-4 text-sm font-medium text-emerald-700">{form.message}</p>
				{/if}

				{#if form?.passwordForm && form?.message && form.success !== true}
					<p class="mt-4 text-sm font-medium text-red-700">{form.message}</p>
				{/if}

				<form
					method="POST"
					action="?/updatePassword"
					class="mt-6 space-y-4"
					use:enhance={() =>
						async ({ result, update }) => {
							await update();
							if (result.type === 'success') {
								await invalidateAll();
							}
						}}
				>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="current_password"
							>Current password</label
						>
						<input
							id="current_password"
							name="current_password"
							type="password"
							required
							autocomplete="current-password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="password">New password</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="new-password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="password_confirmation"
							>Confirm password</label
						>
						<input
							id="password_confirmation"
							name="password_confirmation"
							type="password"
							required
							autocomplete="new-password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
						/>
					</div>
					<div class="pt-2">
						<button
							type="submit"
							class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
						>
							Update password
						</button>
					</div>
				</form>
			</div>
		</div>

		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg border border-slate-100">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Delete Account</h2>
				<p class="mt-1 text-sm text-slate-500">
					Your account and access will be removed. This cannot be undone.
				</p>

				{#if form?.deleteForm && form?.message}
					<p class="mt-4 text-sm font-medium text-red-700">{form.message}</p>
				{/if}

				<form method="POST" action="?/destroyAccount" class="mt-6 space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-700" for="delete_password"
							>Confirm with your password</label
						>
						<input
							id="delete_password"
							name="password"
							type="password"
							required
							autocomplete="current-password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-red-500 focus:ring-red-500"
						/>
					</div>
					<button
						type="submit"
						class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
					>
						Delete account
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
