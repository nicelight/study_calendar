import { readFileSync } from 'node:fs';
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

const publicSource = readFileSync(
	new URL('../../src/lib/server/modules/center-scheduling/public.ts', import.meta.url),
	'utf8'
);

function methodSlice(start: string, end: string): string {
	const startIndex = publicSource.indexOf(start);
	const endIndex = publicSource.indexOf(end, startIndex + start.length);
	if (startIndex < 0 || endIndex < 0) {
		throw new Error(`source boundary not found: ${start} -> ${end}`);
	}
	return publicSource.slice(startIndex, endIndex);
}

function registry(root: CompositionRoot): RegistryApi {
	return root.centerScheduling as unknown as RegistryApi;
}

function keys(value: unknown): string[] {
	return value && typeof value === 'object' ? Object.keys(value).sort() : [];
}

describe('TASK-095 Focus A — C&S provider boundary and ownership', () => {
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
				('center-own', 'parent-one'),
				('center-other', 'admin-other');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-owned', 'center-own', 'Owned Class', 'group'),
				('class-empty', 'center-own', 'Empty Class', 'individual'),
				('class-other', 'center-other', 'Other Class', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id) VALUES
				('center-own', 'class-owned', 'teacher-own');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-owned', 'student-one');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'parent-one', 'student-one');
		`);
	});

	afterEach(() => root.database.close());

	it('uses a server-resolved actor and stays on the C&S-owned structural boundary', () => {
		const api = registry(root);
		const resolved = {
			admin: root.identityAccess.resolveActor('session-admin-own'),
			teacher: root.identityAccess.resolveActor('session-teacher-own'),
			unassigned: root.identityAccess.resolveActor('session-teacher-unassigned'),
			student: root.identityAccess.resolveActor('session-student-one'),
			parent: root.identityAccess.resolveActor('session-parent-one'),
			otherAdmin: root.identityAccess.resolveActor('session-admin-other')
		};
		expect(resolved.admin).toEqual({ accountId: 'admin-own', role: 'admin' });
		expect(resolved.teacher).toEqual({ accountId: 'teacher-own', role: 'teacher' });

		const resolveActorSpy = vi.spyOn(root.identityAccess, 'resolveActor');
		const getAccountEmailSpy = vi.spyOn(root.identityAccess, 'getAccountEmail');
		const snapshot = () => ({
			centers: root.database.sqlite.prepare('SELECT * FROM centers ORDER BY id').all(),
			accounts: root.database.sqlite.prepare('SELECT * FROM accounts ORDER BY id').all(),
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

		const adminFacts = api.getRegistryFacts({ actor: resolved.admin! });
		expect(adminFacts).toEqual({
			centerId: 'center-own',
			institution: { centerId: 'center-own', name: 'Own Center' },
			accountIds: ['admin-own', 'parent-one', 'student-one', 'teacher-own', 'teacher-unassigned'],
			memberships: [
				{ centerId: 'center-own', accountId: 'admin-own' },
				{ centerId: 'center-own', accountId: 'parent-one' },
				{ centerId: 'center-own', accountId: 'student-one' },
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
					classId: 'class-empty',
					centerId: 'center-own',
					name: 'Empty Class',
					mode: 'individual',
					studentAccountIds: [],
					teacherAccountIds: [],
					studentCount: 0
				},
				{
					classId: 'class-owned',
					centerId: 'center-own',
					name: 'Owned Class',
					mode: 'group',
					studentAccountIds: ['student-one'],
					teacherAccountIds: ['teacher-own'],
					studentCount: 1
				}
			]
		});
		expect(keys(adminFacts)).toEqual([
			'accountIds',
			'assignments',
			'centerId',
			'classes',
			'institution',
			'memberships',
			'parentLinks'
		]);
		expect(keys(adminFacts?.institution)).toEqual(['centerId', 'name']);
		expect(keys(adminFacts?.memberships[0])).toEqual(['accountId', 'centerId']);
		expect(keys(adminFacts?.parentLinks[0])).toEqual([
			'centerId',
			'parentAccountId',
			'studentAccountId'
		]);
		expect(keys(adminFacts?.assignments[0])).toEqual([
			'centerId',
			'classId',
			'teacherAccountId'
		]);
		expect(keys(adminFacts?.classes[0])).toEqual([
			'centerId',
			'classId',
			'mode',
			'name',
			'studentAccountIds',
			'studentCount',
			'teacherAccountIds'
		]);

		const teacherFacts = api.getRegistryFacts({ actor: resolved.teacher! });
		expect(teacherFacts?.centerId).toBe('center-own');
		expect(teacherFacts?.classes.map(({ classId }) => classId)).toEqual(['class-owned']);
		expect(teacherFacts?.accountIds).toEqual(['parent-one', 'student-one', 'teacher-own']);
		expect(api.getRegistryFacts({ actor: resolved.student! })).toBeNull();
		expect(api.getRegistryFacts({ actor: resolved.parent! })).toBeNull();
		expect(api.getRegistryFacts({ actor: resolved.unassigned! })).toBeNull();
		expect(api.getRegistryFacts({ actor: null })).toBeNull();
		expect(api.getRegistryFacts({ actor: resolved.otherAdmin! })?.centerId).toBe('center-other');
		expect(snapshot()).toEqual(before);

		root.database.sqlite
			.prepare(
				'DELETE FROM teacher_assignments WHERE center_id = ? AND class_id = ? AND teacher_account_id = ?'
			)
			.run('center-own', 'class-owned', 'teacher-own');
		expect(api.getRegistryFacts({ actor: resolved.teacher! })).toBeNull();
		expect(resolveActorSpy).not.toHaveBeenCalled();
		expect(getAccountEmailSpy).not.toHaveBeenCalled();
	});

	it('does not expose Identity & Access or projection-owned fields in the provider surface', () => {
		const registryQuery = methodSlice('\n\tgetRegistryFacts(', '\n\tprovisionAccount(');
		const membershipsQuery = methodSlice('\n\tprivate getRegistryMemberships(', '\n\tprivate getRegistryParentLinks(');

		expect(registryQuery).toMatch(/getRegistryFacts\(request: \{ actor: ActorContext \| null \}/);
		expect(registryQuery).not.toMatch(/sessionToken/);
		expect(registryQuery).not.toMatch(/identityAccess|resolveActor|getAccountEmail/);
		expect(membershipsQuery).not.toMatch(/accounts|fullName|registeredAt|\brole\b/);
		expect(registryQuery).not.toMatch(/fullName|registeredAt|attendance|payment|sort|percentage/);
		expect(publicSource).not.toMatch(/getRegistryFacts\(request: \{ sessionToken/);
	});
});
