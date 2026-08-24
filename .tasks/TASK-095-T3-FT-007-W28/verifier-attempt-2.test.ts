import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CenterSchedulingBoundary } from '../../src/lib/server/modules/center-scheduling/public';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

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

function actor(accountId: string, role: ActorContext['role']): ActorContext {
	return { accountId, role };
}

describe('TASK-095 fresh verifier probe — corrected C&S provider boundary', () => {
	let root: CompositionRoot;
	let provider: CenterSchedulingBoundary;
	let resolveActor: ReturnType<typeof vi.fn>;
	let getAccountEmail: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		resolveActor = vi.fn(() => {
			throw new Error('Identity & Access actor resolution is forbidden in this provider query');
		});
		getAccountEmail = vi.fn(() => {
			throw new Error('Identity & Access profile lookup is forbidden in this provider query');
		});
		provider = new CenterSchedulingBoundary(root.database, {
			resolveActor,
			getAccountEmail,
			provisionAccount: () => undefined,
			provisionPasswordAccount: () => undefined
		});

		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('v-center', 'Verifier Center'), ('x-center', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('v-admin', 'admin'), ('x-admin', 'admin'), ('v-teacher', 'teacher'),
				('v-unassigned', 'teacher'), ('v-student', 'student'), ('v-parent', 'parent');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('v-center', 'v-admin'), ('v-center', 'v-teacher'), ('v-center', 'v-unassigned'),
				('v-center', 'v-student'), ('v-center', 'v-parent'), ('x-center', 'x-admin');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('v-class', 'v-center', 'Verifier Class', 'group'),
				('v-empty-class', 'v-center', 'Empty Class', 'individual'),
				('x-class', 'x-center', 'Other Class', 'group');
			INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
				VALUES ('v-center', 'v-class', 'v-teacher');
			INSERT INTO class_students (center_id, class_id, student_account_id)
				VALUES ('v-center', 'v-class', 'v-student');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
				VALUES ('v-center', 'v-parent', 'v-student');
		`);
	});

	afterEach(() => root.database.close());

	it('proves actor boundary, exact C&S facts, role/scope denials, and non-mutation', () => {
		const snapshot = () => ({
			centers: root.database.sqlite.prepare('SELECT * FROM centers ORDER BY id').all(),
			accounts: root.database.sqlite.prepare('SELECT * FROM accounts ORDER BY id').all(),
			centerMemberships: root.database.sqlite
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
				.all(),
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		});
		const before = snapshot();
		const adminFacts = provider.getRegistryFacts({ actor: actor('v-admin', 'admin') }) as RegistryFacts;

		expect(Object.keys(adminFacts).sort()).toEqual([
			'accountIds',
			'assignments',
			'centerId',
			'classes',
			'institution',
			'memberships',
			'parentLinks'
		]);
		expect(adminFacts).toEqual({
			centerId: 'v-center',
			institution: { centerId: 'v-center', name: 'Verifier Center' },
			accountIds: ['v-admin', 'v-parent', 'v-student', 'v-teacher', 'v-unassigned'],
			memberships: [
				{ centerId: 'v-center', accountId: 'v-admin' },
				{ centerId: 'v-center', accountId: 'v-parent' },
				{ centerId: 'v-center', accountId: 'v-student' },
				{ centerId: 'v-center', accountId: 'v-teacher' },
				{ centerId: 'v-center', accountId: 'v-unassigned' }
			],
			parentLinks: [
				{ centerId: 'v-center', parentAccountId: 'v-parent', studentAccountId: 'v-student' }
			],
			assignments: [
				{ centerId: 'v-center', classId: 'v-class', teacherAccountId: 'v-teacher' }
			],
			classes: [
				{
					classId: 'v-empty-class',
					centerId: 'v-center',
					name: 'Empty Class',
					mode: 'individual',
					studentAccountIds: [],
					teacherAccountIds: [],
					studentCount: 0
				},
				{
					classId: 'v-class',
					centerId: 'v-center',
					name: 'Verifier Class',
					mode: 'group',
					studentAccountIds: ['v-student'],
					teacherAccountIds: ['v-teacher'],
					studentCount: 1
				}
			]
		});
		expect(Object.keys(adminFacts.memberships[0]).sort()).toEqual(['accountId', 'centerId']);
		expect(Object.keys(adminFacts.classes[0]).sort()).toEqual([
			'centerId',
			'classId',
			'mode',
			'name',
			'studentAccountIds',
			'studentCount',
			'teacherAccountIds'
		]);

		const teacherFacts = provider.getRegistryFacts({ actor: actor('v-teacher', 'teacher') }) as RegistryFacts;
		expect(teacherFacts.centerId).toBe('v-center');
		expect(teacherFacts.classes.map(({ classId }) => classId)).toEqual(['v-class']);
		expect(teacherFacts.accountIds).toEqual(['v-parent', 'v-student', 'v-teacher']);
		expect(teacherFacts.memberships).toEqual([
			{ centerId: 'v-center', accountId: 'v-parent' },
			{ centerId: 'v-center', accountId: 'v-student' },
			{ centerId: 'v-center', accountId: 'v-teacher' }
		]);
		expect(provider.getRegistryFacts({ actor: actor('v-student', 'student') })).toBeNull();
		expect(provider.getRegistryFacts({ actor: actor('v-parent', 'parent') })).toBeNull();
		expect(provider.getRegistryFacts({ actor: actor('v-unassigned', 'teacher') })).toBeNull();
		expect(provider.getRegistryFacts({ actor: actor('x-admin', 'admin') })).toMatchObject({
		centerId: 'x-center',
		classes: [{ classId: 'x-class', centerId: 'x-center' }]
	});
		expect(provider.getRegistryFacts({ actor: null })).toBeNull();
		expect(snapshot()).toEqual(before);

		root.database.sqlite
			.prepare('DELETE FROM teacher_assignments WHERE class_id = ? AND teacher_account_id = ?')
			.run('v-class', 'v-teacher');
		const afterRemoval = snapshot();
		expect(provider.getRegistryFacts({ actor: actor('v-teacher', 'teacher') })).toBeNull();
		expect(snapshot()).toEqual(afterRemoval);
		expect(resolveActor).not.toHaveBeenCalled();
		expect(getAccountEmail).not.toHaveBeenCalled();
	});
});
