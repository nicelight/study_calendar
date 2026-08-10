import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

function seedAttendanceFixture(root: CompositionRoot): void {
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('teacher-own', 'teacher'),
			('student-one', 'student'),
			('student-two', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-own', 'admin-own', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-student-one', 'student-one', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'teacher-own'),
			('center-own', 'student-one'),
			('center-own', 'student-two');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-individual', 'center-own', 'Individual', 'individual'),
			('class-group', 'center-own', 'Group', 'group'),
			('class-unpriced', 'center-own', 'Unpriced', 'group');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
			('center-own', 'class-individual', 'teacher-own'),
			('center-own', 'class-group', 'teacher-own'),
			('center-own', 'class-unpriced', 'teacher-own');
		INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
			('center-own', 'class-individual', 'student-one'),
			('center-own', 'class-group', 'student-one'),
			('center-own', 'class-group', 'student-two'),
			('center-own', 'class-unpriced', 'student-one');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES
			('schedule-individual', 'center-own', 'class-individual', '2026-02-01', '2026-02-01', '[0]', 'admin-own', '2026-01-01T00:00:00.000Z'),
			('schedule-group', 'center-own', 'class-group', '2026-01-10', '2026-02-10', '[0]', 'admin-own', '2026-01-01T00:00:00.000Z'),
			('schedule-unpriced', 'center-own', 'class-unpriced', '2026-02-15', '2026-02-15', '[0]', 'admin-own', '2026-01-01T00:00:00.000Z');
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-individual', 'center-own', 'class-individual', 'schedule-individual', '2026-02-01', 'planned', 'admin-own', '2026-01-01T00:00:00.000Z'),
			('lesson-group-old', 'center-own', 'class-group', 'schedule-group', '2026-01-10', 'planned', 'admin-own', '2026-01-01T00:00:00.000Z'),
			('lesson-group-new', 'center-own', 'class-group', 'schedule-group', '2026-02-10', 'planned', 'admin-own', '2026-01-01T00:00:00.000Z'),
			('lesson-unpriced', 'center-own', 'class-unpriced', 'schedule-unpriced', '2026-02-15', 'planned', 'admin-own', '2026-01-01T00:00:00.000Z');
	`);
}

function record(
	root: CompositionRoot,
	request: {
		classId: string;
		lessonId: string;
		studentAccountId: string;
		attendance: 'present' | 'absent';
	}
) {
	return root.learningProgress.recordAttendance({
		sessionToken: 'session-admin-own',
		...request
	});
}

describe('Learning Progress attendance and Financial Ledger reconciliation', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		seedAttendanceFixture(root);
	});

	afterEach(() => root.database.close());

	it('FT-005-AC-003 handles absent and present in individual and group lessons at historical prices', () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-individual',
			amount: '12.50',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			amount: '20.00',
			effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-individual',
			amount: '99.00',
			effectiveFrom: '2026-03-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			amount: '99.00',
			effectiveFrom: '2026-03-01'
		});

		expect(record(root, {
			classId: 'class-individual', lessonId: 'lesson-individual', studentAccountId: 'student-one', attendance: 'absent'
		})).toMatchObject({ attendance: 'absent', recordedByAccountId: 'admin-own' });
		expect(record(root, {
			classId: 'class-group', lessonId: 'lesson-group-old', studentAccountId: 'student-one', attendance: 'absent'
		})).toMatchObject({ attendance: 'absent', recordedByAccountId: 'admin-own' });
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-individual', studentAccountId: 'student-one'
		}).charges).toEqual([]);
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-one'
		}).charges).toEqual([]);

		expect(record(root, {
			classId: 'class-individual', lessonId: 'lesson-individual', studentAccountId: 'student-one', attendance: 'present'
		})).toMatchObject({ attendance: 'present' });
		expect(record(root, {
			classId: 'class-group', lessonId: 'lesson-group-old', studentAccountId: 'student-one', attendance: 'present'
		})).toMatchObject({ attendance: 'present' });

		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-individual', studentAccountId: 'student-one'
		}).charges).toMatchObject([{ lessonId: 'lesson-individual', appliedPrice: '12.5', status: 'active' }]);
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-one'
		}).charges).toMatchObject([{ lessonId: 'lesson-group-old', appliedPrice: '20', status: 'active' }]);
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-two'
		}).charges).toEqual([]);
	});

	it('FT-005-AC-004 atomically reconciles historical charge, balance, audit, and isolation', () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own', classId: 'class-group', amount: '10.125', effectiveFrom: '2026-01-01'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own', classId: 'class-group', amount: '25', effectiveFrom: '2026-03-01'
		});
		root.database.sqlite.prepare(`
			INSERT INTO financial_payments (
				id, center_id, class_id, student_account_id, amount, factual_date,
				status, created_by_account_id, created_at
			) VALUES (?, ?, ?, ?, ?, ?, 'recorded', ?, ?)
		`).run(
			'payment-history', 'center-own', 'class-group', 'student-one', '15', '2026-02-15',
			'admin-own', '2026-02-15T00:00:00.000Z'
		);

		record(root, { classId: 'class-group', lessonId: 'lesson-group-old', studentAccountId: 'student-one', attendance: 'absent' });
		record(root, { classId: 'class-group', lessonId: 'lesson-group-new', studentAccountId: 'student-one', attendance: 'absent' });
		expect(() => record(root, {
			classId: 'class-group', lessonId: 'lesson-group-old', studentAccountId: 'student-one', attendance: 'present'
		})).not.toThrow();

		const afterFirstCorrection = root.financialLedger.getBalanceProjection({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-one'
		});
		expect(afterFirstCorrection.charges).toEqual([{
			lessonId: 'lesson-group-old', state: 'paid', allocatedAmount: '10.125', remainingAmount: '0'
		}]);
		expect(afterFirstCorrection.balance).toBe('-4.875');
		expect(afterFirstCorrection.advance).toBe('4.875');

		const secondCorrection = record(root, {
			classId: 'class-group', lessonId: 'lesson-group-new', studentAccountId: 'student-one', attendance: 'present'
		});
		expect(secondCorrection).toMatchObject({ attendance: 'present', recordedByAccountId: 'admin-own' });
		const finalProjection = root.financialLedger.getBalanceProjection({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-one'
		});
		expect(finalProjection.charges).toEqual([
			{ lessonId: 'lesson-group-old', state: 'paid', allocatedAmount: '10.125', remainingAmount: '0' },
			{ lessonId: 'lesson-group-new', state: 'partially_paid', allocatedAmount: '4.875', remainingAmount: '5.25' }
		]);
		expect(finalProjection.balance).toBe('5.25');
		expect(finalProjection.audit).toEqual([]);

		const chargeReplay = root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-one'
		});
		expect(chargeReplay.charges.map(({ lessonId, appliedPrice }) => ({ lessonId, appliedPrice }))).toEqual([
			{ lessonId: 'lesson-group-old', appliedPrice: '10.125' },
			{ lessonId: 'lesson-group-new', appliedPrice: '10.125' }
		]);
		expect(chargeReplay.audit).toHaveLength(2);
		expect(chargeReplay.audit).toEqual(expect.arrayContaining([
			expect.objectContaining({
				action: 'charge-created', actorAccountId: 'admin-own',
				before: null, after: expect.objectContaining({ appliedPrice: '10.125', status: 'active' }),
				changedAt: expect.any(String)
			}),
			{
				action: 'charge-created', actorAccountId: 'admin-own',
				before: null, after: expect.objectContaining({ appliedPrice: '10.125', status: 'active' }),
				changedAt: expect.any(String)
			}
		]));
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-group', studentAccountId: 'student-two'
		}).charges).toEqual([]);

		record(root, { classId: 'class-unpriced', lessonId: 'lesson-unpriced', studentAccountId: 'student-one', attendance: 'absent' });
		expect(() => record(root, {
			classId: 'class-unpriced', lessonId: 'lesson-unpriced', studentAccountId: 'student-one', attendance: 'present'
		})).toThrow('price-not-configured');
		expect(root.learningProgress.getAttendance({
			sessionToken: 'session-admin-own', classId: 'class-unpriced', lessonId: 'lesson-unpriced', studentAccountId: 'student-one'
		})).toMatchObject({ attendance: 'absent' });
		expect(root.financialLedger.getChargeReplay({
			sessionToken: 'session-admin-own', classId: 'class-unpriced', studentAccountId: 'student-one'
		}).charges).toEqual([]);

		expect(() => record(root, {
			classId: 'class-group', lessonId: 'lesson-group-new', studentAccountId: 'student-one', attendance: 'absent'
		})).not.toThrow();
		expect(() => root.learningProgress.recordAttendance({
			sessionToken: 'session-student-one', classId: 'class-group', lessonId: 'lesson-group-new', studentAccountId: 'student-one', attendance: 'present'
		})).toThrow('not-authorized');
	});
});
