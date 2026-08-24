import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import {
	CenterSchedulingBoundary,
	type ActorContext
} from '../../src/lib/server/modules/center-scheduling/public';

describe('TASK-095 Attempt 2 verifier-owned provider-boundary probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('own-center', 'Own Center'), ('other-center', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('own-admin', 'admin'), ('other-admin', 'admin'), ('own-teacher', 'teacher'),
				('unassigned-teacher', 'teacher'), ('own-student-one', 'student'),
				('own-student-two', 'student'), ('own-parent', 'parent'), ('other-teacher', 'teacher');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('own-admin-session', 'own-admin', NULL), ('other-admin-session', 'other-admin', NULL),
				('own-teacher-session', 'own-teacher', NULL),
				('unassigned-teacher-session', 'unassigned-teacher', NULL),
				('own-student-session', 'own-student-one', NULL),
				('own-parent-session', 'own-parent', NULL),
				('revoked-session', 'own-admin', '2026-08-22T00:00:00.000Z');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('own-center', 'own-admin'), ('own-center', 'own-teacher'),
				('own-center', 'unassigned-teacher'), ('own-center', 'own-student-one'),
				('own-center', 'own-student-two'), ('own-center', 'own-parent'),
				('other-center', 'other-admin'), ('other-center', 'other-teacher');
		`);

		root.centerScheduling.createClass({
			sessionToken: 'own-admin-session',
			centerId: 'own-center',
			classId: 'own-class',
			name: 'Own Class',
			mode: 'group'
		});
		root.centerScheduling.createClass({
			sessionToken: 'own-admin-session',
			centerId: 'own-center',
			classId: 'empty-class',
			name: 'Empty Class',
			mode: 'individual'
		});
		root.centerScheduling.createClass({
			sessionToken: 'other-admin-session',
			centerId: 'other-center',
			classId: 'other-class',
			name: 'Other Class',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'own-admin-session',
			classId: 'own-class',
			teacherAccountId: 'own-teacher'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'other-admin-session',
			classId: 'other-class',
			teacherAccountId: 'other-teacher'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'own-admin-session',
			classId: 'own-class',
			studentAccountId: 'own-student-one'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'own-admin-session',
			classId: 'own-class',
			studentAccountId: 'own-student-two'
		});
		root.centerScheduling.linkParentToStudent({
			sessionToken: 'own-admin-session',
			centerId: 'own-center',
			parentAccountId: 'own-parent',
			studentAccountId: 'own-student-one'
		});
	});

	afterEach(() => root.database.close());

	it('proves corrected actor boundary, scope matrix, exact C&S fields, denials, and non-mutation', () => {
		const actor = (sessionToken: string): ActorContext | null =>
			root.identityAccess.resolveActor(sessionToken);
		const ownAdmin = actor('own-admin-session');
		const otherAdmin = actor('other-admin-session');
		const ownTeacher = actor('own-teacher-session');
		const unassignedTeacher = actor('unassigned-teacher-session');
		const ownStudent = actor('own-student-session');
		const ownParent = actor('own-parent-session');
		const revoked = actor('revoked-session');

		const provider = new CenterSchedulingBoundary(root.database, {
			resolveActor: () => {
				throw new Error('provider must not resolve actor');
			},
			getAccountEmail: () => {
				throw new Error('provider must not call Identity & Access');
			},
			provisionAccount: () => undefined,
			provisionPasswordAccount: () => undefined
		});

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
				.prepare(
					'SELECT * FROM parent_student_links ORDER BY parent_account_id, student_account_id'
				)
				.all()
		});
		const before = snapshot();

		const adminFacts = provider.getRegistryFacts({ actor: ownAdmin });
		expect(adminFacts).toEqual({
			centerId: 'own-center',
			institution: { centerId: 'own-center', name: 'Own Center' },
			accountIds: [
				'own-admin',
				'own-parent',
				'own-student-one',
				'own-student-two',
				'own-teacher',
				'unassigned-teacher'
			],
			memberships: [
				{ centerId: 'own-center', accountId: 'own-admin' },
				{ centerId: 'own-center', accountId: 'own-parent' },
				{ centerId: 'own-center', accountId: 'own-student-one' },
				{ centerId: 'own-center', accountId: 'own-student-two' },
				{ centerId: 'own-center', accountId: 'own-teacher' },
				{ centerId: 'own-center', accountId: 'unassigned-teacher' }
			],
			parentLinks: [
				{ centerId: 'own-center', parentAccountId: 'own-parent', studentAccountId: 'own-student-one' }
			],
			assignments: [
				{ centerId: 'own-center', classId: 'own-class', teacherAccountId: 'own-teacher' }
			],
			classes: [
				{
					classId: 'empty-class',
					centerId: 'own-center',
					name: 'Empty Class',
					mode: 'individual',
					studentAccountIds: [],
					teacherAccountIds: [],
					studentCount: 0
				},
				{
					classId: 'own-class',
					centerId: 'own-center',
					name: 'Own Class',
					mode: 'group',
					studentAccountIds: ['own-student-one', 'own-student-two'],
					teacherAccountIds: ['own-teacher'],
					studentCount: 2
				}
			]
		});
		expect(Object.keys(adminFacts ?? {}).sort()).toEqual([
			'accountIds',
			'assignments',
			'centerId',
			'classes',
			'institution',
			'memberships',
			'parentLinks'
		]);
		expect(adminFacts?.memberships.every((entry) => Object.keys(entry).sort().join() === 'accountId,centerId')).toBe(
			true
		);
		expect(adminFacts?.classes.every((entry) =>
			Object.keys(entry).sort().join() ===
			'centerId,classId,mode,name,studentAccountIds,studentCount,teacherAccountIds'
		)).toBe(true);

		const teacherFacts = provider.getRegistryFacts({ actor: ownTeacher });
		expect(teacherFacts?.centerId).toBe('own-center');
		expect(teacherFacts?.classes.map(({ classId }) => classId)).toEqual(['own-class']);
		expect(teacherFacts?.accountIds).toEqual([
			'own-parent',
			'own-student-one',
			'own-student-two',
			'own-teacher'
		]);
		expect(teacherFacts?.memberships).toEqual([
			{ centerId: 'own-center', accountId: 'own-parent' },
			{ centerId: 'own-center', accountId: 'own-student-one' },
			{ centerId: 'own-center', accountId: 'own-student-two' },
			{ centerId: 'own-center', accountId: 'own-teacher' }
		]);
		expect(teacherFacts?.classes).toEqual([
			{
				classId: 'own-class',
				centerId: 'own-center',
				name: 'Own Class',
				mode: 'group',
				studentAccountIds: ['own-student-one', 'own-student-two'],
				teacherAccountIds: ['own-teacher'],
				studentCount: 2
			}
		]);
		expect(teacherFacts?.parentLinks).toEqual([
			{ centerId: 'own-center', parentAccountId: 'own-parent', studentAccountId: 'own-student-one' }
		]);
		expect(teacherFacts?.assignments).toEqual([
			{ centerId: 'own-center', classId: 'own-class', teacherAccountId: 'own-teacher' }
		]);

		const otherFacts = provider.getRegistryFacts({ actor: otherAdmin });
		expect(otherFacts?.centerId).toBe('other-center');
		expect(otherFacts?.classes.map(({ classId }) => classId)).toEqual(['other-class']);
		expect(adminFacts?.classes.some(({ classId }) => classId === 'other-class')).toBe(false);
		expect(adminFacts?.accountIds.includes('other-admin')).toBe(false);

		expect(provider.getRegistryFacts({ actor: ownStudent })).toBeNull();
		expect(provider.getRegistryFacts({ actor: ownParent })).toBeNull();
		expect(provider.getRegistryFacts({ actor: unassignedTeacher })).toBeNull();
		expect(provider.getRegistryFacts({ actor: revoked })).toBeNull();
		expect(provider.getRegistryFacts({ actor: null })).toBeNull();
		expect(snapshot()).toEqual(before);

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'own-admin-session',
			classId: 'own-class',
			teacherAccountId: 'own-teacher'
		});
		expect(provider.getRegistryFacts({ actor: ownTeacher })).toBeNull();
	});
});
