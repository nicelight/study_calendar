import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	root: '../..',
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-009-T3-FT-005-W5/verifier-owned-probe.test.ts']
	}
});
