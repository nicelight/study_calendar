import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import AdminCenterPage from '../../src/routes/admin/[centerId]/+page.svelte';
import {
	createAdminDashboardActions,
	createAdminDashboardPageLoad
} from '../../src/routes/admin/center-dashboard.server';
import { createAdminProvisioningTransport } from '../../src/routes/admin/provisioning.server';

function cookies(sessionToken?: string) {
	const values = new Map<string, string>();
	if (sessionToken) values.set('foundation_session', sessionToken);
	return {
		get: (name: string) => values.get(name),
		set: (name: string, value: string) => values.set(name, value),
		delete: (name: string) => values.delete(name),
		getAll: () => [...values].map(([name, value]) => ({ name, value })),
		serialize: () => ''
	};
}

function formRequest(url: string, fields: Array<[string, string]>): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(fields)
	});
}

function event(
	root: CompositionRoot,
	centerId = 'center-own',
	sessionToken?: string,
	fields: Array<[string, string]> = []
): RequestEvent {
	const url = `https://calendar.test/admin/${centerId}`;
	return {
		url: new URL(url),
		params: { centerId },
		request: fields.length > 0 ? formRequest(url, fields) : new Request(url),
		cookies: cookies(sessionToken),
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as unknown as RequestEvent;
}

async function thrown(action: () => unknown | Promise<unknown>): Promise<any> {
	try {
		await action();
		throw new Error('expected control-flow exception');
	} catch (cause) {
		return cause;
	}
}

describe('FT-002-AC-007 Admin center management surface', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES
				('center-own', 'Центр Альфа'),
				('center-other', 'Другой центр');
			INSERT INTO accounts (id, role) VALUES
				('admin-own', 'admin'),
				('admin-other', 'admin'),
				('teacher-own', 'teacher'),
				('teacher-spare', 'teacher'),
				('teacher-other', 'teacher'),
				('student-one', 'student'),
				('student-two', 'student');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-admin-own', 'admin-own', NULL),
				('session-admin-other', 'admin-other', NULL),
				('session-teacher-own', 'teacher-own', NULL),
				('session-teacher-spare', 'teacher-spare', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-own', 'admin-own'),
				('center-own', 'teacher-own'),
				('center-own', 'teacher-spare'),
				('center-own', 'student-one'),
				('center-own', 'student-two'),
				('center-other', 'admin-other'),
				('center-other', 'teacher-other');
		`);
	});

	afterEach(() => root.database.close());

	function actions() {
		return createAdminDashboardActions(
			root.centerScheduling,
			createAdminProvisioningTransport(root.centerScheduling)
		);
	}

	it('loads and SSR-renders only the authenticated own-center Admin surface', async () => {
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-existing',
			name: 'Английский A2',
			mode: 'group'
		});
		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-existing',
			teacherAccountId: 'teacher-own'
		});

		const load = createAdminDashboardPageLoad(root.centerScheduling);
		const data = load(event(root, 'center-own', 'session-admin-own'));
		expect(data).toMatchObject({
			centerId: 'center-own',
			name: 'Центр Альфа',
			classes: [
				expect.objectContaining({
					classId: 'class-existing',
					mode: 'group',
					teacherAccountIds: ['teacher-own']
				})
			]
		});
		const rendered = render(AdminCenterPage, { props: { data, form: null } } as any);
		expect(rendered.body).toContain('Центр Альфа');
		expect(rendered.body).toContain('Английский A2');
		expect(rendered.body).toContain('?/createClass');
		expect(rendered.body).toContain('?/inviteParticipant');
		expect(rendered.body).toContain('teacher-own');

		const unauthenticated = await thrown(() => load(event(root)));
		expect(unauthenticated).toMatchObject({ status: 303, location: '/login' });
		const nonAdmin = await thrown(() => load(event(root, 'center-own', 'session-teacher-own')));
		expect(nonAdmin).toMatchObject({ status: 403 });
		const crossCenter = await thrown(() => load(event(root, 'center-other', 'session-admin-own')));
		expect(crossCenter).toMatchObject({ status: 403 });
	});

	it('runs class CRUD with exact modes and preserves data on invalid or cross-center actions', async () => {
		const api = actions();
		const created = await api.createClass(
			event(root, 'center-own', 'session-admin-own', [
				['name', '  Индивидуальный курс  '],
				['mode', 'individual'],
				['centerId', 'center-other'],
				['role', 'admin']
			])
		);
		expect(created).toMatchObject({ ok: true, message: 'class_created' });
		const createdClass = root.database.sqlite
			.prepare('SELECT id, center_id, name, mode FROM classes')
			.get() as { id: string; center_id: string; name: string; mode: string };
		expect(createdClass).toMatchObject({
			center_id: 'center-own',
			name: 'Индивидуальный курс',
			mode: 'individual'
		});

		const invalidMode = await api.updateClass(
			event(root, 'center-own', 'session-admin-own', [
				['classId', createdClass.id],
				['name', 'Подмена'],
				['mode', 'hybrid']
			])
		);
		expect(invalidMode).toMatchObject({ status: 400, data: { error: 'invalid_mode' } });
		expect(root.database.sqlite.prepare('SELECT name, mode FROM classes WHERE id = ?').get(createdClass.id))
			.toEqual({ name: 'Индивидуальный курс', mode: 'individual' });

		const crossCenter = await api.updateClass(
			event(root, 'center-other', 'session-admin-own', [
				['classId', createdClass.id],
				['name', 'Cross center'],
				['mode', 'group']
			])
		);
		expect(crossCenter).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		const nonAdmin = await api.deleteClass(
			event(root, 'center-own', 'session-teacher-own', [['classId', createdClass.id]])
		);
		expect(nonAdmin).toMatchObject({ status: 403, data: { error: 'forbidden' } });

		const updated = await api.updateClass(
			event(root, 'center-own', 'session-admin-own', [
				['classId', createdClass.id],
				['name', 'Группа A'],
				['mode', 'group']
			])
		);
		expect(updated).toMatchObject({ ok: true, message: 'class_updated' });
		const deleted = await api.deleteClass(
			event(root, 'center-own', 'session-admin-own', [['classId', createdClass.id]])
		);
		expect(deleted).toMatchObject({ ok: true, message: 'class_deleted' });
		expect(root.database.sqlite.prepare('SELECT 1 FROM classes WHERE id = ?').get(createdClass.id))
			.toBeUndefined();
	});

	it('enforces individual capacity and manages teacher assignment/removal through the owner boundary', async () => {
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-group',
			name: 'Группа',
			mode: 'group'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-one'
		});
		root.centerScheduling.addStudentToClass({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			studentAccountId: 'student-two'
		});

		const api = actions();
		const capacityDenied = await api.updateClass(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-group'],
				['name', 'Группа'],
				['mode', 'individual']
			])
		);
		expect(capacityDenied).toMatchObject({ status: 409, data: { error: 'conflict' } });
		expect(root.database.sqlite.prepare('SELECT mode FROM classes WHERE id = ?').get('class-group'))
			.toEqual({ mode: 'group' });

		const invalidTeacher = await api.assignTeacher(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-group'],
				['teacherAccountId', 'teacher-other']
			])
		);
		expect(invalidTeacher).toMatchObject({ status: 400, data: { error: 'invalid_teacher' } });

		const assigned = await api.assignTeacher(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-group'],
				['teacherAccountId', 'teacher-own']
			])
		);
		expect(assigned).toMatchObject({ ok: true, message: 'teacher_assigned' });
		expect(root.centerScheduling.getAuthorizedClassScope('session-teacher-own', 'class-group'))
			.toMatchObject({ classId: 'class-group', role: 'teacher' });

		const removed = await api.removeTeacher(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-group'],
				['teacherAccountId', 'teacher-own']
			])
		);
		expect(removed).toMatchObject({ ok: true, message: 'teacher_removed' });
		expect(root.centerScheduling.getAuthorizedClassScope('session-teacher-own', 'class-group')).toBeNull();

		root.centerScheduling.assignTeacher({
			sessionToken: 'session-admin-own',
			classId: 'class-group',
			teacherAccountId: 'teacher-spare'
		});
		const membershipRemoved = await api.removeTeacherMembership(
			event(root, 'center-own', 'session-admin-own', [
				['teacherAccountId', 'teacher-spare']
			])
		);
		expect(membershipRemoved).toMatchObject({ ok: true, message: 'teacher_membership_removed' });
		expect(root.database.sqlite.prepare(
			'SELECT 1 FROM center_memberships WHERE center_id = ? AND account_id = ?'
		).get('center-own', 'teacher-spare')).toBeUndefined();
		expect(root.centerScheduling.getAuthorizedClassScope('session-teacher-spare', 'class-group')).toBeNull();
	});

	it('creates recurring lessons and a teacher invitation without trusting client authority fields', async () => {
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-schedule',
			name: 'Расписание',
			mode: 'group'
		});
		const api = actions();
		const scheduled = await api.createSchedule(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-schedule'],
				['startDate', '2026-08-03'],
				['endDate', '2026-08-12'],
				['weekdays', '1'],
				['weekdays', '3'],
				['centerId', 'center-other']
			])
		);
		expect(scheduled).toMatchObject({ ok: true, message: 'schedule_created' });
		expect(root.database.sqlite.prepare(
			'SELECT lesson_date FROM lessons WHERE class_id = ? ORDER BY lesson_date'
		).all('class-schedule')).toEqual([
			{ lesson_date: '2026-08-03' },
			{ lesson_date: '2026-08-05' },
			{ lesson_date: '2026-08-10' },
			{ lesson_date: '2026-08-12' }
		]);

		const invitation = await api.inviteParticipant(
			event(root, 'center-own', 'session-admin-own', [
				['role', 'teacher'],
				['centerId', 'center-other'],
				['accountId', 'forged']
			])
		);
		expect(invitation).toMatchObject({
			ok: true,
			message: 'invitation_created',
			status: 'pending'
		});
		expect(root.database.sqlite.prepare(`
			SELECT accounts.role, center_memberships.center_id
			FROM invitations
			JOIN accounts ON accounts.id = invitations.account_id
			JOIN center_memberships ON center_memberships.account_id = accounts.id
			WHERE invitations.status = 'pending'
		`).get()).toEqual({ role: 'teacher', center_id: 'center-own' });
	});

	it('rejects a valid zero-occurrence Admin schedule before persistence', async () => {
		root.centerScheduling.createClass({
			sessionToken: 'session-admin-own',
			centerId: 'center-own',
			classId: 'class-zero',
			name: 'Пустое расписание',
			mode: 'group'
		});
		const before = {
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		};
		const result = await actions().createSchedule(
			event(root, 'center-own', 'session-admin-own', [
				['classId', 'class-zero'],
				['startDate', '2026-08-03'],
				['endDate', '2026-08-03'],
				['weekdays', '2']
			])
		);
		expect(result).toMatchObject({ status: 400, data: { error: 'invalid_schedule' } });
		expect({
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		}).toEqual(before);
	});
});
