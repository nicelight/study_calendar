import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { RequestEvent } from '@sveltejs/kit';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({
	current: { centerScheduling: {}, financialLedger: {} } as any
}));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import FinancePage from '../../src/routes/admin/[centerId]/finance/+page.svelte';
import {
	_createAdminFinanceActions,
	_createAdminFinancePageLoad
} from '../../src/routes/admin/[centerId]/finance/+page.server';

const centerId = 'center-verifier-w33';
const otherCenterId = 'center-other-verifier-w33';
const classId = 'class-verifier-w33';
const otherClassId = 'class-other-verifier-w33';
const adminToken = 'session-admin-verifier-w33';
const teacherToken = 'session-teacher-verifier-w33';
const studentToken = 'session-student-verifier-w33';
const parentToken = 'session-parent-verifier-w33';
const otherAdminToken = 'session-other-admin-verifier-w33';
const studentId = 'student-verifier-w33';
const otherStudentId = 'student-other-verifier-w33';

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

function paymentFields(
	paymentId: string,
	confirmation: string,
	amount = '12.125',
	factualDate = '2026-08-02',
	requestedClassId = classId,
	requestedStudentId = studentId
): Array<[string, string]> {
	return [
		['classId', requestedClassId],
		['studentAccountId', requestedStudentId],
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
	requestedStudentId = studentId
): Array<[string, string]> {
	return [
		['classId', requestedClassId],
		['studentAccountId', requestedStudentId],
		['paymentId', paymentId],
		['confirmation', confirmation]
	];
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('${centerId}', 'Verifier W33 Center'),
			('${otherCenterId}', 'Other W33 Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-verifier-w33', 'admin'),
			('teacher-verifier-w33', 'teacher'),
			('${studentId}', 'student'),
			('parent-verifier-w33', 'parent'),
			('other-admin-verifier-w33', 'admin'),
			('${otherStudentId}', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('${adminToken}', 'admin-verifier-w33', NULL),
			('${teacherToken}', 'teacher-verifier-w33', NULL),
			('${studentToken}', '${studentId}', NULL),
			('${parentToken}', 'parent-verifier-w33', NULL),
			('${otherAdminToken}', 'other-admin-verifier-w33', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('${centerId}', 'admin-verifier-w33'),
			('${centerId}', 'teacher-verifier-w33'),
			('${centerId}', '${studentId}'),
			('${centerId}', 'parent-verifier-w33'),
			('${otherCenterId}', 'other-admin-verifier-w33'),
			('${otherCenterId}', '${otherStudentId}');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('${studentId}', 'Verifier W33 Student', '2026-01-01T00:00:00.000Z'),
			('${otherStudentId}', 'Other W33 Student', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('${classId}', '${centerId}', 'Verifier W33 Class', 'individual'),
			('${otherClassId}', '${otherCenterId}', 'Other W33 Class', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('${centerId}', '${classId}', '${studentId}'),
			('${otherCenterId}', '${otherClassId}', '${otherStudentId}');
		INSERT INTO financial_lesson_charges (
			center_id, class_id, lesson_id, student_account_id, lesson_date,
			applied_price, status, created_at, cancelled_at
		) VALUES (
			'${centerId}', '${classId}', 'lesson-verifier-w33', '${studentId}',
			'2026-08-01', '10.125', 'active', '2026-08-01T00:00:00.000Z', NULL
		);
	`);
	root.financialLedger.createPayment({
		sessionToken: adminToken,
		classId,
		studentAccountId: studentId,
		amount: '12.125',
		factualDate: '2026-08-02',
		confirmation: 'create-verifier-w33'
	});
	root.financialLedger.createPayment({
		sessionToken: adminToken,
		classId,
		studentAccountId: studentId,
		amount: '1.000',
		factualDate: '2026-08-03',
		confirmation: 'create-cancel-verifier-w33'
	});
	root.financialLedger.cancelPayment({
		sessionToken: adminToken,
		paymentId: 'payment-2',
		confirmation: 'cancel-fixture-verifier-w33'
	});
	return root;
}

function pageLoad(root: CompositionRoot) {
	return _createAdminFinancePageLoad({
		centerScheduling: root.centerScheduling,
		financialLedger: root.financialLedger
	});
}

function snapshot(root: CompositionRoot): Record<string, unknown[]> {
	const tables = [
		'financial_lesson_charges',
		'financial_payments',
		'financial_payment_allocations',
		'financial_payment_audit_records',
		'financial_payment_commands'
	];
	return Object.fromEntries(
		tables.map((table) => [table, root.database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()])
	);
}

describe('TASK-100 fresh verifier-owned outcome probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = { centerScheduling: {}, financialLedger: {} };
		root.database.close();
	});

	it('proves one-time exact journal, advance, edit/cancel replay, privacy, and ownership', async () => {
		const load = pageLoad(root);
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const data = load(event(root, centerId, adminToken));

		expect(data.journal.map(({ paymentId }) => paymentId)).toEqual(['payment-1', 'payment-2']);
		expect(new Set(data.journal.map(({ paymentId }) => paymentId)).size).toBe(data.journal.length);
		expect(data.journal[0]).toMatchObject({
		paymentId: 'payment-1',
		classId,
		className: 'Verifier W33 Class',
		studentAccountId: studentId,
		studentLabel: 'Verifier W33 Student',
		amount: '12.125',
		factualDate: '2026-08-02',
		status: 'recorded',
		balance: '-2',
		advance: '2',
		allocations: [{ paymentId: 'payment-1', lessonId: 'lesson-verifier-w33', amount: '10.125' }]
	});
	expect(data.journal[0].audit.map(({ action }) => action)).toEqual(['payment-created']);
			 expect(data.journal[1]).toMatchObject({
				paymentId: 'payment-2',
				classId,
				className: 'Verifier W33 Class',
				studentAccountId: studentId,
				studentLabel: 'Verifier W33 Student',
				amount: '1',
				factualDate: '2026-08-03',
				status: 'cancelled',
				allocations: []
			});
			 expect(data.journal[1].audit.map(({ action }) => action)).toEqual([
				'payment-created',
				'payment-cancelled'
			]);
			 expect(data.journal.some(({ studentLabel }) => studentLabel === 'Other W33 Student')).toBe(false);

	const body = render(FinancePage, { props: { data, form: null } } as any).body;
	expect(body).toContain('Журнал платежей');
	expect(body).toContain('12.125');
		 expect(body).toContain('Аванс');
		 expect(body).toContain('Создан');
		 expect(body).toContain('Отменён');
		 expect(body).toContain('1');
		 expect(body).toContain('2026-08-03');
		 expect(body).not.toContain('?/createPayment');
		expect(Object.keys(actions).sort()).toEqual([
			'cancelPayment',
			'editPayment',
			'setClassPrice',
			'setStudentPriceOverride'
		]);

		const beforeUnconfirmed = snapshot(root);
		const unconfirmedEdit = await actions.editPayment!(event(
			root,
			centerId,
			adminToken,
			paymentFields('payment-1', '')
		));
		const unconfirmedCancel = await actions.cancelPayment!(event(
			root,
			centerId,
			adminToken,
			cancelFields('payment-1', '')
		));
		expect(unconfirmedEdit).toMatchObject({ status: 400, data: { error: 'payment_confirmation_required' } });
		expect(unconfirmedCancel).toMatchObject({ status: 400, data: { error: 'payment_confirmation_required' } });
		expect(snapshot(root)).toEqual(beforeUnconfirmed);

		const edited = await actions.editPayment!(event(
			root,
			centerId,
			adminToken,
			paymentFields('payment-1', 'edit-verifier-w33', '8.125', '2026-08-04')
		));
		expect(edited).toEqual({ ok: true, message: 'payment_edited' });
		const afterEdit = load(event(root, centerId, adminToken)).journal.find(({ paymentId }) => paymentId === 'payment-1');
		expect(afterEdit).toMatchObject({
			amount: '8.125',
			factualDate: '2026-08-04',
			balance: '2',
			advance: '0',
			allocations: [{ paymentId: 'payment-1', lessonId: 'lesson-verifier-w33', amount: '8.125' }]
		});
		expect(afterEdit?.audit[1]).toMatchObject({
			action: 'payment-edited',
			before: expect.objectContaining({ amount: '12.125', factualDate: '2026-08-02' }),
			after: expect.objectContaining({ amount: '8.125', factualDate: '2026-08-04' })
		});

		const cancelled = await actions.cancelPayment!(event(
			root,
			centerId,
			adminToken,
			cancelFields('payment-1', 'cancel-verifier-w33')
		));
		expect(cancelled).toEqual({ ok: true, message: 'payment_cancelled' });
		const afterCancel = load(event(root, centerId, adminToken)).journal.find(({ paymentId }) => paymentId === 'payment-1');
		expect(afterCancel).toMatchObject({
			amount: '8.125',
			factualDate: '2026-08-04',
			status: 'cancelled',
			balance: '10.125',
			advance: '0',
			allocations: []
		});
		 expect(afterCancel?.audit.map(({ action }) => action)).toEqual([
			'payment-created',
			'payment-edited',
			'payment-cancelled'
		]);
		 expect(afterCancel?.audit[2]).toMatchObject({
			 action: 'payment-cancelled',
			 before: expect.objectContaining({ amount: '8.125', factualDate: '2026-08-04', status: 'recorded' }),
			 after: expect.objectContaining({ amount: '8.125', factualDate: '2026-08-04', status: 'cancelled' })
		 });

		const beforeDenials = snapshot(root);
		const validEdit = paymentFields('payment-2', 'denied-verifier-w33', '9.125', '2026-08-05');
		const denials = [
			await actions.editPayment!(event(root, centerId, undefined, validEdit)),
			await actions.editPayment!(event(root, centerId, teacherToken, validEdit)),
			await actions.editPayment!(event(root, centerId, studentToken, validEdit)),
			await actions.editPayment!(event(root, centerId, parentToken, validEdit)),
			await actions.editPayment!(event(root, centerId, otherAdminToken, validEdit)),
			await actions.editPayment!(event(root, centerId, adminToken, paymentFields('payment-2', 'forged-class-verifier-w33', '9.125', '2026-08-05', 'class-forged-w33'))),
			await actions.editPayment!(event(root, centerId, adminToken, paymentFields('payment-2', 'forged-student-verifier-w33', '9.125', '2026-08-05', classId, 'student-forged-w33'))),
			await actions.editPayment!(event(root, centerId, adminToken, paymentFields('payment-forged-w33', 'forged-payment-verifier-w33'))),
			await actions.editPayment!(event(root, centerId, adminToken, paymentFields('payment-2', '')))
		];
		expect(denials.map((result: any) => result.status)).toEqual([401, 403, 403, 403, 403, 403, 403, 403, 400]);
		expect(snapshot(root)).toEqual(beforeDenials);

		const cancelDenials = [
			await actions.cancelPayment!(event(root, centerId, undefined, cancelFields('payment-2', 'denied-cancel-verifier-w33'))),
			await actions.cancelPayment!(event(root, centerId, teacherToken, cancelFields('payment-2', 'denied-cancel-verifier-w33'))),
			await actions.cancelPayment!(event(root, centerId, studentToken, cancelFields('payment-2', 'denied-cancel-verifier-w33'))),
			await actions.cancelPayment!(event(root, centerId, parentToken, cancelFields('payment-2', 'denied-cancel-verifier-w33'))),
			await actions.cancelPayment!(event(root, centerId, otherAdminToken, cancelFields('payment-2', 'denied-cancel-verifier-w33'))),
			await actions.cancelPayment!(event(root, centerId, adminToken, cancelFields('payment-2', 'forged-class-cancel-verifier-w33', 'class-forged-w33'))),
			await actions.cancelPayment!(event(root, centerId, adminToken, cancelFields('payment-2', 'forged-student-cancel-verifier-w33', classId, 'student-forged-w33'))),
			await actions.cancelPayment!(event(root, centerId, adminToken, cancelFields('payment-forged-w33', 'forged-payment-cancel-verifier-w33')))
		];
		expect(cancelDenials.map((result: any) => result.status)).toEqual([401, 403, 403, 403, 403, 403, 403, 403]);
		expect(snapshot(root)).toEqual(beforeDenials);

		expect(() => load(event(root, centerId, teacherToken))).toThrow();
		expect(() => load(event(root, centerId, studentToken))).toThrow();
		expect(() => load(event(root, centerId, parentToken))).toThrow();
		expect(() => load(event(root, otherCenterId, adminToken))).toThrow();
		expect(() => load(event(root, centerId, undefined))).toThrow();

		const routeSource = readFileSync('src/routes/admin/[centerId]/finance/+page.server.ts', 'utf8');
		expect(routeSource).toContain('financialLedger.getBalanceProjection');
		expect(routeSource).toContain('financialLedger.editPayment');
		expect(routeSource).toContain('financialLedger.cancelPayment');
		expect(routeSource).not.toMatch(/financial_(?:payments|payment_allocations|payment_commands|audit_records)/);
		expect(routeSource).not.toMatch(/(?:database|sqlite|INSERT|UPDATE|DELETE)/i);
	});
});
