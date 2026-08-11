import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-023-T3-FT-001-W10/verifier-owned-probe.test.ts']
	}
});
