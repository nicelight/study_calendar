import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['.tasks/TASK-102-T3-FT-004-W35/verifier-attempt-2-personal-scope-probe.test.ts']
	}
});
