import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('TASK-095 verifier-owned AC-009 provider probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('v-center', 'Verifier Center'), ('x-center', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('v-admin', 'admin'), ('x-admin', 'admin'), ('v-teacher', 'teacher'),
				('v-unassigned', 'teacher'), ('v-student', 'student'), ('v-parent', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('v-admin-session', 'v-admin', NULL), ('x-admin-session', 'x-admin', NULL),
				('v-teacher-session', 'v-teacher', NULL), ('v-unassigned-session', 'v-unassigned', NULL),
				('v-student-session', 'v-student', NULL), ('v-parent-session', 'v-parent', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('v-center', 'v-admin'), ('v-center', 'v-teacher'), ('v-center', 'v-unassigned'),
				('v-center', 'v-student'), ('v-center', 'v-parent'), ('x-center', 'x-admin');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'v-admin-session',
			centerId: 'v-center',
			classId: 'v-class',
			name: 'Verifier Class',
			mode: 'group'
		});
		root.centerScheduling.createClass({
			sessionToken: 'v-admin-session',
			centerId: 'v-center',
			classId: 'v-empty-class',
			name: 'Empty Class',
			mode: 'individual'
		});
		root.centerScheduling.createClass({
			sessionToken: 'x-admin-session',
			centerId: 'x-center',
			classId: 'x-class',
			name: 'Other Class',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'v-admin-session',
			classId: 'v-class',
			teacherAccountId: 'v-teacher'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'v-admin-session',
			classId: 'v-class',
			studentAccountId: 'v-student'
		});
		root.centerScheduling.linkParentToStudent({
			sessionToken: 'v-admin-session',
			centerId: 'v-center',
			parentAccountId: 'v-parent',
			studentAccountId: 'v-student'
		});
	});

	afterEach(() => root.database.close());

	it('proves authorized structural facts, denials, no-neighbor reads, and non-mutation', () => {
		const identitySpy = vi.spyOn(root.identityAccess, 'getAccountEmail');
		const snapshot = () => ({
			centers: root.database.sqlite.prepare('SELECT * FROM centers ORDER BY id').all(),
			accounts: root.database.sqlite.prepare('SELECT * FROM accounts ORDER BY id').all(),
			sessions: root.database.sqlite.prepare('SELECT * FROM sessions ORDER BY token').all(),
			memberships: root.database.sqlite
				.prepare('SELECT * FROM center_memberships ORDER BY center_id, account_id')
				.all(),
			classes: root.database.sqlite.prepare('SELECT * FROM classes ORDER BY id').all(),
			classStudents: root.database.sqlite
				.prepare('SELECT * FROM class_students ORDER BY class_id, student_account_id')
				.all(),
			assignments: root.database.sqlite
				.prepare('SELECT * FROM teacher_assignments ORDER BY class_id, teacher_account_id')
				.all(),
			parentLinks: root.database.sqlite
				.prepare('SELECT * FROM parent_student_links ORDER BY parent_account_id, student_account_id')
				.all()
		});
		const before = snapshot();

		const admin = root.centerScheduling.getRegistryFacts({ sessionToken: 'v-admin-session' });
		expect(admin).not.toBeNull();
		expect(admin).toMatchObject({
			centerId: 'v-center',
			institution: { centerId: 'v-center', name: 'Verifier Center' },
			accountIds: ['v-admin', 'v-parent', 'v-student', 'v-teacher', 'v-unassigned'],
			classes: [
				{
					classId: 'v-empty-class',
					centerId: 'v-center',
					studentAccountIds: [],
					teacherAccountIds: [],
					studentCount: 0
				},
				{
					classId: 'v-class',
					centerId: 'v-center',
					studentAccountIds: ['v-student'],
					teacherAccountIds: ['v-teacher'],
					studentCount: 1
				}
			]
		});
		expect(Object.keys(admin ?? {}).sort()).toEqual([
			'accountIds',
			'assignments',
			'centerId',
			'classes',
			'institution',
			'memberships',
			'parentLinks'
		]);
		expect(Object.keys(admin?.classes[0] ?? {}).sort()).toEqual([
			'centerId',
			'classId',
			'mode',
			'name',
			'studentAccountIds',
			'studentCount',
			'teacherAccountIds'
		]);
		expect(admin?.parentLinks).toEqual([
			{ centerId: 'v-center', parentAccountId: 'v-parent', studentAccountId: 'v-student' }
		]);
		expect(admin?.assignments).toEqual([
			{ centerId: 'v-center', classId: 'v-class', teacherAccountId: 'v-teacher' }
		]);

		const teacher = root.centerScheduling.getRegistryFacts({ sessionToken: 'v-teacher-session' });
		expect(teacher?.centerId).toBe('v-center');
		expect(teacher?.classes.map(({ classId }) => classId)).toEqual(['v-class']);
		expect(teacher?.accountIds).toEqual(['v-parent', 'v-student', 'v-teacher']);
		expect(teacher?.memberships).toEqual([
			{ centerId: 'v-center', accountId: 'v-parent', role: 'parent' },
			{ centerId: 'v-center', accountId: 'v-student', role: 'student' },
			{ centerId: 'v-center', accountId: 'v-teacher', role: 'teacher' }
		]);

		expect(root.centerScheduling.getRegistryFacts({ sessionToken: 'v-student-session' })).toBeNull();
		expect(root.centerScheduling.getRegistryFacts({ sessionToken: 'v-parent-session' })).toBeNull();
		expect(root.centerScheduling.getRegistryFacts({ sessionToken: 'v-unassigned-session' })).toBeNull();
		expect(root.centerScheduling.getRegistryFacts({})).toBeNull();
		expect(root.centerScheduling.getRegistryFacts({ sessionToken: 'x-admin-session' })?.centerId).toBe('x-center');
		expect(snapshot()).toEqual(before);

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'v-admin-session',
			classId: 'v-class',
			teacherAccountId: 'v-teacher'
		});
		expect(root.centerScheduling.getRegistryFacts({ sessionToken: 'v-teacher-session' })).toBeNull();
		expect(identitySpy).not.toHaveBeenCalled();
	});
});
