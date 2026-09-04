import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-price-099', 'Price Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-price-099', 'admin'),
			('teacher-price-099', 'teacher'),
			('student-price-099', 'student'),
			('student-other-099', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-price-099', 'admin-price-099', NULL),
			('session-teacher-price-099', 'teacher-price-099', NULL),
			('session-student-price-099', 'student-price-099', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-price-099', 'admin-price-099'),
			('center-price-099', 'teacher-price-099'),
			('center-price-099', 'student-price-099');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-price-099', 'center-price-099', 'Price Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-price-099', 'class-price-099', 'student-price-099');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-price-099', 'class-price-099', 'teacher-price-099');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-price-099', 'center-price-099', 'class-price-099',
			'2026-01-01', '2026-12-31', '[1]', 'admin-price-099',
			'2026-01-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-old-price-099', 'center-price-099', 'class-price-099', 'schedule-price-099', '2026-09-07', 'planned', 'admin-price-099', '2026-01-01T00:00:00.000Z'),
			('lesson-new-price-099', 'center-price-099', 'class-price-099', 'schedule-price-099', '2026-10-05', 'planned', 'admin-price-099', '2026-01-01T00:00:00.000Z');
	`);
	return root;
}

describe('TASK-099 Financial Ledger price settings', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
	});

	afterEach(() => root.database.close());

	it('returns authorized deterministic history and one current class payment default', () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			amount: '20.00',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setStudentPriceOverride({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			studentAccountId: 'student-price-099',
			amount: '15.50',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			amount: '22',
			effectiveFrom: '2026-10-01'
		});

		const history = root.financialLedger.getPriceSettings({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099'
		});
		expect(history).toHaveLength(3);
		expect(history.map(({ studentAccountId, amount, effectiveFrom }) => ({ studentAccountId, amount, effectiveFrom }))).toEqual([
			{ studentAccountId: null, amount: '20', effectiveFrom: '2026-01-01' },
			{ studentAccountId: 'student-price-099', amount: '15.5', effectiveFrom: '2026-01-01' },
			{ studentAccountId: null, amount: '22', effectiveFrom: '2026-10-01' }
		]);
		expect(history.every((setting) => setting.createdByAccountId === 'admin-price-099')).toBe(true);
		expect(history.every((setting) => setting.createdAt.length > 0)).toBe(true);
		expect(root.financialLedger.getPaymentDefault({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099'
		})).toBe('20');
		expect(root.financialLedger.getPaymentDefault({
			sessionToken: 'session-teacher-price-099',
			classId: 'class-price-099'
		})).toBe('20');
	});

	it('keeps price history and existing charges immutable while later settings affect future charges', () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			amount: '20',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setStudentPriceOverride({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			studentAccountId: 'student-price-099',
			amount: '15',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-admin-price-099',
			lessonId: 'lesson-old-price-099',
			studentAccountId: 'student-price-099',
			attendanceTransition: { from: 'absent', to: 'present' }
		});
		const oldCharge = root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges WHERE lesson_id = ?'
		).get('lesson-old-price-099');

		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			amount: '22',
			effectiveFrom: '2026-10-01'
		});
		root.financialLedger.setStudentPriceOverride({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			studentAccountId: 'student-price-099',
			amount: '18',
			effectiveFrom: '2026-10-01'
		});
		root.financialLedger.reconcileLessonCharge({
			sessionToken: 'session-admin-price-099',
			lessonId: 'lesson-new-price-099',
			studentAccountId: 'student-price-099',
			attendanceTransition: { from: 'absent', to: 'present' }
		});

		expect(root.database.sqlite.prepare(
			'SELECT * FROM financial_lesson_charges WHERE lesson_id = ?'
		).get('lesson-old-price-099')).toEqual(oldCharge);
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			studentAccountId: 'student-price-099'
		}).charges.map((charge) => charge.appliedPrice)).toEqual(['15', '18']);
	});

	it('denies non-Admin history and form-default reads without financial mutation', () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-price-099',
			classId: 'class-price-099',
			amount: '20',
			effectiveFrom: '2026-01-01'
		});
		const before = root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all();
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-teacher-price-099',
			classId: 'class-price-099'
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPaymentDefault({
			sessionToken: 'session-student-price-099',
			classId: 'class-price-099'
		})).toThrow('not-authorized');
		expect(() => root.financialLedger.getPriceSettings({
			sessionToken: 'session-admin-price-099',
			classId: 'class-forged-099'
		})).toThrow('not-authorized');
		expect(root.database.sqlite.prepare(
			'SELECT * FROM financial_price_settings ORDER BY id'
		).all()).toEqual(before);
	});
});
