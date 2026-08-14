import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-025-T3-FT-001-W11/*-S-VERIFY-*.test.ts']
	}
});
