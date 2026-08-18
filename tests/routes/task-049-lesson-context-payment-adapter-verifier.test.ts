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

function event(sessionToken: string, fields: Record<string, string>) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-v049&lessonId=lesson-v049');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as any;
}

function counts(root: CompositionRoot) {
	return root.database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-v049', 'Verifier Center'), ('center-other-v049', 'Other');
		INSERT INTO accounts (id, role) VALUES
			('admin-v049', 'admin'), ('admin-other-v049', 'admin'),
			('teacher-v049', 'teacher'), ('teacher-unassigned-v049', 'teacher'),
			('student-v049', 'student'), ('student-forged-v049', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-v049', 'admin-v049', NULL), ('session-admin-other-v049', 'admin-other-v049', NULL),
			('session-teacher-v049', 'teacher-v049', NULL),
			('session-teacher-unassigned-v049', 'teacher-unassigned-v049', NULL),
			('session-student-v049', 'student-v049', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-v049', 'admin-v049'), ('center-other-v049', 'admin-other-v049'),
			('center-v049', 'teacher-v049'), ('center-v049', 'teacher-unassigned-v049'),
			('center-v049', 'student-v049');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-v049', 'center-v049', 'Verifier Class', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-v049', 'class-v049', 'student-v049');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-v049', 'class-v049', 'teacher-v049');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-v049', 'center-v049', 'class-v049', '2026-09-01', '2026-09-30',
			'[1]', 'admin-v049', '2026-09-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-v049', 'center-v049', 'class-v049', 'schedule-v049', '2026-09-07',
			'planned', 'admin-v049', '2026-09-01T00:00:00.000Z'
		);
	`);
	return root;
}

describe('TASK-049 independent Lesson Context adapter verification', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('delegates only server-authorized submissions and keeps denied state unchanged', async () => {
		const admin = await lessonContextActions.default(event('session-admin-v049', {
			action: 'createPayment', studentAccountId: 'student-v049', amount: '6.25', factualDate: '', confirmation: 'admin-v049'
		}));
		expect(admin).toEqual({ paymentSuccess: true });
		const teacher = await lessonContextActions.default(event('session-teacher-v049', {
			action: 'createPayment', studentAccountId: 'student-v049', amount: '1.75', factualDate: '2026-09-08', confirmation: 'teacher-v049'
		}));
		expect(teacher).toEqual({ paymentSuccess: true });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 2 });

	const denied = [
		['session-student-v049', { action: 'createPayment', studentAccountId: 'student-v049', amount: '1', factualDate: '2026-09-09', confirmation: 'student-v049' }],
		['session-teacher-unassigned-v049', { action: 'createPayment', studentAccountId: 'student-v049', amount: '1', factualDate: '2026-09-09', confirmation: 'unassigned-v049' }],
		['session-admin-other-v049', { action: 'createPayment', studentAccountId: 'student-v049', amount: '1', factualDate: '2026-09-09', confirmation: 'cross-v049' }],
		['session-admin-v049', { action: 'createPayment', studentAccountId: 'student-forged-v049', amount: '1', factualDate: '2026-09-09', confirmation: 'forged-v049' }]
	] as const;
	for (const [sessionToken, fields] of denied) {
		const before = counts(root);
		const result = await lessonContextActions.default(event(sessionToken, fields));
		expect(result).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(counts(root)).toEqual(before);
	}

	const malformedBefore = counts(root);
	const malformed = await lessonContextActions.default(event('session-admin-v049', {
		action: 'createPayment', studentAccountId: 'student-v049', amount: '1', factualDate: '2026-09-09', confirmation: 'malformed-v049', classId: 'class-forged-v049'
	}));
	expect(malformed).toMatchObject({ status: 400, data: { error: 'invalid_payment_request' } });
	expect(counts(root)).toEqual(malformedBefore);

	const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
	const contextSource = readFileSync(resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'), 'utf8');
	expect(routeSource).toContain('financialLedger.createPayment');
	expect(routeSource).not.toContain('.sqlite');
	expect(routeSource).not.toMatch(/financial_(payments|payment_allocations|payment_commands|audit_records)/);
	expect(contextSource).not.toMatch(/financial_(payments|payment_allocations|payment_commands|audit_records)/);
	});
});
