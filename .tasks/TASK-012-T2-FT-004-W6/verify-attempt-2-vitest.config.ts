import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-012-T2-FT-004-W6/verify-attempt-2.test.ts']
	}
});
