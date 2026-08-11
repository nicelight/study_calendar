import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['/home/serg/Projects/study_calendar/.tasks/TASK-021-T3-FT-001-W9/red-probe.test.ts']
	}
});
