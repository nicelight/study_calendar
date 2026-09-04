import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import type { RequestEvent } from '@sveltejs/kit';
import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import AdminCenterPage from '../../src/routes/admin/[centerId]/+page.svelte';
import {
	createAdminDashboardActions,
	createAdminDashboardPageLoad
} from '../../src/routes/admin/center-dashboard.server';

function requestEvent(
	root: CompositionRoot,
	centerId: string,
	sessionToken: string | undefined,
	fields: Array<[string, string]> = []
): RequestEvent {
	const url = `https://calendar.test/admin/${centerId}`;
	const values = new Map<string, string>();
	if (sessionToken) values.set('foundation_session', sessionToken);
	return {
		url: new URL(url),
		params: { centerId },
		request: new Request(url, {
			method: fields.length ? 'POST' : 'GET',
			headers: fields.length ? { 'content-type': 'application/x-www-form-urlencoded' } : undefined,
			body: fields.length ? new URLSearchParams(fields) : undefined
		}),
		cookies: {
			get: (name: string) => values.get(name),
			set: (name: string, value: string) => values.set(name, value),
			delete: (name: string) => values.delete(name),
			getAll: () => [...values].map(([name, value]) => ({ name, value })),
			serialize: () => ''
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as unknown as RequestEvent;
}

describe('TASK-104 independent Admin lesson probe', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createCompositionRoot({ databaseFilename: ':memory:' });
		root.database.sqlite.exec(`
			INSERT INTO centers (id, name) VALUES ('center-verify', 'Verify Center');
			INSERT INTO accounts (id, role) VALUES
				('admin-verify', 'admin'), ('teacher-verify', 'teacher');
			INSERT INTO sessions (token, account_id, revoked_at) VALUES
				('session-verify-admin', 'admin-verify', NULL),
				('session-verify-teacher', 'teacher-verify', NULL);
			INSERT INTO center_memberships (center_id, account_id) VALUES
				('center-verify', 'admin-verify'), ('center-verify', 'teacher-verify');
		`);
		root.centerScheduling.createClass({
			sessionToken: 'session-verify-admin',
			centerId: 'center-verify',
			classId: 'class-verify',
			name: 'Verify class',
			mode: 'group'
		});
		root.centerScheduling.createClass({
			sessionToken: 'session-verify-admin',
			centerId: 'center-verify',
			classId: 'class-other-verify',
			name: 'Other class',
			mode: 'group'
		});
		root.database.sqlite.exec(`
			INSERT INTO schedules (id, center_id, class_id, start_date, end_date, weekdays, created_by_account_id, created_at)
			VALUES
				('schedule-verify', 'center-verify', 'class-verify', '2026-10-01', '2026-10-31', '[1]', 'admin-verify', '2026-10-01T00:00:00.000Z'),
				('schedule-other-verify', 'center-verify', 'class-other-verify', '2026-10-01', '2026-10-31', '[1]', 'admin-verify', '2026-10-01T00:00:00.000Z');
			INSERT INTO lessons (id, center_id, class_id, schedule_id, lesson_date, status, created_by_account_id, created_at)
			VALUES
				('lesson-verify-a', 'center-verify', 'class-verify', 'schedule-verify', '2026-10-05', 'planned', 'admin-verify', '2026-10-01T00:00:00.000Z'),
				('lesson-verify-b', 'center-verify', 'class-verify', 'schedule-verify', '2026-10-06', 'planned', 'admin-verify', '2026-10-01T00:00:00.000Z'),
				('lesson-other-verify', 'center-verify', 'class-other-verify', 'schedule-other-verify', '2026-10-05', 'planned', 'admin-verify', '2026-10-01T00:00:00.000Z');
		`);
	});

	afterEach(() => root.database.close());

	it('proves the rendered projection, server identity, selector binding, transfer, and completed-cancel immutability', async () => {
		const load = createAdminDashboardPageLoad(root.centerScheduling);
		const before = load(requestEvent(root, 'center-verify', 'session-verify-admin'));
		const classView = before.classes.find((entry) => entry.classId === 'class-verify');
		expect(classView?.lessons.map((lesson) => lesson.lessonId)).toEqual([
			'lesson-verify-a',
			'lesson-verify-b'
		]);
		const html = render(AdminCenterPage, { props: { data: before, form: null } } as any).body;
		expect(html).toContain('Добавить урок');
		expect(html).toContain('?/addLesson');
		expect(html).toContain('?/transferLesson');
		expect(html).toContain('?/cancelLesson');

		const api = createAdminDashboardActions(root.centerScheduling, {} as any);
		const added = await api.addLesson(
			requestEvent(root, 'center-verify', 'session-verify-admin', [
				['classId', 'class-verify'],
				['scheduleId', 'schedule-verify'],
				['lessonId', 'browser-chosen-id'],
				['lessonDate', '2026-10-07']
			])
		);
		expect(added).toMatchObject({ ok: true, message: 'lesson_added' });
		const addedRow = root.database.sqlite
			.prepare('SELECT id, class_id, schedule_id, lesson_date, status FROM lessons WHERE lesson_date = ?')
			.get('2026-10-07') as Record<string, string>;
		expect(addedRow).toMatchObject({
			class_id: 'class-verify', schedule_id: 'schedule-verify', lesson_date: '2026-10-07', status: 'planned'
		});
		expect(addedRow.id).not.toBe('browser-chosen-id');

		const siblingBefore = root.database.sqlite
			.prepare('SELECT id, lesson_date, status FROM lessons WHERE id = ?')
			.get('lesson-verify-b');
		const transferred = await api.transferLesson(
			requestEvent(root, 'center-verify', 'session-verify-admin', [
				['classId', 'class-verify'],
				['lessonId', 'lesson-verify-a'],
				['lessonDate', '2026-10-08']
			])
		);
		expect(transferred).toMatchObject({ ok: true, message: 'lesson_transferred' });
		expect(root.database.sqlite.prepare('SELECT id, lesson_date FROM lessons WHERE id = ?').get('lesson-verify-a'))
			.toEqual({ id: 'lesson-verify-a', lesson_date: '2026-10-08' });
		expect(root.database.sqlite.prepare('SELECT id, lesson_date, status FROM lessons WHERE id = ?').get('lesson-verify-b'))
			.toEqual(siblingBefore);

		const selectorStateBefore = {
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		};
		const forgedSelector = await api.addLesson(
			requestEvent(root, 'center-verify', 'session-verify-admin', [
				['classId', 'class-verify'],
				['scheduleId', 'schedule-other-verify'],
				['lessonDate', '2026-10-09']
			])
		);
		expect(forgedSelector).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect({
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		}).toEqual(selectorStateBefore);

		root.database.sqlite.prepare("UPDATE lessons SET status = 'completed' WHERE id = ?")
			.run('lesson-verify-b');
		const completedStateBefore = {
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		};
		const completedCancel = await api.cancelLesson(
			requestEvent(root, 'center-verify', 'session-verify-admin', [
				['classId', 'class-verify'],
				['lessonId', 'lesson-verify-b']
			])
		);
		expect(completedCancel).toMatchObject({ status: 500, data: { error: 'operation_failed' } });
		expect({
			schedules: root.database.sqlite.prepare('SELECT * FROM schedules ORDER BY id').all(),
			lessons: root.database.sqlite.prepare('SELECT * FROM lessons ORDER BY id').all()
		}).toEqual(completedStateBefore);

		const nonAdminCancel = await api.cancelLesson(
			requestEvent(root, 'center-verify', 'session-verify-teacher', [
				['classId', 'class-verify'], ['lessonId', 'lesson-verify-a']
			])
		);
		expect(nonAdminCancel).toMatchObject({ status: 403, data: { error: 'forbidden' } });
	});
});
