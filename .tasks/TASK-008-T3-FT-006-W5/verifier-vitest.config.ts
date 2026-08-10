import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	root: '/home/serg/Projects/study_calendar',
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: [
			'.tasks/TASK-008-T3-FT-006-W5/verifier-probe.test.ts',
			'.tasks/TASK-008-T3-FT-006-W5/verifier-probe-02.test.ts'
		]
	}
});
