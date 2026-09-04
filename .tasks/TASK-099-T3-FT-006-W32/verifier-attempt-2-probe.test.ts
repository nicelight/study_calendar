import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({
	current: { centerScheduling: {}, financialLedger: {} } as unknown as CompositionRoot | undefined
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
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';
import { load as lessonContextLoad } from '../../src/routes/lesson-context/+page.server';

const centerId = 'center-verifier-attempt-2-099';
const otherCenterId = 'center-other-verifier-attempt-2-099';
const classId = 'class-verifier-attempt-2-099';
const adminId = 'admin-verifier-attempt-2-099';
const otherAdminId = 'admin-other-verifier-attempt-2-099';
const teacherId = 'teacher-verifier-attempt-2-099';
const studentId = 'student-verifier-attempt-2-099';
const secondStudentId = 'student-second-verifier-attempt-2-099';
const futureLessonId = 'lesson-future-verifier-attempt-2-099';
const oldLessonId = 'lesson-old-verifier-attempt-2-099';

function adminEvent(
	root: CompositionRoot,
	center: string,
	token: string | undefined,
	fields: Array<[string, string]> = []
) {
	const url = new URL(`https://calendar.test/admin/${center}/finance`);
	const formData = new FormData();
	for (const [name, value] of fields) formData.append(name, value);
	return {
		params: { centerId: center },
		url,
		locals: { actor: token ? root.identityAccess.resolveActor(token) : null },
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? token : undefined) }
	} as any;
}

function lessonEvent(token: string) {
	const url = new URL(
		`https://calendar.test/lesson-context?classId=${classId}&lessonId=${futureLessonId}`
	);
	return {
		url,
		request: new Request(url),
		cookies: { get: (name: string) => (name === 'foundation_session' ? token : undefined) }
	} as any;
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES
			('${centerId}', 'Verifier Attempt 2 Center'),
			('${otherCenterId}', 'Other Verifier Attempt 2 Center');
		INSERT INTO accounts (id, role) VALUES
			('${adminId}', 'admin'),
			('${otherAdminId}', 'admin'),
			('${teacherId}', 'teacher'),
			('${studentId}', 'student'),
			('${secondStudentId}', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-verifier-attempt-2-admin-099', '${adminId}', NULL),
			('session-verifier-attempt-2-other-admin-099', '${otherAdminId}', NULL),
			('session-verifier-attempt-2-teacher-099', '${teacherId}', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('${centerId}', '${adminId}'),
			('${centerId}', '${teacherId}'),
			('${centerId}', '${studentId}'),
			('${centerId}', '${secondStudentId}'),
			('${otherCenterId}', '${otherAdminId}');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('${studentId}', 'Verifier Attempt 2 Student One', '2026-01-01T00:00:00.000Z'),
			('${secondStudentId}', 'Verifier Attempt 2 Student Two', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('${classId}', '${centerId}', 'Verifier Attempt 2 Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('${centerId}', '${classId}', '${studentId}'),
			('${centerId}', '${classId}', '${secondStudentId}');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('${centerId}', '${classId}', '${teacherId}');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-verifier-attempt-2-099', '${centerId}', '${classId}', '2026-01-01', '2026-12-31', '[1]',
			'${adminId}', '2026-01-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('${oldLessonId}', '${centerId}', '${classId}', 'schedule-verifier-attempt-2-099', '2026-08-03', 'planned', '${adminId}', '2026-01-01T00:00:00.000Z'),
			('${futureLessonId}', '${centerId}', '${classId}', 'schedule-verifier-attempt-2-099', '2026-10-05', 'planned', '${adminId}', '2026-01-01T00:00:00.000Z');
		INSERT INTO financial_lesson_charges (
			center_id, class_id, lesson_id, student_account_id, lesson_date,
			applied_price, status, created_at, cancelled_at
		) VALUES (
			'${centerId}', '${classId}', '${oldLessonId}', '${studentId}', '2026-08-03',
			'10', 'active', '2026-08-03T00:00:00.000Z', NULL
		);
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-verifier-attempt-2-admin-099',
		classId,
		lessonId: futureLessonId,
		topic: 'Verifier Attempt 2 topic',
		practicalWork: 'Verifier Attempt 2 work',
		homework: 'Verifier Attempt 2 homework'
	});
	return root;
}

describe('TASK-099 Attempt 2 verifier-owned outcome', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('proves exact forms, price effects, immutable history, and denial isolation', async () => {
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const classSave = await actions.setClassPrice!(adminEvent(
			root,
			centerId,
			'session-verifier-attempt-2-admin-099',
			[
				['classId', classId],
				['amount', '10.125'],
				['effectiveFrom', '2026-09-01']
			]
		));
		const overrideSave = await actions.setStudentPriceOverride!(adminEvent(
			root,
			centerId,
			'session-verifier-attempt-2-admin-099',
			[
				['classId', classId],
				['studentAccountId', studentId],
				['amount', '15.125'],
				['effectiveFrom', '2026-09-01']
			]
		));
		expect(classSave).toEqual({ ok: true, message: 'class_price_saved' });
		expect(overrideSave).toEqual({ ok: true, message: 'student_price_saved' });

		const pageLoad = _createAdminFinancePageLoad({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const financeData = pageLoad(adminEvent(root, centerId, 'session-verifier-attempt-2-admin-099'));
		const classView = financeData.classes[0];
		expect(classView).toMatchObject({
			classId,
			currentAmount: '10.125',
			students: expect.arrayContaining([
				{ accountId: studentId, label: 'Verifier Attempt 2 Student One' },
				{ accountId: secondStudentId, label: 'Verifier Attempt 2 Student Two' }
			])
		});
		expect(classView.settings.map(({ id, studentAccountId, amount, effectiveFrom, createdByAccountId, createdAt }) => ({
			id,
			studentAccountId,
			amount,
			effectiveFrom,
			createdByAccountId,
			createdAt: /^\d{4}-\d{2}-\d{2}T/.test(createdAt)
		}))).toEqual([
			{ id: 1, studentAccountId: null, amount: '10.125', effectiveFrom: '2026-09-01', createdByAccountId: adminId, createdAt: true },
			{ id: 2, studentAccountId: studentId, amount: '15.125', effectiveFrom: '2026-09-01', createdByAccountId: adminId, createdAt: true }
		]);
		const renderedFinance = render(FinancePage, { props: { data: financeData, form: null } } as any).body;
		expect(renderedFinance).toContain('step="any"');
		expect(renderedFinance).toContain('10.125');
		expect(renderedFinance).toContain('15.125');
		expect(renderedFinance).not.toContain('Удалить');

		const oldChargeBefore = root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges WHERE lesson_id = ? AND student_account_id = ?'
		).get(oldLessonId, studentId);
		const lessonData = lessonContextLoad(lessonEvent('session-verifier-attempt-2-admin-099')) as any;
		expect(lessonData.payment.defaultAmount).toBe('10.125');
		const renderedLesson = render(LessonContextPage, { props: { data: lessonData, form: null } } as any).body;
		expect(renderedLesson).toContain('name="amount" type="number" min="0.01" step="any" required="" value="10.125"');

		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-verifier-attempt-2-admin-099',
			lessonId: futureLessonId,
			studentAccountId: studentId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-verifier-attempt-2-admin-099',
			lessonId: futureLessonId,
			studentAccountId: secondStudentId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		expect(root.database.sqlite.prepare(
			'SELECT student_account_id, applied_price FROM financial_lesson_charges WHERE lesson_id = ? ORDER BY student_account_id'
		).all(futureLessonId)).toEqual([
			{ student_account_id: secondStudentId, applied_price: '10.125' },
			{ student_account_id: studentId, applied_price: '15.125' }
		]);
		expect(root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges WHERE lesson_id = ? AND student_account_id = ?'
		).get(oldLessonId, studentId)).toEqual(oldChargeBefore);

		const priceRowsBeforeDenials = root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all();
		const chargeRowsBeforeDenials = root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges ORDER BY lesson_id, student_account_id'
		).all();
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-verifier-attempt-2-teacher-099',
			classId
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-verifier-attempt-2-admin-099',
			classId: 'class-forged-verifier-attempt-2-099'
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPaymentDefault({
			sessionToken: 'session-verifier-attempt-2-teacher-099',
			classId: 'class-forged-verifier-attempt-2-099'
		})).toThrow('not-authorized');
		expect(await actions.setClassPrice!(adminEvent(root, centerId, undefined, [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 401 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-attempt-2-teacher-099', [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-attempt-2-admin-099', [
			['classId', 'class-forged-verifier-attempt-2-099'], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setStudentPriceOverride!(adminEvent(root, centerId, 'session-verifier-attempt-2-admin-099', [
			['classId', classId], ['studentAccountId', 'student-forged-verifier-attempt-2-099'], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-attempt-2-other-admin-099', [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-attempt-2-admin-099', [
			['classId', classId], ['amount', '0'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 400 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-attempt-2-admin-099', [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-02-30']
		]))).toMatchObject({ status: 400 });
		expect(() => pageLoad(adminEvent(root, centerId, 'session-verifier-attempt-2-other-admin-099'))).toThrow();
		expect(root.database.sqlite.prepare('SELECT * FROM financial_price_settings ORDER BY id').all()).toEqual(priceRowsBeforeDenials);
		expect(root.database.sqlite.prepare('SELECT * FROM financial_lesson_charges ORDER BY lesson_id, student_account_id').all()).toEqual(chargeRowsBeforeDenials);
	});
});
