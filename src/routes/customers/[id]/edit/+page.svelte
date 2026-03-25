<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	type Customer = {
		id: number;
		fullname: string;
		nickname?: string | null;
		line_id: string;
		phone?: string | null;
		email?: string | null;
		province?: string | null;
		address?: string | null;
		tags?: string[] | string | null;
		is_active: boolean;
		avatar_url?: string | null;
	};

	interface FormState {
		error?: boolean;
		message?: string;
	}

	let { data, form } = $props<{ data: { customer: Customer | null }; form: FormState | null }>();

	const customer = data.customer;

	let isLoading = $state(false);
	let avatarInput: HTMLInputElement | null = null;
	const originalAvatarUrl = customer?.avatar_url ?? null;
	let previewImage = $state<string | null>(originalAvatarUrl);
	let isAvatarChanged = $state(false);

	let fullname = $state(customer?.fullname ?? '');
	let nickname = $state(customer?.nickname ?? '');
	let lineId = $state(customer?.line_id ?? '');
	let phone = $state(customer?.phone ?? '');
	let email = $state(customer?.email ?? '');
	let province = $state(customer?.province ?? '');
	let address = $state(customer?.address ?? '');
	let isActive = $state(!!customer?.is_active);

	function computeTagsString(tags: unknown): string {
		if (!tags) return '';
		if (Array.isArray(tags)) return tags.join(', ');
		return String(tags);
	}

	// IMPORTANT: $state(...) takes an initial value, not a lazy function.
	// Passing an arrow function here would store the function itself.
	let tagsString = $state(computeTagsString(customer?.tags));

	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			// Preview only: keep the file locally in browser memory.
			// Revoke previous blob URL to avoid leaking memory.
			if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage);
			previewImage = URL.createObjectURL(file);
			isAvatarChanged = true;
		} else {
			previewImage = originalAvatarUrl;
			isAvatarChanged = false;
		}
	}

	function clearSelectedAvatar() {
		if (previewImage?.startsWith('blob:')) URL.revokeObjectURL(previewImage);
		previewImage = originalAvatarUrl;
		isAvatarChanged = false;
		if (avatarInput) avatarInput.value = '';
	}
 </script>

{#if customer}
	<div class="max-w-4xl mx-auto py-8 px-4 sm:px-6">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight">แก้ไขลูกค้า</h1>
				<p class="text-sm text-slate-500 mt-1">อัปเดตข้อมูลลูกค้าและ/หรือรูปโปรไฟล์</p>
			</div>
			<button
				type="button"
				class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
				onclick={() => goto(`/customers/${customer.id}`)}
			>
				ยกเลิก
			</button>
		</div>

		<!-- Form Card -->
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					await update();
					isLoading = false;
				};
			}}
			class="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden"
		>
			<!-- Error Message Alert -->
			{#if form?.error}
				<div class="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
					<svg
						class="w-5 h-5 text-red-500 mt-0.5 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<p class="text-sm font-medium text-red-800">{form.message}</p>
				</div>
			{/if}

			<div class="p-6 md:p-8 space-y-8">
				<!-- Section 1: Avatar -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-8">
					<div>
						<h3 class="text-base font-semibold leading-6 text-slate-900">รูปโปรไฟล์</h3>
						<p class="mt-1 text-sm text-slate-500">อัปโหลดรูปใหม่ (ถ้าไม่เลือก ระบบจะคงของเดิม)</p>
					</div>
					<div class="md:col-span-2 flex items-center gap-6">
						<div
							class="w-24 h-24 shrink-0 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden"
						>
							{#if previewImage}
								<img src={previewImage} alt="Preview" class="w-full h-full object-cover" />
							{:else}
								<svg
									class="w-8 h-8 text-slate-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							{/if}
						</div>
						<div>
							<label
								for="avatar"
								class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
							>
								เลือกรูปภาพ
								<input
									id="avatar"
									name="avatar"
									type="file"
									accept="image/*"
									class="sr-only"
									bind:this={avatarInput}
									onchange={handleImageChange}
								/>
							</label>
							<p class="text-xs text-slate-400 mt-2">JPG, PNG, GIF</p>

							{#if previewImage?.startsWith('blob:') && isAvatarChanged}
								<button
									type="button"
									onclick={clearSelectedAvatar}
									class="mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
								>
									ยกเลิกรูปที่เลือก
								</button>
							{/if}
						</div>
					</div>
				</div>

				<!-- Section 2: General Information -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-8">
					<div>
						<h3 class="text-base font-semibold leading-6 text-slate-900">ข้อมูลส่วนตัว</h3>
						<p class="mt-1 text-sm text-slate-500">ข้อมูลสำหรับติดต่อและระบุตัวตนเบื้องต้น</p>
					</div>
					<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
						<div class="sm:col-span-2">
							<label for="fullname" class="block text-sm font-medium leading-6 text-slate-900">
								ชื่อ-นามสกุล <span class="text-red-500">*</span>
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="fullname"
									id="fullname"
									required
									maxlength="255"
									bind:value={fullname}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>

						<div>
							<label for="nickname" class="block text-sm font-medium leading-6 text-slate-900">
								ชื่อเล่น
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="nickname"
									id="nickname"
									bind:value={nickname}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>

						<div>
							<label for="line_id" class="block text-sm font-medium leading-6 text-slate-900">
								LINE ID <span class="text-red-500">*</span>
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="line_id"
									id="line_id"
									required
									maxlength="100"
									bind:value={lineId}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>

						<div>
							<label for="phone" class="block text-sm font-medium leading-6 text-slate-900">
								เบอร์โทรศัพท์
							</label>
							<div class="mt-2">
								<input
									type="tel"
									name="phone"
									id="phone"
									bind:value={phone}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>

						<div>
							<label for="email" class="block text-sm font-medium leading-6 text-slate-900">
								อีเมล
							</label>
							<div class="mt-2">
								<input
									type="email"
									name="email"
									id="email"
									bind:value={email}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Section 3: Additional Details -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-8">
					<div>
						<h3 class="text-base font-semibold leading-6 text-slate-900">ข้อมูลเพิ่มเติม</h3>
						<p class="mt-1 text-sm text-slate-500">ที่อยู่ แท็กและสถานะของลูกค้า</p>
					</div>
					<div class="md:col-span-2 grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
						<div>
							<label for="province" class="block text-sm font-medium leading-6 text-slate-900">
								จังหวัด
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="province"
									id="province"
									bind:value={province}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
									placeholder="เช่น กรุงเทพมหานคร"
								/>
							</div>
						</div>

						<div>
							<label for="tags" class="block text-sm font-medium leading-6 text-slate-900">
								แท็ก / ประเภทธุรกิจ
							</label>
							<div class="mt-2">
								<input
									type="text"
									name="tags"
									id="tags"
									bind:value={tagsString}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
									placeholder="คั่นด้วยจุลภาค (,) เช่น VIP, คลินิก"
								/>
							</div>
						</div>

						<div class="sm:col-span-2">
							<label for="address" class="block text-sm font-medium leading-6 text-slate-900">
								ที่อยู่
							</label>
							<div class="mt-2">
								<textarea
									name="address"
									id="address"
									rows="3"
									bind:value={address}
									class="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
								></textarea>
							</div>
						</div>

						<div class="sm:col-span-2 pt-2 flex items-center gap-3">
							<div class="flex h-6 items-center">
								<input
									id="is_active"
									name="is_active"
									type="checkbox"
									bind:checked={isActive}
									class="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
								/>
							</div>
							<div class="text-sm leading-6">
								<label for="is_active" class="font-medium text-slate-900 cursor-pointer">
									เปิดใช้งานลูกค้ารายนี้ (Active)
								</label>
								<p class="text-slate-500">
									หากปิดใช้งาน ลูกค้าจะไม่แสดงในรายงานและกระดานท่อการขายบางส่วน
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="bg-slate-50 p-6 md:p-8 flex items-center justify-end gap-x-4 border-t border-slate-100">
				<button
					type="button"
					class="text-sm font-semibold leading-6 text-slate-700 px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors"
					onclick={() => goto(`/customers/${customer.id}`)}
				>
					ยกเลิก
				</button>
				<button
					type="submit"
					disabled={isLoading}
					class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
				>
					{#if isLoading}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						กำลังบันทึก...
					{:else}
						บันทึกลูกค้า
					{/if}
				</button>
			</div>
		</form>
	</div>
{:else}
	<div class="p-8 text-slate-600">ไม่พบข้อมูลลูกค้า</div>
{/if}

