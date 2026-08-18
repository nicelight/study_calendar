import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const semanticRoot = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => semanticRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import { actions as lessonContextActions } from '../../src/routes/lesson-context/+page.server';

function actionEvent(
	sessionToken: string,
	classId: string,
	lessonId: string,
	fields: Array<[string, string]>
) {
	const url = new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=${lessonId}`);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) }
	} as any;
}

function financialCounts(root: CompositionRoot) {
	return root.database.sqlite.prepare(`
		SELECT
			(SELECT COUNT(*) FROM financial_payments) AS payments,
			(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
			(SELECT COUNT(*) FROM financial_payment_commands) AS commands,
			(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
	`).get();
}

function createSemanticFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-sem-049', 'Semantic'), ('center-other-sem-049', 'Other');
		INSERT INTO accounts (id, role) VALUES
			('admin-sem-049', 'admin'), ('admin-other-sem-049', 'admin'),
			('student-sem-049', 'student'), ('student-other-sem-049', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-sem-049', 'admin-sem-049', NULL),
			('session-admin-other-sem-049', 'admin-other-sem-049', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-sem-049', 'admin-sem-049'), ('center-other-sem-049', 'admin-other-sem-049'),
			('center-sem-049', 'student-sem-049'), ('center-other-sem-049', 'student-other-sem-049');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-sem-049', 'center-sem-049', 'Semantic Class', 'individual'),
			('class-other-sem-049', 'center-other-sem-049', 'Other Class', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-sem-049', 'class-sem-049', 'student-sem-049'),
			('center-other-sem-049', 'class-other-sem-049', 'student-other-sem-049');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-sem-049', 'center-sem-049', 'class-sem-049', '2026-09-01', '2026-09-30', '[1]', 'admin-sem-049', '2026-09-01T00:00:00.000Z'),
			('schedule-other-sem-049', 'center-other-sem-049', 'class-other-sem-049', '2026-09-01', '2026-09-30', '[1]', 'admin-other-sem-049', '2026-09-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-sem-049', 'center-sem-049', 'class-sem-049', 'schedule-sem-049', '2026-09-07', 'planned', 'admin-sem-049', '2026-09-01T00:00:00.000Z'),
			('lesson-other-sem-049', 'center-other-sem-049', 'class-other-sem-049', 'schedule-other-sem-049', '2026-09-07', 'planned', 'admin-other-sem-049', '2026-09-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-049 adversarial Lesson Context adapter semantics', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createSemanticFixture();
		semanticRoot.current = root;
	});

	afterEach(() => {
		semanticRoot.current = undefined;
		root.database.close();
	});

	it('keeps forged query/form scope outside the financial mutation boundary', async () => {
		const accepted = await lessonContextActions.default(actionEvent(
			'session-admin-sem-049',
			'class-sem-049',
			'lesson-sem-049',
			[
				['action', 'createPayment'],
				['studentAccountId', 'student-sem-049'],
				['amount', '4'],
				['factualDate', ''],
				['confirmation', 'semantic-accepted-049']
			]
		));
		expect(accepted).toEqual({ paymentSuccess: true });

		const deniedRequests = [
			actionEvent('session-admin-sem-049', 'class-sem-049', 'lesson-sem-049', [
				['action', 'createPayment'],
				['studentAccountId', 'student-other-sem-049'],
				['amount', '1'],
				['factualDate', '2026-09-08'],
				['confirmation', 'semantic-forged-student-049']
			]),
			actionEvent('session-admin-other-sem-049', 'class-sem-049', 'lesson-sem-049', [
				['action', 'createPayment'],
				['studentAccountId', 'student-sem-049'],
				['amount', '1'],
				['factualDate', '2026-09-08'],
				['confirmation', 'semantic-cross-center-049']
			]),
			actionEvent('session-admin-sem-049', 'class-other-sem-049', 'lesson-other-sem-049', [
				['action', 'createPayment'],
				['studentAccountId', 'student-other-sem-049'],
				['amount', '1'],
				['factualDate', '2026-09-08'],
				['confirmation', 'semantic-forged-query-049']
			]),
			actionEvent('session-admin-sem-049', 'class-sem-049', 'lesson-sem-049', [
				['action', 'createPayment'],
				['studentAccountId', 'student-sem-049'],
				['amount', '1'],
				['factualDate', '2026-09-08'],
				['confirmation', 'semantic-extra-field-049'],
				['classId', 'class-other-sem-049']
			])
		];

		for (const request of deniedRequests) {
			const before = financialCounts(root);
			const result = await lessonContextActions.default(request);
			expect(result).toMatchObject({ status: expect.any(Number), data: { error: expect.stringMatching(/payment_forbidden|invalid_payment_request/) } });
			expect(financialCounts(root)).toEqual(before);
		}

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		const contextSource = readFileSync(resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'), 'utf8');
		expect(routeSource).toContain('root.financialLedger.createPayment');
		expect(routeSource).not.toMatch(/(?:\.sqlite|financial_(?:payments|payment_allocations|payment_commands|audit_records))/);
		expect(contextSource).not.toMatch(/financial_(?:payments|payment_allocations|payment_commands|audit_records)/);
	});
});
