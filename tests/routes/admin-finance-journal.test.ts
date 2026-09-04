import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { RequestEvent } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import FinancePage from '../../src/routes/admin/[centerId]/finance/+page.svelte';
import {
	_createAdminFinanceActions,
	_createAdminFinancePageLoad
} from '../../src/routes/admin/[centerId]/finance/+page.server';

const centerId = 'center-journal-100';
const classId = 'class-journal-100';
const studentAccountId = 'student-journal-100';
const paymentSession = 'session-admin-journal-100';

function event(
	root: CompositionRoot,
	requestedCenterId: string,
	sessionToken: string | undefined,
	fields: Array<[string, string]> = []
): RequestEvent {
	const url = new URL(`https://calendar.test/admin/${requestedCenterId}/finance`);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		params: { centerId: requestedCenterId },
		url,
		locals: { actor: sessionToken ? root.identityAccess.resolveActor(sessionToken) : null },
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as unknown as RequestEvent;
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('center-journal-100', 'Журнальный центр'),
			('center-other-100', 'Другой центр');
		INSERT INTO accounts (id, role) VALUES
			('admin-journal-100', 'admin'),
			('teacher-journal-100', 'teacher'),
			('student-journal-100', 'student'),
			('admin-other-100', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-journal-100', 'admin-journal-100', NULL),
			('session-teacher-journal-100', 'teacher-journal-100', NULL),
			('session-student-journal-100', 'student-journal-100', NULL),
			('session-admin-other-100', 'admin-other-100', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-journal-100', 'admin-journal-100'),
			('center-journal-100', 'teacher-journal-100'),
			('center-journal-100', 'student-journal-100'),
			('center-other-100', 'admin-other-100');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('student-journal-100', 'Ученик Журнала', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-journal-100', 'center-journal-100', 'Журнальный класс', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-journal-100', 'class-journal-100', 'student-journal-100');
		INSERT INTO financial_lesson_charges (
			center_id, class_id, lesson_id, student_account_id, lesson_date,
			applied_price, status, created_at, cancelled_at
		) VALUES (
			'center-journal-100', 'class-journal-100', 'lesson-journal-100',
			'student-journal-100', '2026-08-01', '10.125', 'active',
			'2026-08-01T00:00:00.000Z', NULL
		);
	`);
	root.financialLedger.createPayment({
		sessionToken: paymentSession,
		classId,
		studentAccountId,
		amount: '4.125',
		factualDate: '2026-08-02',
		confirmation: 'create-journal-100'
	});
	return root;
}

function load(root: CompositionRoot, requestedCenterId = centerId, sessionToken = paymentSession) {
	return _createAdminFinancePageLoad({
		centerScheduling: root.centerScheduling,
		financialLedger: root.financialLedger
	})(event(root, requestedCenterId, sessionToken));
}

function paymentFields(
	paymentId: string,
	confirmation: string,
	amount = '4.125',
	factualDate = '2026-08-02',
	requestedClassId = classId,
	requestedStudentAccountId = studentAccountId
): Array<[string, string]> {
	return [
		['classId', requestedClassId],
		['studentAccountId', requestedStudentAccountId],
		['paymentId', paymentId],
		['amount', amount],
		['factualDate', factualDate],
		['confirmation', confirmation]
	];
}

function cancelFields(
	paymentId: string,
	confirmation: string,
	requestedClassId = classId,
	requestedStudentAccountId = studentAccountId
): Array<[string, string]> {
	return [
		['classId', requestedClassId],
		['studentAccountId', requestedStudentAccountId],
		['paymentId', paymentId],
		['confirmation', confirmation]
	];
}

function snapshotFinancialState(root: CompositionRoot): Record<string, unknown[]> {
	const tables = [
		'financial_payments',
		'financial_payment_allocations',
		'financial_payment_audit_records',
		'financial_payment_commands'
	];
	return Object.fromEntries(
		tables.map((table) => [table, root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
	);
}

describe('TASK-100 Admin payment journal', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
	});

	afterEach(() => root.database.close());

	it('loads every own-center payment once with authoritative financial details', () => {
		const data = load(root);
		expect(data.journal).toEqual([
			expect.objectContaining({
				paymentId: 'payment-1',
				classId,
				className: 'Журнальный класс',
				studentAccountId,
				studentLabel: 'Ученик Журнала',
				amount: '4.125',
				factualDate: '2026-08-02',
				status: 'recorded',
				balance: '6',
				advance: '0',
				allocations: [{ paymentId: 'payment-1', lessonId: 'lesson-journal-100', amount: '4.125' }],
				audit: [expect.objectContaining({ action: 'payment-created' })]
			})
		]);

		const body = render(FinancePage, { props: { data, form: null } } as any).body;
		expect(body).toContain('Журнал платежей');
		expect(body).toContain('Ученик Журнала');
		expect(body).toContain('4.125');
		expect(body).toContain('2026-08-02');
		expect(body).toContain('Создан');
		expect(body).not.toContain('?/createPayment');
	});

	it('edits and cancels through the existing commands, then reloads the projection and audit', async () => {
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});

		const edited = await actions.editPayment!(event(
			root,
			centerId,
			paymentSession,
			paymentFields('payment-1', 'edit-journal-100', '5.125', '2026-08-03')
		));
		expect(edited).toEqual({ ok: true, message: 'payment_edited' });

		const afterEdit = load(root).journal[0];
		expect(afterEdit).toMatchObject({
			amount: '5.125',
			factualDate: '2026-08-03',
			status: 'recorded',
			balance: '5',
			allocations: [{ paymentId: 'payment-1', lessonId: 'lesson-journal-100', amount: '5.125' }]
		});
		expect(afterEdit.audit.map(({ action }) => action)).toEqual(['payment-created', 'payment-edited']);
		expect(afterEdit.audit[1].before).toMatchObject({ amount: '4.125', factualDate: '2026-08-02' });
		expect(afterEdit.audit[1].after).toMatchObject({ amount: '5.125', factualDate: '2026-08-03' });

		const cancelled = await actions.cancelPayment!(event(
			root,
			centerId,
			paymentSession,
			cancelFields('payment-1', 'cancel-journal-100')
		));
		expect(cancelled).toEqual({ ok: true, message: 'payment_cancelled' });

		const afterCancel = load(root).journal[0];
		expect(afterCancel).toMatchObject({
			amount: '5.125',
			factualDate: '2026-08-03',
			status: 'cancelled',
			balance: '10.125',
			advance: '0',
			allocations: []
		});
		expect(afterCancel.audit.map(({ action }) => action)).toEqual([
			'payment-created',
			'payment-edited',
			'payment-cancelled'
		]);
		const body = render(FinancePage, { props: { data: load(root), form: null } } as any).body;
		expect(body).toContain('Отменён');
		expect(body).not.toContain('?/editPayment');
		expect(body).not.toContain('?/cancelPayment');
	});

	it('requires explicit confirmation and rejects every forged or out-of-scope payment request before mutation', async () => {
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const before = snapshotFinancialState(root);
		const validFields = paymentFields('payment-1', 'edit-journal-100', '5.125', '2026-08-03');

		const denied = [
			await actions.editPayment!(event(root, centerId, undefined, validFields)),
			await actions.editPayment!(event(root, centerId, 'session-teacher-journal-100', validFields)),
			await actions.editPayment!(event(root, centerId, 'session-student-journal-100', validFields)),
			await actions.editPayment!(event(root, centerId, 'session-admin-other-100', validFields)),
			await actions.editPayment!(event(root, centerId, paymentSession, paymentFields('payment-1', 'forged-class-100', '7', '2026-08-04', 'class-forged-100'))),
			await actions.editPayment!(event(root, centerId, paymentSession, paymentFields('payment-1', 'forged-student-100', '7', '2026-08-04', classId, 'student-forged-100'))),
			await actions.editPayment!(event(root, centerId, paymentSession, paymentFields('payment-forged-100', 'forged-payment-100'))),
			await actions.editPayment!(event(root, centerId, paymentSession, paymentFields('payment-1', '')))
		];
		expect(denied[0]).toMatchObject({ status: 401, data: { error: 'unauthorized' } });
		expect(denied[1]).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(denied[2]).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(denied[3]).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(denied[4]).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(denied[5]).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(denied[6]).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(denied[7]).toMatchObject({ status: 400, data: { error: 'payment_confirmation_required' } });
		expect(snapshotFinancialState(root)).toEqual(before);

		const serverSource = readFileSync('src/routes/admin/[centerId]/finance/+page.server.ts', 'utf8');
		expect(serverSource).toContain('financialLedger.editPayment');
		expect(serverSource).toContain('financialLedger.cancelPayment');
		expect(serverSource).not.toMatch(/financial_(?:payments|payment_allocations|payment_commands|audit_records)/);
	});
});
