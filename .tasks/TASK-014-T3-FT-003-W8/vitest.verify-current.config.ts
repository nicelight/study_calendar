import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vite.config';

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			include: ['.tasks/TASK-014-T3-FT-003-W8/verify-current.test.ts'],
			exclude: ['tests/**']
		}
	})
);
