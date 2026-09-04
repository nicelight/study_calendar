import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import FinancePage from '../../src/routes/admin/[centerId]/finance/+page.svelte';
import {
	_createAdminFinanceActions,
	_createAdminFinancePageLoad
} from '../../src/routes/admin/[centerId]/finance/+page.server';

function event(
	root: CompositionRoot,
	centerId: string,
	sessionToken: string | undefined,
	fields: Array<[string, string]> = []
): RequestEvent {
	const url = new URL(`https://calendar.test/admin/${centerId}/finance`);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		params: { centerId },
		url,
		locals: { actor: sessionToken ? root.identityAccess.resolveActor(sessionToken) : null },
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as unknown as RequestEvent;
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-admin-finance-099', 'Финансовый центр');
		INSERT INTO accounts (id, role) VALUES
			('admin-admin-finance-099', 'admin'),
			('teacher-admin-finance-099', 'teacher'),
			('student-admin-finance-099', 'student'),
			('admin-other-finance-099', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-finance-099', 'admin-admin-finance-099', NULL),
			('session-teacher-finance-099', 'teacher-admin-finance-099', NULL),
			('session-other-finance-099', 'admin-other-finance-099', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-admin-finance-099', 'admin-admin-finance-099'),
			('center-admin-finance-099', 'teacher-admin-finance-099'),
			('center-admin-finance-099', 'student-admin-finance-099');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('teacher-admin-finance-099', 'Учитель Финансовый', '2026-01-01T00:00:00.000Z'),
			('student-admin-finance-099', 'Ученик Финансовый', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-admin-finance-099', 'center-admin-finance-099', 'Финансовый класс', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-admin-finance-099', 'class-admin-finance-099', 'student-admin-finance-099');
	`);
	return root;
}

async function thrown(action: () => unknown): Promise<unknown> {
	try {
		action();
		throw new Error('expected control-flow exception');
	} catch (cause) {
		return cause;
	}
}

describe('TASK-099 Admin finance route', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
	});

	afterEach(() => root.database.close());

	it('loads the own-center class labels/history and renders both append-only forms', async () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-finance-099',
			classId: 'class-admin-finance-099',
			amount: '24.50',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setStudentPriceOverride({
			sessionToken: 'session-admin-finance-099',
			classId: 'class-admin-finance-099',
			studentAccountId: 'student-admin-finance-099',
			amount: '19.75',
			effectiveFrom: '2026-02-01'
		});

		const data = _createAdminFinancePageLoad({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		})(event(root, 'center-admin-finance-099', 'session-admin-finance-099'));
		expect(data).toMatchObject({
			centerId: 'center-admin-finance-099',
			name: 'Финансовый центр',
			classes: [{
				classId: 'class-admin-finance-099',
				name: 'Финансовый класс',
				students: [{ accountId: 'student-admin-finance-099', label: 'Ученик Финансовый' }],
				currentAmount: '24.5',
				settings: [
					expect.objectContaining({ amount: '24.5', studentAccountId: null }),
					expect.objectContaining({ amount: '19.75', studentAccountId: 'student-admin-finance-099' })
				]
			}]
		});
		const body = render(FinancePage, { props: { data, form: null } } as any).body;
		expect(body).toContain('История цен');
		expect(body).toContain('Ученик Финансовый');
		expect(body).toContain('24.5');
		expect(body).toContain('19.75');
		expect(body).toContain('Цена класса');
		expect(body).toContain('Цена ученика');
		expect(body).toContain('value="24.5"');
	});

	it('accepts only server-resolved own-center class/student actions and leaves denied state unchanged', async () => {
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const classPrice = await actions.setClassPrice!(event(
			root,
			'center-admin-finance-099',
			'session-admin-finance-099',
			[['classId', 'class-admin-finance-099'], ['amount', '24.50'], ['effectiveFrom', '2026-01-01']]
		));
		expect(classPrice).toEqual({ ok: true, message: 'class_price_saved' });
		const override = await actions.setStudentPriceOverride!(event(
			root,
			'center-admin-finance-099',
			'session-admin-finance-099',
			[
				['classId', 'class-admin-finance-099'],
				['studentAccountId', 'student-admin-finance-099'],
				['amount', '19.75'],
				['effectiveFrom', '2026-02-01']
			]
		));
		expect(override).toEqual({ ok: true, message: 'student_price_saved' });

		const beforeDenied = root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all();
		const denied = [
			await actions.setClassPrice!(event(root, 'center-admin-finance-099', undefined, [
				['classId', 'class-admin-finance-099'], ['amount', '30'], ['effectiveFrom', '2026-03-01']
			])),
			await actions.setClassPrice!(event(root, 'center-admin-finance-099', 'session-teacher-finance-099', [
				['classId', 'class-admin-finance-099'], ['amount', '30'], ['effectiveFrom', '2026-03-01']
			])),
			await actions.setClassPrice!(event(root, 'center-admin-finance-099', 'session-admin-finance-099', [
				['classId', 'class-forged-099'], ['amount', '30'], ['effectiveFrom', '2026-03-01']
			])),
			await actions.setStudentPriceOverride!(event(root, 'center-admin-finance-099', 'session-admin-finance-099', [
				['classId', 'class-admin-finance-099'], ['studentAccountId', 'student-forged-099'], ['amount', '30'], ['effectiveFrom', '2026-03-01']
			]))
		];
		expect(denied[0]).toMatchObject({ status: 401, data: { error: 'unauthorized' } });
		expect(denied[1]).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(denied[2]).toMatchObject({ status: 403, data: { error: 'price_forbidden' } });
		expect(denied[3]).toMatchObject({ status: 403, data: { error: 'price_forbidden' } });
		expect(root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all()).toEqual(beforeDenied);

		const invalid = await actions.setClassPrice!(event(
			root,
			'center-admin-finance-099',
			'session-admin-finance-099',
			[['classId', 'class-admin-finance-099'], ['amount', '0'], ['effectiveFrom', '2026-03-01']]
		));
		expect(invalid).toMatchObject({ status: 400, data: { error: 'invalid_price_amount' } });
	});

	it('rejects unauthenticated and non-own-center finance page loads', async () => {
		const load = _createAdminFinancePageLoad({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		expect(await thrown(() => load(event(root, 'center-admin-finance-099', undefined)))).toMatchObject({ status: 303, location: '/login' });
		expect(await thrown(() => load(event(root, 'center-admin-finance-099', 'session-teacher-finance-099')))).toMatchObject({ status: 403 });
		expect(await thrown(() => load(event(root, 'center-admin-finance-099', 'session-other-finance-099')))).toMatchObject({ status: 403 });
	});
});
