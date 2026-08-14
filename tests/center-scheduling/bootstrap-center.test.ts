import { afterEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

type BootstrapBoundary = {
	createBootstrapCenter(request: { sessionToken?: string; name: string }): {
		centerId: string;
		name: string;
	};
};

describe('bootstrap center boundary', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('atomically creates the first center membership for a session-resolved Admin', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('bootstrap-admin', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
				VALUES ('bootstrap-session', 'bootstrap-admin', NULL);
		`);

		const center = (root.centerScheduling as unknown as BootstrapBoundary).createBootstrapCenter({
			sessionToken: 'bootstrap-session',
			name: 'Center Alpha'
		});

		expect(center).toMatchObject({ name: 'Center Alpha' });
		expect(root.database.sqlite.prepare(
			'SELECT center_id, account_id FROM center_memberships WHERE account_id = ?'
		).get('bootstrap-admin')).toEqual({
			center_id: center.centerId,
			account_id: 'bootstrap-admin'
		});
	});
});
