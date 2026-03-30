import { fail, redirect, type Actions } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { applySetCookie, getSetCookies } from '$lib/server/laravel-cookies.server';

export const actions: Actions = {
	default: async ({ request, cookies }) => {