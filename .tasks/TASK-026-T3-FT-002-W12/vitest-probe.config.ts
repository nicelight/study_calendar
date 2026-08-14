import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-026-T3-FT-002-W12/verification-probe.test.ts']
	}
});
