import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-014 T3 claim-linked pre-implementation RED', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
	});

	afterEach(() => {
		root.database.close();
	});

	it('AC-003..006 have no authorized Lesson Context path in the current source', () => {
		const lessonContext = (root as unknown as { lessonContext?: unknown }).lessonContext;

		// This observes the missing behavior at the composition boundary; it is
		// not a setup/import failure or an artificial production break.
		expect(lessonContext).toBeDefined();
	});
});
