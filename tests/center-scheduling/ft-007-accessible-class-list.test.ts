import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import type { ActorContext } from '../../src/lib/server/modules/identity-access/public';

type AccessibleClass = {
	classId: string;
	centerId: string;
	name: string;
	mode: 'individual' | 'group';
};

type AccessibleClassListApi = {
	getAccessibleClassList(request: { actor: ActorContext | null }): AccessibleClass[] | null;
};

function accessibleClasses(root: CompositionRoot): AccessibleClassListApi {
	return root.centerScheduling as unknown as AccessibleClassListApi;
}

describe('FT-007 AC-002 C&S accessible class list', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Own Center'),
				('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('student-one', 'student'),
				('student-two', 'student'),
				('parent-one', 'parent'),
				('parent-other', 'parent'),
				('teacher-one', 'teacher');
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-own', 'parent-one'),
				('center-own', 'teacher-one'),
				('center-other', 'student-two'),
				('center-other', 'parent-other');
			INSERT INTO classes (id, center_id, name, mode) VALUES
				('class-zeta', 'center-own', 'Zeta', 'individual'),
				('class-alpha', 'center-own', 'Alpha', 'group'),
				('class-other', 'center-other', 'Other', 'group');
			INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
				('center-own', 'class-zeta', 'student-one'),
				('center-own', 'class-alpha', 'student-one'),
				('center-own', 'class-alpha', 'student-two'),
				('center-other', 'class-other', 'student-two');
			INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id) VALUES
				('center-own', 'parent-one', 'student-one'),
				('center-other', 'parent-other', 'student-two');
		`);
	});

	afterEach(() => root.database.close());

	it('enumerates only server-authorized Student/Parent classes with C&S facts and no mutation', () => {
		const api = accessibleClasses(root);
		const student = { accountId: 'student-one', role: 'student' } as const;
		const parent = { accountId: 'parent-one', role: 'parent' } as const;
		const before = {
			memberships: root.database.sqlite.prepare('SELECT * FROM center_memberships ORDER BY rowid').all(),
			classStudents: root.database.sqlite.prepare('SELECT * FROM class_students ORDER BY rowid').all(),
			parentLinks: root.database.sqlite.prepare('SELECT * FROM parent_student_links ORDER BY rowid').all()
		};

		expect(api.getAccessibleClassList({ actor: student })).toEqual([
			{ classId: 'class-alpha', centerId: 'center-own', name: 'Alpha', mode: 'group' },
			{ classId: 'class-zeta', centerId: 'center-own', name: 'Zeta', mode: 'individual' }
		]);
		expect(api.getAccessibleClassList({ actor: parent })).toEqual([
			{ classId: 'class-alpha', centerId: 'center-own', name: 'Alpha', mode: 'group' },
			{ classId: 'class-zeta', centerId: 'center-own', name: 'Zeta', mode: 'individual' }
		]);
		expect(api.getAccessibleClassList({ actor: null })).toBeNull();
		expect(api.getAccessibleClassList({ actor: { accountId: 'teacher-one', role: 'teacher' } })).toBeNull();
		expect(api.getAccessibleClassList({ actor: { accountId: 'parent-other', role: 'parent' } })).toEqual([
			{ classId: 'class-other', centerId: 'center-other', name: 'Other', mode: 'group' }
		]);
		expect(root.database.sqlite.prepare('SELECT * FROM center_memberships ORDER BY rowid').all()).toEqual(before.memberships);
		expect(root.database.sqlite.prepare('SELECT * FROM class_students ORDER BY rowid').all()).toEqual(before.classStudents);
		expect(root.database.sqlite.prepare('SELECT * FROM parent_student_links ORDER BY rowid').all()).toEqual(before.parentLinks);
	});
});
