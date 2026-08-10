import { afterEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-011 claim-scoped pre-implementation RED', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('AC-001 observes that the Collaboration owner is absent', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		expect('collaboration' in root).toBe(true);
		expect(root.database.sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'collaboration_comments'").get()).toBeTruthy();
	});

	it('AC-002 observes that the reaction owner is absent', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		expect('collaboration' in root).toBe(true);
		expect(root.database.sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'collaboration_reactions'").get()).toBeTruthy();
	});

	it('AC-005 observes that scoped discussion authorization is absent', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		expect('collaboration' in root).toBe(true);
		expect(root.database.sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'collaboration_comments'").get()).toBeTruthy();
	});
});
