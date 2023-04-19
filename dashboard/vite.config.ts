import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import endpoint from  '../config/endpoints.js';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	base: endpoint.DASHBOARD,
});

