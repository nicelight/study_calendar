import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: { environment: 'node', include: ['.tasks/TASK-096-T3-FT-007-W30/verify-attempt-2.test.ts'] }
});
