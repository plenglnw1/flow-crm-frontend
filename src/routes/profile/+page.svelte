<script lang="ts">
	// UI-only profile screen shell (parity with Laravel profile/edit.blade.php)
</script>

<div class="py-12">
	<div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Profile Information</h2>
				<p class="mt-1 text-sm text-slate-500">Update your account's profile information and email address.</p>

				<div class="mt-6 space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-700" for="name">Name</label>
						<input
							id="name"
							type="text"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
							placeholder="Your name"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="email">Email</label>
						<input
							id="email"
							type="email"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
							placeholder="you@example.com"
						/>
					</div>
					<div class="pt-2">
						<button
							type="button"
							class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Update Password</h2>
				<p class="mt-1 text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>

				<div class="mt-6 space-y-4">
					<div>
						<label class="block text-sm font-medium text-slate-700" for="current_password">Current password</label>
						<input
							id="current_password"
							type="password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
							placeholder="••••••••"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="new_password">New password</label>
						<input
							id="new_password"
							type="password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
							placeholder="••••••••"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-700" for="confirm_password">Confirm password</label>
						<input
							id="confirm_password"
							type="password"
							class="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
							placeholder="••••••••"
						/>
					</div>
					<div class="pt-2">
						<button
							type="button"
							class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
			<div class="max-w-xl">
				<h2 class="text-lg font-semibold text-slate-900">Delete Account</h2>
				<p class="mt-1 text-sm text-slate-500">Once your account is deleted, all of its resources and data will be permanently deleted.</p>

				<div class="mt-6">
					<button
						type="button"
						class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
					>
						Delete Account
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

