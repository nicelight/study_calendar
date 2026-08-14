import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	createCompositionRoot,
	type CompositionRoot
} from '../../src/lib/server/composition-root';
import { createAdminDashboardActions } from '../../src/routes/admin/center-dashboard.server';

function event(
	root: CompositionRoot,
	centerId: string,
	sessionToken: string | undefined,
	fields: Array<[string, string]>
): RequestEvent {
	const url = `https://calendar.test/admin/${centerId}`;
	const values = new Map<string, string>();
	if (sessionToken) values.set('foundation_session', sessionToken);
	return {
		url: new URL(url),
		params: { centerId },
		request: new Request(url, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(fields)
		}),
		cookies: {
			get: (name: string) => values.get(name),
			set: () => undefined,
			delete: () => undefined,
			getAll: () => [],
			serialize: () => ''
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as unknown as RequestEvent;
}

describe('TASK-026 independent Admin boundary probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('own', 'Own'), ('other', 'Other');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'), ('admin-other', 'admin'),
				('teacher', 'teacher'), ('student-a', 'student'), ('student-b', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('s-admin-own', 'admin-own', NULL), ('s-admin-other', 'admin-other', NULL),
				('s-teacher', 'teacher', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('own', 'admin-own'), ('own', 'teacher'),
				('own', 'student-a'), ('own', 'student-b'), ('other', 'admin-other');
		`);
	});

	afterEach(() => root.database.close());

	it('derives center and role from server state for Admin form actions', async () => {
		const actions = createAdminDashboardActions(root.centerScheduling, {
			provision: () => {
				throw new Error('not-used');
			}
		});
		const result = await actions.createClass(
			event(root, 'own', 's-admin-own', [
				['name', '  Group A  '],
				['mode', 'group'],
				['centerId', 'other'],
				['role', 'admin']
			])
		);
		expect(result).toMatchObject({ ok: true, message: 'class_created' });
		expect(root.database.sqlite.prepare('SELECT center_id, name, mode FROM classes').get())
			.toEqual({ center_id: 'own', name: 'Group A', mode: 'group' });

		const before = root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM classes').get();
		const forged = await actions.createClass(
			event(root, 'other', 's-admin-own', [['name', 'Forged'], ['mode', 'group']])
		);
		expect(forged).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM classes').get())
			.toEqual(before);
	});

	it('enforces individual capacity and revokes assigned-teacher schedule authority immediately', () => {
		root.centerScheduling.createClass({
			sessionToken: 's-admin-own',
			centerId: 'own',
			classId: 'individual',
			name: 'One student',
			mode: 'individual'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 's-admin-own',
			classId: 'individual',
			studentAccountId: 'student-a'
		});
		expect(() => root.centerScheduling.addStudentToClass({
			sessionToken: 's-admin-own',
			classId: 'individual',
			studentAccountId: 'student-b'
		})).toThrow('individual-class-capacity-exceeded');

		root.centerScheduling.assignTeacher({
			sessionToken: 's-admin-own',
			classId: 'individual',
			teacherAccountId: 'teacher'
		});
		expect(root.centerScheduling.createRecurringSchedule({
			sessionToken: 's-teacher',
			classId: 'individual',
			scheduleId: 'teacher-schedule',
			startDate: '2026-08-10',
			endDate: '2026-08-12',
			weekdays: [1, 3]
		})).toHaveLength(2);

		root.centerScheduling.removeCenterParticipant({
			sessionToken: 's-admin-own',
			centerId: 'own',
			accountId: 'teacher'
		});
		expect(root.centerScheduling.getAuthorizedClassScope('s-teacher', 'individual')).toBeNull();
		expect(() => root.centerScheduling.createRecurringSchedule({
			sessionToken: 's-teacher',
			classId: 'individual',
			scheduleId: 'forged-schedule',
			startDate: '2026-08-17',
			endDate: '2026-08-17',
			weekdays: [1]
		})).toThrow('not-authorized');
		expect(root.database.sqlite.prepare(
			'SELECT 1 FROM teacher_assignments WHERE teacher_account_id = ?'
		).get('teacher')).toBeUndefined();
	});

	it('keeps route adapters persistence-free and owner-boundary authorization intact', () => {
		for (const file of [
			'src/routes/admin/center-dashboard.server.ts',
			'src/routes/admin/[centerId]/+page.server.ts'
		]) {
			const source = readFileSync(file, 'utf8');
			expect(source).not.toMatch(/\.sqlite|\.prepare\(|INSERT INTO|UPDATE classes|DELETE FROM/);
		}
		expect(() => root.centerScheduling.createClass({
			sessionToken: 's-admin-other',
			centerId: 'own',
			classId: 'cross-center',
			name: 'Cross center',
			mode: 'group'
		})).toThrow('not-authorized');
		expect(() => root.centerScheduling.assignTeacher({
			sessionToken: 's-admin-other',
			classId: 'missing',
			teacherAccountId: 'teacher'
		})).toThrow('not-authorized');
	});
});
