import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['.tasks/TASK-017-T3-FT-004-W6/threaded-discussion-isolation.probe.test.ts']
	}
});
