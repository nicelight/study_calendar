import { afterEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { createAdminCenterActions } from '../../src/routes/admin/center-page.server';

function event(
	root: CompositionRoot,
	sessionToken: string,
	fields: Record<string, string> | URLSearchParams
): RequestEvent {
	return {
		url: new URL('https://calendar.test/admin'),
		params: {},
		request: new Request('https://calendar.test/admin', {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(fields)
		}),
		cookies: {
			get: (name: string) => name === 'foundation_session' ? sessionToken : undefined,
			set: () => undefined,
			delete: () => undefined,
			getAll: () => [],
			serialize: () => ''
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as unknown as RequestEvent;
}

describe('independent verifier bootstrap probes', () => {
	let root: CompositionRoot;

	afterEach(() => root?.database.close());

	it('authenticates a manually bound Admin and creates one atomic membership', () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-one', 'admin');
			INSERT INTO external_identities (provider, subject, account_id)
				VALUES ('telegram', '123456789', 'admin-one');
		`);

		const sessionToken = root.identityAccess.authenticateVerifiedIdentity({
			provider: 'telegram',
			subject: '123456789'
		});
		expect(root.centerScheduling.getAdminEntry({ sessionToken })).toEqual({ mode: 'bootstrap' });

		const center = root.centerScheduling.createBootstrapCenter({
			sessionToken,
			name: 'Verifier Center'
		});
		expect(root.database.sqlite.prepare('SELECT id, name FROM centers').all()).toEqual([
			{ id: center.centerId, name: 'Verifier Center' }
		]);
		expect(root.database.sqlite.prepare('SELECT center_id, account_id FROM center_memberships').all())
			.toEqual([{ center_id: center.centerId, account_id: 'admin-one' }]);
		expect(() => root.centerScheduling.createBootstrapCenter({
			sessionToken,
			name: 'Second Center'
		})).toThrow('bootstrap-center-already-created');
	});

	it('rejects authority, unknown, and duplicate fields before mutation', async () => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES ('admin-one', 'admin');
			INSERT INTO sessions (token, account_id, revoked_at)
				VALUES ('admin-session', 'admin-one', NULL);
		`);
		const before = {
			centers: root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get(),
			memberships: root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM center_memberships').get()
		};

		const requests = [
			new URLSearchParams({ name: 'Forged Center', centerId: 'attacker-center' }),
			new URLSearchParams({ name: 'Forged Role', role: 'admin' }),
			new URLSearchParams({ name: 'Forged Account', accountId: 'another-account' }),
			new URLSearchParams({ name: 'Unknown Field', unexpected: 'value' }),
			new URLSearchParams([['name', 'First'], ['name', 'Second']])
		];

		for (const fields of requests) {
			const result = await createAdminCenterActions(root.centerScheduling).default(
				event(root, 'admin-session', fields)
			);
			expect(result).toMatchObject({ status: 400, data: { error: 'invalid_request' } });
			expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM centers').get())
				.toEqual(before.centers);
			expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM center_memberships').get())
				.toEqual(before.memberships);
		}
	});
});
