import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';

describe('center membership and class modes', () => {
	let root: CompositionRoot;
	let participantSessions: Map<string, string>;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		participantSessions = new Map();
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Own Center'),
				('center-other', 'Other Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('admin-other', 'admin'),
				('outsider', 'teacher');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-admin-other', 'admin-other', NULL),
				('session-outsider', 'outsider', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-other', 'admin-other');
		`);
	});

	afterEach(() => root.database.close());

	function createParticipant(input: {
		centerId?: string;
		accountId: string;
		role: 'teacher' | 'student' | 'parent';
		sessionToken?: string;
	}): void {
		root.centerScheduling.createParticipant({
			sessionToken: input.sessionToken ?? 'session-admin-own',
			centerId: input.centerId ?? 'center-own',
			accountId: input.accountId,
			role: input.role,
			invitationToken: `invite-${input.accountId}`
		});
		const providerSubject = `fixture-${input.accountId}`;
		root.database.sqlite
			.prepare('INSERT INTO external_identities (provider, subject, account_id) VALUES (?, ?, ?)')
			.run('google', providerSubject, input.accountId);
		participantSessions.set(
			input.accountId,
			root.identityAccess.authenticateVerifiedIdentity({ provider: 'google', subject: providerSubject })
		);
	}

	function sessionFor(accountId: string): string {
		const sessionToken = participantSessions.get(accountId);
		if (!sessionToken) {
			throw new Error(`missing-fixture-session:${accountId}`);
		}
		return sessionToken;
	}

	it('FT-002-AC-001 lets only an own-center Admin manage bounded participants, links, and exact class modes', () => {
		expect(typeof root.centerScheduling.createParticipant).toBe('function');
		expect(typeof root.centerScheduling.createClass).toBe('function');

		createParticipant({ accountId: 'teacher-own', role: 'teacher' });
		createParticipant({ accountId: 'student-own', role: 'student' });
		createParticipant({ accountId: 'parent-own', role: 'parent' });
		createParticipant({
			centerId: 'center-other',
			accountId: 'teacher-other',
			role: 'teacher',
			sessionToken: 'session-admin-other'
		});

		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-individual',
			name: 'Individual Class',
			mode: 'individual'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-group',
			name: 'Group Class',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			teacherAccountId: 'teacher-own'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-own'
		});
		root.centerScheduling.linkParentToStudent({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			parentAccountId: 'parent-own',
			studentAccountId: 'student-own'
		});

		expect(
			root.database.sqlite.prepare('SELECT id, center_id, mode FROM classes ORDER BY id').all()
		).toEqual([
			{ id: 'class-group', center_id: 'center-own', mode: 'group' },
			{ id: 'class-individual', center_id: 'center-own', mode: 'individual' }
		]);
		expect(root.database.sqlite.prepare('SELECT * FROM teacher_assignments').all()).toEqual([
			{
				center_id: 'center-own',
				class_id: 'class-group',
				teacher_account_id: 'teacher-own'
			}
		]);
		expect(root.database.sqlite.prepare('SELECT * FROM class_students').all()).toEqual([
			{
				center_id: 'center-own',
				class_id: 'class-group',
				student_account_id: 'student-own'
			}
		]);
		expect(root.database.sqlite.prepare('SELECT * FROM parent_student_links').all()).toEqual([
			{
				center_id: 'center-own',
				parent_account_id: 'parent-own',
				student_account_id: 'student-own'
			}
		]);

		const beforeDenied = root.database.sqlite
			.prepare(`
				SELECT
					(SELECT COUNT(*) FROM accounts) AS accounts,
					(SELECT COUNT(*) FROM center_memberships) AS memberships,
					(SELECT COUNT(*) FROM classes) AS classes,
					(SELECT COUNT(*) FROM teacher_assignments) AS assignments,
					(SELECT COUNT(*) FROM class_students) AS students,
					(SELECT COUNT(*) FROM parent_student_links) AS parent_links
			`)
			.get();

		expect(() =>
			root.centerScheduling.createParticipant({
				sessionToken: sessionFor('teacher-own'),
				centerId: 'center-own',
				accountId: 'student-by-teacher',
				role: 'student',
				invitationToken: 'invite-student-by-teacher'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.centerScheduling.createParticipant({
				sessionToken: 'session-admin-own',
				centerId: 'center-other',
				accountId: 'student-cross-center',
				role: 'student',
				invitationToken: 'invite-student-cross-center'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.centerScheduling.createClass({
				sessionToken: sessionFor('teacher-own'),
				centerId: 'center-own',
				classId: 'class-by-teacher',
				name: 'Denied',
				mode: 'group'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.centerScheduling.createClass({
				sessionToken: 'session-admin-other',
				centerId: 'center-own',
				classId: 'class-cross-center',
				name: 'Denied',
				mode: 'group'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.centerScheduling.assignTeacher({
				sessionToken: 'session-admin-own',
				classId: 'class-group',
				teacherAccountId: 'teacher-other'
			})
		).toThrow('not-authorized');
		expect(() =>
			root.centerScheduling.createClass({
				sessionToken: 'session-admin-own',
				centerId: 'center-own',
				classId: 'class-invalid',
				name: 'Invalid',
				mode: 'hybrid' as 'individual'
			})
		).toThrow('invalid-class-mode');

		expect(
			root.database.sqlite
				.prepare(`
					SELECT
						(SELECT COUNT(*) FROM accounts) AS accounts,
						(SELECT COUNT(*) FROM center_memberships) AS memberships,
						(SELECT COUNT(*) FROM classes) AS classes,
						(SELECT COUNT(*) FROM teacher_assignments) AS assignments,
						(SELECT COUNT(*) FROM class_students) AS students,
						(SELECT COUNT(*) FROM parent_student_links) AS parent_links
				`)
				.get()
		).toEqual(beforeDenied);

		root.centerScheduling.updateClass({
			sessionToken: 'session-admin-own',
			classId: 'class-individual',
			name: 'Renamed Individual',
			mode: 'group'
		});
		expect(
			root.database.sqlite
				.prepare('SELECT name, mode FROM classes WHERE id = ?')
				.get('class-individual')
		).toEqual({ name: 'Renamed Individual', mode: 'group' });

		root.centerScheduling.unlinkParentFromStudent({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			parentAccountId: 'parent-own',
			studentAccountId: 'student-own'
		});
		root.centerScheduling.removeStudentFromClass({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-own'
		});
		root.centerScheduling.removeTeacherAssignment({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			teacherAccountId: 'teacher-own'
		});
		root.centerScheduling.deleteClass({
			sessionToken: 'session-admin-own',
			classId: 'class-individual'
		});
		root.centerScheduling.removeCenterParticipant({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			accountId: 'parent-own'
		});

		expect(
			root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM parent_student_links').get()
		).toEqual({ count: 0 });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM class_students').get()).toEqual({
			count: 0
		});
		expect(
			root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM teacher_assignments').get()
		).toEqual({ count: 0 });
		expect(root.database.sqlite.prepare('SELECT 1 FROM classes WHERE id = ?').get('class-individual')).toBeUndefined();
		expect(
			root.database.sqlite
				.prepare('SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?')
				.get('center-own', 'parent-own')
		).toBeUndefined();
		expect(root.database.sqlite.prepare('SELECT role FROM accounts WHERE id = ?').get('parent-own')).toEqual({
			role: 'parent'
		});
	});

	it('FT-002-AC-002 returns only permitted member-scoped authorization for individual and group classes', () => {
		expect(typeof root.centerScheduling.getAuthorizedClassScope).toBe('function');

		createParticipant({ accountId: 'teacher-own', role: 'teacher' });
		createParticipant({ accountId: 'teacher-unassigned', role: 'teacher' });
		createParticipant({ accountId: 'student-one', role: 'student' });
		createParticipant({ accountId: 'student-two', role: 'student' });
		createParticipant({ accountId: 'parent-one', role: 'parent' });

		for (const [classId, name, mode] of [
			['class-individual', 'Individual', 'individual'],
			['class-group', 'Group', 'group']
		] as const) {
			root.centerScheduling.createClass({
				sessionToken: 'session-admin-own',
				centerId: 'center-own',
				classId,
				name,
				mode
			});
			root.centerScheduling.assignTeacher({
				sessionToken: 'session-admin-own',
				classId,
				teacherAccountId: 'teacher-own'
			});
			root.centerScheduling.addStudentToClass({
				sessionToken: 'session-admin-own',
				classId,
				studentAccountId: 'student-one'
			});
		}
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-two'
		});
		expect(() =>
			root.centerScheduling.addStudentToClass({
				sessionToken: 'session-admin-own',
				classId: 'class-individual',
				studentAccountId: 'student-two'
			})
		).toThrow('individual-class-capacity-exceeded');
		expect(() =>
			root.centerScheduling.updateClass({
				sessionToken: 'session-admin-own',
				classId: 'class-group',
				name: 'Group',
				mode: 'individual'
			})
		).toThrow('individual-class-capacity-exceeded');
		root.centerScheduling.linkParentToStudent({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			parentAccountId: 'parent-one',
			studentAccountId: 'student-one'
		});

		expect(
			root.centerScheduling.getAuthorizedClassScope('session-admin-own', 'class-group')
		).toMatchObject({
			centerId: 'center-own',
			classId: 'class-group',
			mode: 'group',
			accountId: 'admin-own',
			role: 'admin',
				studentAccountIds: ['student-one', 'student-two']
			});
		expect(
			root.centerScheduling.getAuthorizedClassScope('session-admin-own', 'class-individual')
		).toMatchObject({
			mode: 'individual',
			studentAccountIds: ['student-one']
		});
		expect(
			root.centerScheduling.getAuthorizedClassScope(sessionFor('teacher-own'), 'class-individual')
		).toMatchObject({
			mode: 'individual',
			accountId: 'teacher-own',
			role: 'teacher',
			studentAccountIds: ['student-one']
		});
		expect(
			root.centerScheduling.getAuthorizedClassScope(sessionFor('student-one'), 'class-group')
		).toMatchObject({
			accountId: 'student-one',
			role: 'student',
			studentAccountIds: ['student-one']
		});
		expect(
			root.centerScheduling.getAuthorizedClassScope(sessionFor('parent-one'), 'class-group')
		).toMatchObject({
			accountId: 'parent-one',
			role: 'parent',
			studentAccountIds: ['student-one']
		});

		expect(
			root.centerScheduling.getAuthorizedClassScope(sessionFor('student-two'), 'class-individual')
		).toBeNull();
		expect(
			root.centerScheduling.getAuthorizedClassScope(sessionFor('teacher-unassigned'), 'class-group')
		).toBeNull();
		expect(
			root.centerScheduling.getAuthorizedClassScope('session-admin-other', 'class-group')
		).toBeNull();
		expect(root.centerScheduling.getAuthorizedClassScope('session-outsider', 'class-group')).toBeNull();
		expect(root.centerScheduling.getAuthorizedClassScope(undefined, 'class-group')).toBeNull();
	});
});
