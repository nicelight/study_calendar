import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import CalendarPage from '../../src/routes/calendar/+page.svelte';
import { load, type CalendarPageData } from '../../src/routes/calendar/+page.server';

function requestEvent(root: CompositionRoot, sessionToken: string, date = '2026-09-01') {
	const url = new URL(`https://calendar.test/calendar?classId=class-markers&date=${date}`);
	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as Parameters<typeof load>[0];
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-calendar-markers', 'Calendar Markers Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-calendar-markers', 'admin'),
			('teacher-calendar-markers', 'teacher'),
			('student-calendar-markers', 'student'),
			('parent-calendar-markers', 'parent');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-admin-calendar-markers', 'admin-calendar-markers', NULL),
			('session-teacher-calendar-markers', 'teacher-calendar-markers', NULL),
			('session-student-calendar-markers', 'student-calendar-markers', NULL),
			('session-parent-calendar-markers', 'parent-calendar-markers', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-calendar-markers', 'admin-calendar-markers'),
			('center-calendar-markers', 'teacher-calendar-markers'),
			('center-calendar-markers', 'student-calendar-markers'),
			('center-calendar-markers', 'parent-calendar-markers');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-markers', 'center-calendar-markers', 'Calendar Marker Class', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-calendar-markers', 'class-markers', 'student-calendar-markers');
		INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
			VALUES ('center-calendar-markers', 'parent-calendar-markers', 'student-calendar-markers');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-calendar-markers', 'class-markers', 'teacher-calendar-markers');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-calendar-markers', 'center-calendar-markers', 'class-markers', '2026-08-01', '2026-09-30',
			'[1,2]', 'admin-calendar-markers', '2026-08-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES
			('lesson-calendar-week', 'center-calendar-markers', 'class-markers', 'schedule-calendar-markers', '2026-08-10', 'planned', 'admin-calendar-markers', '2026-08-01T00:00:00.000Z'),
			('lesson-calendar-month', 'center-calendar-markers', 'class-markers', 'schedule-calendar-markers', '2026-09-01', 'planned', 'admin-calendar-markers', '2026-08-01T00:00:00.000Z');
	`);
	root.financialLedger.createPayment({
		sessionToken: 'session-admin-calendar-markers',
		classId: 'class-markers',
		studentAccountId: 'student-calendar-markers',
		amount: '12.500',
		factualDate: '2026-08-10',
		confirmation: 'calendar-marker-first'
	});
	root.financialLedger.createPayment({
		sessionToken: 'session-admin-calendar-markers',
		classId: 'class-markers',
		studentAccountId: 'student-calendar-markers',
		amount: '3.125',
		factualDate: '2026-08-10',
		confirmation: 'calendar-marker-second'
	});
	root.financialLedger.createPayment({
		sessionToken: 'session-admin-calendar-markers',
		classId: 'class-markers',
		studentAccountId: 'student-calendar-markers',
		amount: '4.250',
		factualDate: '2026-09-01',
		confirmation: 'calendar-marker-month'
	});
	return root;
}

function financialSnapshot(root: CompositionRoot) {
	return root.database.sqlite
		.prepare(`
			SELECT
				(SELECT COUNT(*) FROM financial_payments) AS payments,
				(SELECT COUNT(*) FROM financial_payment_allocations) AS allocations,
				(SELECT COUNT(*) FROM financial_lesson_charges) AS charges,
				(SELECT COUNT(*) FROM financial_payment_audit_records) AS audit
		`)
		.get();
}

describe('TASK-101 Calendar personal payment markers', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it.each([
		['session-student-calendar-markers', 'student'],
		['session-parent-calendar-markers', 'parent']
	] as const)('loads and renders factual markers for the authorized %s personal calendar', (sessionToken, role) => {
		const before = financialSnapshot(root);
		const weekData = load(requestEvent(root, sessionToken, '2026-08-10')) as CalendarPageData;
		const weekBody = render(CalendarPage, { props: { data: weekData } } as any).body;

		expect(weekData).toMatchObject({ role, paymentMarkers: [
			{ markerDate: '2026-08-09', factualDate: '2026-08-10', amount: '12.5' },
			{ markerDate: '2026-08-09', factualDate: '2026-08-10', amount: '3.125' },
			{ markerDate: '2026-08-31', factualDate: '2026-09-01', amount: '4.25' }
		] });
		expect(weekBody).toContain('12.5');
		expect(weekBody).toContain('3.125');
		expect(weekBody).toContain('Фактическая дата: 2026-08-10');
		expect(weekBody.match(/data-payment-marker-id=/g)).toHaveLength(2);

		const monthData = load(requestEvent(root, sessionToken, '2026-09-01')) as CalendarPageData;
		const monthBody = render(CalendarPage, { props: { data: monthData } } as any).body;
		expect(monthBody).toContain('4.25');
		expect(monthBody).toContain('Фактическая дата: 2026-09-01');
		expect(monthBody).toContain('data-payment-marker-date="2026-08-31"');
		expect(monthBody.match(/data-payment-marker-id=/g)).toHaveLength(1);
		expect(financialSnapshot(root)).toEqual(before);
	});

	it('keeps markers out of Admin and Teacher calendars', () => {
		for (const sessionToken of ['session-admin-calendar-markers', 'session-teacher-calendar-markers']) {
			const data = load(requestEvent(root, sessionToken)) as CalendarPageData;
			const body = render(CalendarPage, { props: { data } } as any).body;
			expect(data.paymentMarkers).toEqual([]);
			expect(body).not.toContain('data-payment-marker-id');
			expect(body).not.toContain('12.500');
		}
	});

	it('ignores a forged URL student scope and keeps the route on the server-resolved actor scope', () => {
		const event = requestEvent(root, 'session-student-calendar-markers', '2026-08-10');
		event.url.searchParams.set('studentAccountId', 'student-not-linked');
		const forged = load(event) as CalendarPageData;
		expect(forged.paymentMarkers).toEqual([
			expect.objectContaining({ markerDate: '2026-08-09', amount: '12.5' }),
			expect.objectContaining({ markerDate: '2026-08-09', amount: '3.125' }),
			expect.objectContaining({ markerDate: '2026-08-31', amount: '4.25' })
		]);

		const source = readFileSync(resolve(process.cwd(), 'src/routes/calendar/+page.server.ts'), 'utf8');
		expect(source).toContain('lessonContext.getPersonalPaymentMarkers');
		expect(source).not.toContain('.sqlite');
		expect(source).not.toMatch(/financial_(?:payments|payment_allocations|payment_commands|audit_records)/);
	});
});
