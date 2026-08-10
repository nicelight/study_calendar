import { describe, expect, it } from 'vitest';
import { createCompositionRoot } from '../../src/lib/server/composition-root';

function createDisposableRoot() {
	return createCompositionRoot({ databaseFilename: ':memory:' });
}

describe('TASK-009 claim-scoped pre-implementation RED', () => {
	it('FT-005-AC-001 cannot observe a completion boundary or durable progress state', () => {
		const root = createDisposableRoot();
		try {
			expect(Object.hasOwn(root, 'learningProgress')).toBe(false);
			expect(
				root.database.sqlite
					.prepare(
						`SELECT name
						 FROM sqlite_master
						 WHERE type = 'table' AND name IN ('learning_homework', 'learning_grades')
						 ORDER BY name`
					)
					.all()
			).toEqual([]);
		} finally {
			root.database.close();
		}
	});

	it('FT-005-AC-002 cannot observe a grade boundary or durable grade state', () => {
		const root = createDisposableRoot();
		try {
			expect(Object.hasOwn(root, 'learningProgress')).toBe(false);
			expect(
				root.database.sqlite
					.prepare(
						`SELECT name
						 FROM sqlite_master
						 WHERE type = 'table' AND name = 'learning_grades'`
					)
					.all()
			).toEqual([]);
		} finally {
			root.database.close();
		}
	});
});
