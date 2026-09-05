import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-markers', 'Markers Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-markers', 'admin'),
			('teacher-markers', 'teacher'),
			('student-markers', 'student'),
			('parent-markers', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-markers', 'admin-markers', NULL),
			('session-teacher-markers', 'teacher-markers', NULL),
			('session-student-markers', 'student-markers', NULL),
			('session-parent-markers', 'parent-markers', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-markers', 'admin-markers'),
			('center-markers', 'teacher-markers'),
			('center-markers', 'student-markers'),
			('center-markers', 'parent-markers');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-markers', 'center-markers', 'Marker Class', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-markers', 'class-markers', 'student-markers');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-markers', 'parent-markers', 'student-markers');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-markers', 'class-markers', 'teacher-markers');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-markers', 'center-markers', 'class-markers', '2026-08-01', '2026-09-30',
			'[1,2]', 'admin-markers', '2026-08-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-marker-week', 'center-markers', 'class-markers', 'schedule-markers', '2026-08-10', 'planned', 'admin-markers', '2026-08-01T00:00:00.000Z'),
			('lesson-marker-month', 'center-markers', 'class-markers', 'schedule-markers', '2026-09-01', 'planned', 'admin-markers', '2026-08-01T00:00:00.000Z');
	`);
	return root;
}

function financialSnapshot(root: CompositionRoot) {
	return root.database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
		`)
		.get();
}

describe('TASK-101 Lesson Context personal payment markers', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		root.financialLedger.createPayment({
			sessionToken: 'session-admin-markers',
			classId: 'class-markers',
			studentAccountId: 'student-markers',
			amount: '12.500',
			factualDate: '2026-08-10',
			confirmation: 'marker-week'
		});
		root.financialLedger.createPayment({
			sessionToken: 'session-admin-markers',
			classId: 'class-markers',
			studentAccountId: 'student-markers',
			amount: '3.125',
			factualDate: '2026-08-10',
			confirmation: 'marker-week-second'
		});
		root.financialLedger.createPayment({
			sessionToken: 'session-admin-markers',
			classId: 'class-markers',
			studentAccountId: 'student-markers',
			amount: '4.250',
			factualDate: '2026-09-01',
			confirmation: 'marker-month'
		});
	});

	afterEach(() => root.database.close());

	it('serves the same server-resolved projection to Student and linked Parent without mutation', () => {
		const before = financialSnapshot(root);

		const studentMarkers = root.lessonContext.getPersonalPaymentMarkers({
			sessionToken: 'session-student-markers',
			classId: 'class-markers'
		});
		const parentMarkers = root.lessonContext.getPersonalPaymentMarkers({
			sessionToken: 'session-parent-markers',
			classId: 'class-markers'
		});

		expect(studentMarkers).toEqual([
			{ paymentId: expect.any(String), markerDate: '2026-08-09', factualDate: '2026-08-10', amount: '12.5' },
			{ paymentId: expect.any(String), markerDate: '2026-08-09', factualDate: '2026-08-10', amount: '3.125' },
			{ paymentId: expect.any(String), markerDate: '2026-08-31', factualDate: '2026-09-01', amount: '4.25' }
		]);
		expect(parentMarkers).toEqual(studentMarkers);
		expect(financialSnapshot(root)).toEqual(before);
	});

	it('denies shared roles before any financial projection read', () => {
		const before = financialSnapshot(root);

		for (const sessionToken of ['session-admin-markers', 'session-teacher-markers']) {
			expect(() => root.lessonContext.getPersonalPaymentMarkers({
				sessionToken,
				classId: 'class-markers'
			})).toThrow('not-authorized');
		}

		expect(financialSnapshot(root)).toEqual(before);
	});
});
