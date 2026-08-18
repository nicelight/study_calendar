import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routeRoot = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function paymentActionEvent(sessionToken: string, fields: Record<string, string>, href = '/lesson-context?classId=class-route-049&lessonId=lesson-route-049') {
	const url = new URL(`https://calendar.test${href}`);
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as any;
}

function financialSnapshot(root: CompositionRoot) {
	return root.database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-route-049', 'Route Center'), ('center-other-049', 'Other Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-route-049', 'admin'), ('admin-other-049', 'admin'),
			('teacher-assigned-049', 'teacher'), ('teacher-unassigned-049', 'teacher'),
			('student-route-049', 'student'), ('student-forged-049', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-route-049', 'admin-route-049', NULL),
			('session-admin-other-049', 'admin-other-049', NULL),
			('session-teacher-assigned-049', 'teacher-assigned-049', NULL),
			('session-teacher-unassigned-049', 'teacher-unassigned-049', NULL),
			('session-student-route-049', 'student-route-049', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-route-049', 'admin-route-049'),
			('center-other-049', 'admin-other-049'),
			('center-route-049', 'teacher-assigned-049'),
			('center-route-049', 'teacher-unassigned-049'),
			('center-route-049', 'student-route-049');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-route-049', 'center-route-049', 'Route Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-route-049', 'class-route-049', 'student-route-049');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-route-049', 'class-route-049', 'teacher-assigned-049');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-route-049', 'center-route-049', 'class-route-049', '2026-08-01', '2026-08-31',
			'[1,2]', 'admin-route-049', '2026-08-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-route-049', 'center-route-049', 'class-route-049', 'schedule-route-049', '2026-08-10',
			'planned', 'admin-route-049', '2026-08-01T00:00:00.000Z'
		);
	`);
	return root;
}

describe('TASK-049 protected Lesson Context payment adapter', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('delegates authorized Admin/Teacher submissions and rejects every forged scope before mutation', async () => {
		const adminResult = await lessonContextActions.default(
			paymentActionEvent('session-admin-route-049', {
				action: 'createPayment', studentAccountId: 'student-route-049', amount: '7.50', factualDate: '', confirmation: 'admin-route-049'
			})
		);
		expect(adminResult).toEqual({ paymentSuccess: true });
		expect(root.database.sqlite.prepare('SELECT created_by_account_id, factual_date FROM financial_payments WHERE id = ?').get('payment-1')).toEqual({
			created_by_account_id: 'admin-route-049', factual_date: '2026-08-10'
		});

		const teacherResult = await lessonContextActions.default(
			paymentActionEvent('session-teacher-assigned-049', {
				action: 'createPayment', studentAccountId: 'student-route-049', amount: '2.50', factualDate: '2026-08-11', confirmation: 'teacher-route-049'
			})
		);
		expect(teacherResult).toEqual({ paymentSuccess: true });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 2 });

		const deniedRequests: Array<[string, Record<string, string>, string?]> = [
			['session-student-route-049', { action: 'createPayment', studentAccountId: 'student-route-049', amount: '1', factualDate: '2026-08-12', confirmation: 'student-route-049' }],
			['session-teacher-unassigned-049', { action: 'createPayment', studentAccountId: 'student-route-049', amount: '1', factualDate: '2026-08-12', confirmation: 'unassigned-route-049' }],
			['session-admin-other-049', { action: 'createPayment', studentAccountId: 'student-route-049', amount: '1', factualDate: '2026-08-12', confirmation: 'cross-center-route-049' }],
			['session-admin-route-049', { action: 'createPayment', studentAccountId: 'student-forged-049', amount: '1', factualDate: '2026-08-12', confirmation: 'forged-student-route-049' }],
			['session-admin-route-049', { action: 'createPayment', studentAccountId: 'student-route-049', amount: '1', factualDate: '2026-08-12', confirmation: 'extra-field-route-049', forgedClassId: 'class-other-049' }]
		];
		for (const [sessionToken, fields, href] of deniedRequests) {
			const before = financialSnapshot(root);
			const result = await lessonContextActions.default(paymentActionEvent(sessionToken, fields, href));
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.stringMatching(/payment_forbidden|invalid_payment_request/) } });
			expect(financialSnapshot(root)).toEqual(before);
		}

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		const contextSource = readFileSync(resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'), 'utf8');
		expect(routeSource).toContain('financialLedger.createPayment');
		expect(routeSource).not.toContain('.sqlite');
		expect(routeSource).not.toMatch(/financial_(payments|payment_allocations|payment_commands|audit_records)/);
		expect(contextSource).not.toMatch(/financial_(payments|payment_allocations|payment_commands|audit_records)/);
	});
});
