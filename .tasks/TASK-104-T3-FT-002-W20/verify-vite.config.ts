import { defineConfig } from 'vitest/config';
import base from '../../vite.config.ts';

export default defineConfig({
	...base,
	test: {
		...base.test,
		include: ['.tasks/TASK-104-T3-FT-002-W20/verify-probe.test.ts']
	}
});
