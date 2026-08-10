import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('FT-003 authorized shared and personal day context', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('teacher-own', 'teacher'),
				('student-one', 'student'),
				('student-two', 'student'),
				('parent-one', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-student-one', 'student-one', NULL),
				('session-student-two', 'student-two', NULL),
				('session-parent-one', 'parent-one', NULL);
			INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-own', 'parent-one');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-own', 'center-own', 'Physics group', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
				VALUES ('center-own', 'class-own', 'teacher-own');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-own', 'student-one'),
				('center-own', 'class-own', 'student-two');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('center-own', 'parent-one', 'student-one');
			INSERT INTO schedules (
				id, center_id, class_id, start_date, end_date, weekdays,
				created_by_account_id, created_at
			) VALUES (
				'schedule-own', 'center-own', 'class-own', '2026-08-10', '2026-08-10',
				'[1]', 'admin-own', '2026-08-01T00:00:00.000Z'
			);
			INSERT INTO lessons (
				id, center_id, class_id, schedule_id, lesson_date, status,
				created_by_account_id, created_at
			) VALUES (
				'lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-10',
				'planned', 'admin-own', '2026-08-01T00:00:00.000Z'
			);
		`);

		root.lessonContext.setSharedLessonMaterial({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			topic: 'Newton laws',
			practicalWork: 'Measure acceleration',
			homework: 'Solve exercises 1–3'
		});
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '20',
			effectiveFrom: '2026-01-01'
		});
		const homework = root.learningProgress.createHomework({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: 'homework-own',
			title: 'Newton worksheet'
		});
		root.learningProgress.recordGrade({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			homeworkId: homework.homeworkId,
			studentAccountId: 'student-one',
			grade: 'β'
		});
		root.learningProgress.recordAttendance({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one',
			attendance: 'present'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'personal',
			studentAccountId: 'student-one',
			messageId: 'personal-message-one',
			body: 'Private practice note'
		});
		root.collaboration.createMessage({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			scope: 'shared',
			messageId: 'shared-message-one',
			body: 'Shared class question'
		});
	});

	afterEach(() => {
		root.database.close();
	});

	it('AC-003 exposes the same common material to teacher, student, and parent class views', () => {
		const contexts = ['session-teacher-own', 'session-student-one', 'session-parent-one'].map(
			(sessionToken) => root.lessonContext.getDayContext({
				sessionToken,
				classId: 'class-own',
				lessonId: 'lesson-own'
			})
		);

		expect(contexts.every((context) => context.mode === 'shared')).toBe(true);
		expect(contexts.map((context) => context.material)).toEqual([
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			},
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			},
			{
				lessonId: 'lesson-own',
				classId: 'class-own',
				topic: 'Newton laws',
				practicalWork: 'Measure acceleration',
				homework: 'Solve exercises 1–3'
			}
		]);
	});

	it('AC-004 composes the selected personal projections with the shared material', () => {
		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});

		expect(personal.mode).toBe('personal');
		expect(personal.material).toEqual(shared.material);
		expect(personal.personal).toMatchObject({
		studentAccountId: 'student-one',
		progress: {
			attendance: { studentAccountId: 'student-one', attendance: 'present' },
			grade: {
				homeworkId: 'homework-own',
				studentAccountId: 'student-one',
				grade: 'β'
			}
		},
		discussion: {
			commonMessages: [expect.objectContaining({
				messageId: 'personal-message-one',
				studentAccountId: 'student-one'
			})]
		},
		financial: { balance: { charges: [expect.objectContaining({ lessonId: 'lesson-own' })] } }
	});
		expect(personal.personal?.discussion.commonMessages).not.toEqual(
			expect.arrayContaining([expect.objectContaining({ messageId: 'shared-message-one' })])
		);
	});

	it('AC-005 keeps authoritative date, class, lesson, and selected student identity in navigation', () => {
		const shared = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own'
		});
		const personal = root.lessonContext.getDayContext({
			sessionToken: 'session-student-one',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});

		expect(shared.navigation).toEqual({
			date: '2026-08-10',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: null
		});
		expect(personal.navigation).toEqual({
			date: '2026-08-10',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-one'
		});
	});

	it('AC-006 denies guessed student context before provider reads and does not mutate state', () => {
		const before = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
					(SELECT COUNT(*) FROM learning_attendance) AS attendance_count,
					(SELECT COUNT(*) FROM collaboration_messages) AS message_count,
					(SELECT COUNT(*) FROM financial_lesson_charges) AS charge_count
			`)
			.get();

		for (const request of [
			{
				sessionToken: 'session-student-one',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: 'student-two'
			},
			{
				sessionToken: 'session-student-two',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: 'student-one'
			},
			{
				sessionToken: 'session-student-one',
				classId: 'class-unknown',
				lessonId: 'lesson-own',
				studentAccountId: 'student-one'
			}
		]) {
			expect(() => root.lessonContext.getDayContext(request)).toThrow('not-authorized');
		}

		const after = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT COUNT(*) FROM lesson_context_material) AS material_count,
					(SELECT COUNT(*) FROM learning_attendance) AS attendance_count,
					(SELECT COUNT(*) FROM collaboration_messages) AS message_count,
					(SELECT COUNT(*) FROM financial_lesson_charges) AS charge_count
			`)
			.get();
		expect(after).toEqual(before);
	});
});
