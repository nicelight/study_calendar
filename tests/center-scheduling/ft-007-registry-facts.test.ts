import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';

type RegistryFacts = {
	centerId: string;
	institution: { centerId: string; name: string };
	accountIds: string[];
	memberships: Array<{ centerId: string; accountId: string }>;
	parentLinks: Array<{ centerId: string; parentAccountId: string; studentAccountId: string }>;
	assignments: Array<{ centerId: string; classId: string; teacherAccountId: string }>;
	classes: Array<{
		classId: string;
		centerId: string;
		name: string;
		mode: 'individual' | 'group';
		studentAccountIds: string[];
		teacherAccountIds: string[];
		studentCount: number;
	}>;
};

type RegistryApi = {
	getRegistryFacts(request: { actor: ActorContext | null }): RegistryFacts | null;
};

function registry(root: CompositionRoot): RegistryApi {
	return root.centerScheduling as unknown as RegistryApi;
}

describe('FT-007 AC-009 Center & Scheduling registry facts', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Own Center'),
				('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('admin-other', 'admin'),
				('teacher-own', 'teacher'),
				('teacher-unassigned', 'teacher'),
				('student-one', 'student'),
				('student-two', 'student'),
				('parent-one', 'parent');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-admin-other', 'admin-other', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-teacher-unassigned', 'teacher-unassigned', NULL),
				('session-student-one', 'student-one', NULL),
				('session-parent-one', 'parent-one', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'teacher-unassigned'),
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-own', 'parent-one'),
				('center-other', 'admin-other');
		`);
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-owned',
			name: 'Owned Class',
			mode: 'group'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-unassigned',
			name: 'Unassigned Class',
			mode: 'individual'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-other',
			centerId: 'center-other',
			classId: 'class-other',
			name: 'Other Class',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-owned',
			teacherAccountId: 'teacher-own'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-owned',
			studentAccountId: 'student-one'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-owned',
			studentAccountId: 'student-two'
		});
		root.centerScheduling.linkParentToStudent({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			parentAccountId: 'parent-one',
			studentAccountId: 'student-one'
		});
	});

	afterEach(() => root.database.close());

	it('returns exact owner-held facts through the server-scoped role matrix without mutation or neighbor calls', () => {
		const resolveActor = (sessionToken: string): ActorContext => {
			const actor = root.identityAccess.resolveActor(sessionToken);
			expect(actor).not.toBeNull();
			return actor!;
		};
		const adminOwn = resolveActor('session-admin-own');
		const adminOther = resolveActor('session-admin-other');
		const teacherOwn = resolveActor('session-teacher-own');
		const teacherUnassigned = resolveActor('session-teacher-unassigned');
		const studentOne = resolveActor('session-student-one');
		const parentOne = resolveActor('session-parent-one');
		const api = registry(root);
		const resolveActorSpy = vi.spyOn(root.identityAccess, 'resolveActor');
		const identitySpy = vi.spyOn(root.identityAccess, 'getAccountEmail');
		const sourceSnapshot = () => ({
			centers: root.database.sqlite.prepare('SELECT * FROM centers ORDER BY id').all(),
			accounts: root.database.sqlite.prepare('SELECT * FROM accounts ORDER BY id').all(),
			sessions: root.database.sqlite.prepare('SELECT * FROM sessions ORDER BY token').all(),
			centerMemberships: root.database.sqlite
				.prepare('SELECT * FROM center_memberships ORDER BY center_id, account_id')
				.all(),
			classes: root.database.sqlite.prepare('SELECT * FROM classes ORDER BY id').all(),
			classStudents: root.database.sqlite
				.prepare('SELECT * FROM class_students ORDER BY class_id, student_account_id')
				.all(),
			teacherAssignments: root.database.sqlite
				.prepare('SELECT * FROM teacher_assignments ORDER BY class_id, teacher_account_id')
				.all(),
			parentLinks: root.database.sqlite
				.prepare(
					'SELECT * FROM parent_student_links ORDER BY parent_account_id, student_account_id'
				)
				.all(),
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		});
		const before = sourceSnapshot();

		const adminFacts = api.getRegistryFacts({ actor: adminOwn });
		expect(adminFacts).toEqual({
			centerId: 'center-own',
			institution: { centerId: 'center-own', name: 'Own Center' },
			accountIds: [
				'admin-own',
				'parent-one',
				'student-one',
				'student-two',
				'teacher-own',
				'teacher-unassigned'
			],
			memberships: [
				{ centerId: 'center-own', accountId: 'admin-own' },
				{ centerId: 'center-own', accountId: 'parent-one' },
				{ centerId: 'center-own', accountId: 'student-one' },
				{ centerId: 'center-own', accountId: 'student-two' },
				{ centerId: 'center-own', accountId: 'teacher-own' },
				{ centerId: 'center-own', accountId: 'teacher-unassigned' }
			],
			parentLinks: [
				{ centerId: 'center-own', parentAccountId: 'parent-one', studentAccountId: 'student-one' }
			],
			assignments: [
				{ centerId: 'center-own', classId: 'class-owned', teacherAccountId: 'teacher-own' }
			],
			classes: [
				{
					classId: 'class-owned',
					centerId: 'center-own',
					name: 'Owned Class',
					mode: 'group',
					studentAccountIds: ['student-one', 'student-two'],
					teacherAccountIds: ['teacher-own'],
					studentCount: 2
				},
				{
					classId: 'class-unassigned',
					centerId: 'center-own',
					name: 'Unassigned Class',
					mode: 'individual',
					studentAccountIds: [],
					teacherAccountIds: [],
					studentCount: 0
				}
			]
		});

		const teacherFacts = api.getRegistryFacts({ actor: teacherOwn });
		expect(teacherFacts?.classes.map((entry) => entry.classId)).toEqual(['class-owned']);
		expect(teacherFacts?.accountIds).toEqual([
			'parent-one',
			'student-one',
			'student-two',
			'teacher-own'
		]);
		expect(api.getRegistryFacts({ actor: studentOne })).toBeNull();
		expect(api.getRegistryFacts({ actor: parentOne })).toBeNull();
		expect(api.getRegistryFacts({ actor: teacherUnassigned })).toBeNull();
		expect(api.getRegistryFacts({ actor: adminOther })?.centerId).toBe('center-other');
		expect(api.getRegistryFacts({ actor: null })).toBeNull();
		const afterQueries = sourceSnapshot();
		expect(afterQueries).toEqual(before);

		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin-own',
			classId: 'class-owned',
			teacherAccountId: 'teacher-own'
		});
		expect(api.getRegistryFacts({ actor: teacherOwn })).toBeNull();
		expect(resolveActorSpy).not.toHaveBeenCalled();
		expect(identitySpy).not.toHaveBeenCalled();
	});
});
