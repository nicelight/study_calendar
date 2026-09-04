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

const centerId = 'center-verifier-099';
const classId = 'class-verifier-099';
const adminId = 'admin-verifier-099';
const otherAdminId = 'admin-other-verifier-099';
const teacherId = 'teacher-verifier-099';
const studentId = 'student-verifier-099';
const secondStudentId = 'student-second-verifier-099';

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

function lessonEvent(root: CompositionRoot, token: string) {
	const url = new URL(`https://calendar.test/lesson-context?classId=${classId}&lessonId=lesson-future-verifier-099`);
	return {
		url,
		request: new Request(url),
		cookies: { get: (name: string) => (name === 'foundation_session' ? token : undefined) }
	} as any;
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('${centerId}', 'Verifier Center');
		INSERT INTO accounts (id, role) VALUES
			('${adminId}', 'admin'),
			('${otherAdminId}', 'admin'),
			('${teacherId}', 'teacher'),
			('${studentId}', 'student'),
			('${secondStudentId}', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-verifier-admin-099', '${adminId}', NULL),
			('session-verifier-other-admin-099', '${otherAdminId}', NULL),
			('session-verifier-teacher-099', '${teacherId}', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('${centerId}', '${adminId}'),
			('${centerId}', '${teacherId}'),
			('${centerId}', '${studentId}'),
			('${centerId}', '${secondStudentId}');
		INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES
			('${studentId}', 'Verifier Student One', '2026-01-01T00:00:00.000Z'),
			('${secondStudentId}', 'Verifier Student Two', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('${classId}', '${centerId}', 'Verifier Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('${centerId}', '${classId}', '${studentId}'),
			('${centerId}', '${classId}', '${secondStudentId}');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('${centerId}', '${classId}', '${teacherId}');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-verifier-099', '${centerId}', '${classId}', '2026-01-01', '2026-12-31', '[1]',
			'${adminId}', '2026-01-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-old-verifier-099', '${centerId}', '${classId}', 'schedule-verifier-099', '2026-08-03', 'planned', '${adminId}', '2026-01-01T00:00:00.000Z'),
			('lesson-future-verifier-099', '${centerId}', '${classId}', 'schedule-verifier-099', '2026-10-05', 'planned', '${adminId}', '2026-01-01T00:00:00.000Z');
		INSERT INTO financial_lesson_charges (
			center_id, class_id, lesson_id, student_account_id, lesson_date,
			applied_price, status, created_at, cancelled_at
		) VALUES (
			'${centerId}', '${classId}', 'lesson-old-verifier-099', '${studentId}', '2026-08-03',
			'10', 'active', '2026-08-03T00:00:00.000Z', NULL
		);
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-verifier-admin-099',
		classId,
		lessonId: 'lesson-future-verifier-099',
		topic: 'Verifier topic',
		practicalWork: 'Verifier work',
		homework: 'Verifier homework'
	});
	return root;
}

describe('TASK-099 independent outcome probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('proves protected pricing, editable consumer default, future effects, historical immutability, and denial isolation', async () => {
		const actions = _createAdminFinanceActions({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const saveClass = await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', classId],
			['amount', '20.00'],
			['effectiveFrom', '2026-09-01']
		]));
		const saveOverride = await actions.setStudentPriceOverride!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', classId],
			['studentAccountId', studentId],
			['amount', '15.00'],
			['effectiveFrom', '2026-09-01']
		]));
		expect(saveClass).toEqual({ ok: true, message: 'class_price_saved' });
		expect(saveOverride).toEqual({ ok: true, message: 'student_price_saved' });

		const pageLoad = _createAdminFinancePageLoad({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		});
		const page = pageLoad(adminEvent(root, centerId, 'session-verifier-admin-099'));
		expect(page.classes).toHaveLength(1);
		expect(page.classes[0]).toMatchObject({
			classId,
			name: 'Verifier Class',
			currentAmount: '20',
			students: expect.arrayContaining([
				{ accountId: studentId, label: 'Verifier Student One' },
				{ accountId: secondStudentId, label: 'Verifier Student Two' }
			])
		});
		expect(page.classes[0].settings.map(({ id, classId: settingClassId, studentAccountId, amount, effectiveFrom, createdByAccountId, createdAt }) => ({
			id,
			classId: settingClassId,
			studentAccountId,
			amount,
			effectiveFrom,
			createdByAccountId,
			createdAt: /^\d{4}-\d{2}-\d{2}T/.test(createdAt)
		}))).toEqual([
			{ id: 1, classId, studentAccountId: null, amount: '20', effectiveFrom: '2026-09-01', createdByAccountId: adminId, createdAt: true },
			{ id: 2, classId, studentAccountId: studentId, amount: '15', effectiveFrom: '2026-09-01', createdByAccountId: adminId, createdAt: true }
		]);
		const renderedFinance = render(FinancePage, { props: { data: page, form: null } } as any).body;
		expect(renderedFinance).toContain('Verifier Student One');
		expect(renderedFinance).toContain('value="20"');
		expect(renderedFinance).toContain('datetime="2026-');
		expect(renderedFinance).not.toContain('Удалить');

		const oldChargeBefore = root.database.sqlite.prepare(
			'\n\t\t\tSELECT * FROM financial_lesson_charges WHERE lesson_id = ? AND student_account_id = ?'
		).get('lesson-old-verifier-099', studentId);
		const lessonData = lessonContextLoad(lessonEvent(root, 'session-verifier-admin-099')) as any;
		expect(lessonData.payment.defaultAmount).toBe('20');
		expect(render(LessonContextPage, { props: { data: lessonData, form: null } } as any).body).toContain(
			'name="amount" type="number" min="0.01" step="0.01" required="" value="20"'
		);

		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-verifier-admin-099',
			lessonId: 'lesson-future-verifier-099',
			studentAccountId: studentId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-verifier-admin-099',
			lessonId: 'lesson-future-verifier-099',
			studentAccountId: secondStudentId,
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		expect(root.database.sqlite.prepare(
			'SELECT student_account_id, applied_price FROM financial_lesson_charges WHERE lesson_id = ? ORDER BY student_account_id'
		).all('lesson-future-verifier-099')).toEqual([
			{ student_account_id: secondStudentId, applied_price: '20' },
			{ student_account_id: studentId, applied_price: '15' }
		]);
		expect(root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges WHERE lesson_id = ? AND student_account_id = ?'
		).get('lesson-old-verifier-099', studentId)).toEqual(oldChargeBefore);

		const priceRowsBeforeDenials = root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all();
		const chargeRowsBeforeDenials = root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges ORDER BY lesson_id, student_account_id'
		).all();
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-verifier-teacher-099',
			classId
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-verifier-admin-099',
			classId: 'class-forged-verifier-099'
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPaymentDefault({
			sessionToken: 'session-verifier-teacher-099',
			classId: 'class-forged-verifier-099'
		})).toThrow('not-authorized');
		expect(await actions.setClassPrice!(adminEvent(root, centerId, undefined, [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 401 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-teacher-099', [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', 'class-forged-verifier-099'], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setStudentPriceOverride!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', classId], ['studentAccountId', 'student-forged-verifier-099'], ['amount', '30'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 403 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', classId], ['amount', '0'], ['effectiveFrom', '2026-11-01']
		]))).toMatchObject({ status: 400 });
		expect(await actions.setClassPrice!(adminEvent(root, centerId, 'session-verifier-admin-099', [
			['classId', classId], ['amount', '30'], ['effectiveFrom', '2026-02-30']
		]))).toMatchObject({ status: 400 });
		expect(() => _createAdminFinancePageLoad({
			centerScheduling: root.centerScheduling,
			financialLedger: root.financialLedger
		})(adminEvent(root, centerId, 'session-verifier-other-admin-099'))).toThrow();
		expect(root.database.sqlite.prepare('SELECT * FROM financial_price_settings ORDER BY id').all()).toEqual(priceRowsBeforeDenials);
		expect(root.database.sqlite.prepare('SELECT * FROM financial_lesson_charges ORDER BY lesson_id, student_account_id').all()).toEqual(chargeRowsBeforeDenials);
	});
});
