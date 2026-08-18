import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		getCompositionRoot: () => routeRoot.current
	};
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import CalendarPage from '../../src/routes/calendar/+page.svelte';
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';
import { load as calendarLoad, type CalendarPageData } from '../../src/routes/calendar/+page.server';
import {
	actions as lessonContextActions,
	load as lessonContextLoad
} from '../../src/routes/lesson-context/+page.server';

function calendarEvent(
	root: CompositionRoot,
	sessionToken = 'session-student-own'
): Parameters<typeof calendarLoad>[0] {
	const url = new URL('https://calendar.test/calendar?classId=class-own&date=2026-08-10');
	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		},
		locals: { actor: root.identityAccess.resolveActor(sessionToken) }
	} as Parameters<typeof calendarLoad>[0];
}

function lessonContextEvent(
	href: string,
	sessionToken = 'session-student-own'
): Parameters<typeof lessonContextLoad>[0] {
	const url = new URL(`https://calendar.test${href}`);
	return {
		url,
		request: new Request(url),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		}
	} as Parameters<typeof lessonContextLoad>[0];
}

function paymentActionEvent(sessionToken: string, fields: Record<string, string>) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-own&lessonId=lesson-own');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		}
	} as any;
}

function lessonMaterialActionEvent(sessionToken: string, fields: Record<string, string>) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-own&lessonId=lesson-own');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);
	return {
		url,
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: {
			get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined)
		}
	} as any;
}

function snapshot(root: CompositionRoot): Record<string, unknown[]> {
	const tables = root.database.sqlite
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
		)
		.all() as Array<{ name: string }>;

	return Object.fromEntries(
		tables.map(({ name }) => [
			name,
			root.database.sqlite.prepare(`SELECT * FROM "${name.replaceAll('"', '""')}" ORDER BY rowid`).all()
		])
	);
}

function seedRoot(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-own', 'Own Center');
		INSERT INTO accounts (id, role) VALUES
			('admin-own', 'admin'),
			('teacher-own', 'teacher'),
			('student-own', 'student');
		INSERT INTO sessions (token, account_id, revoked_at) VALUES
			('session-student-own', 'student-own', NULL),
			('session-teacher-own', 'teacher-own', NULL),
			('session-admin-own', 'admin-own', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-own', 'admin-own'),
			('center-own', 'teacher-own'),
			('center-own', 'student-own');
		INSERT INTO classes (id, center_id, name, mode) VALUES
			('class-own', 'center-own', 'Алгебра', 'group');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-own', 'class-own', 'student-own');
		INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
			VALUES ('center-own', 'class-own', 'teacher-own');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-own', 'center-own', 'class-own', '2026-08-01', '2026-08-31',
			'[1,2]', 'admin-own', '2026-08-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-own', 'center-own', 'class-own', 'schedule-own', '2026-08-10',
			'planned', 'admin-own', '2026-08-01T00:00:00.000Z'
		);
	`);
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-own',
		classId: 'class-own',
		lessonId: 'lesson-own',
		topic: 'Linear equations',
		practicalWork: 'Solve examples',
		homework: 'Exercises 1–3'
	});
	return root;
}

describe('FT-003-AC-008 calendar lesson navigation', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('follows a DB-backed rendered lesson link into the existing shared Lesson Context route', () => {
		const data = calendarLoad(calendarEvent(root)) as CalendarPageData;
		const response = render(CalendarPage, { props: { data } } as any);
		const encodedHref = response.body.match(/href="(\/lesson-context\?[^\"]+)"/)?.[1];
		expect(response.body).toContain('Открыть урок');
		expect(response.body).not.toContain('Запланировано');

		expect(encodedHref).toBe(
			'/lesson-context?date=2026-08-10&amp;classId=class-own&amp;lessonId=lesson-own'
		);

		const href = encodedHref!.replaceAll('&amp;', '&');
		const url = new URL(`https://calendar.test${href}`);
		expect([...url.searchParams.keys()]).toEqual(['date', 'classId', 'lessonId']);
		expect(url.searchParams.get('date')).toBe('2026-08-10');
		expect(url.searchParams.get('classId')).toBe('class-own');
		expect(url.searchParams.get('lessonId')).toBe('lesson-own');
		expect(url.searchParams.has('studentAccountId')).toBe(false);

		const before = snapshot(root);
		const context = lessonContextLoad(lessonContextEvent(href)) as {
			dayContext: NonNullable<ReturnType<CompositionRoot['lessonContext']['getDayContext']>>;
		};

		expect(context.dayContext).toMatchObject({
			mode: 'shared',
			lesson: {
				lessonId: 'lesson-own',
				classId: 'class-own',
				lessonDate: '2026-08-10'
			},
			navigation: {
				date: '2026-08-10',
				classId: 'class-own',
				lessonId: 'lesson-own',
				studentAccountId: null
			},
			material: {
				topic: 'Linear equations',
				practicalWork: 'Solve examples',
				homework: 'Exercises 1–3'
			},
			personal: null
		});
		const contextResponse = render(LessonContextPage, { props: { data: context } } as any);
		const identityLine = contextResponse.body.match(/<p class="identity-line[^>]*>(.*?)<\/p>/)?.[1];
		expect(identityLine).toBe('Общий контекст занятия в классе «Алгебра»');
		expect(identityLine).not.toContain('class-own');
		expect(identityLine).not.toContain('lesson-own');
		expect(snapshot(root)).toEqual(before);
	});

	it('lets an assigned teacher record a payment and exposes paid/unpaid status only to the student', async () => {
		root.database.sqlite
			.prepare(
				`INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES (?, ?, ?, ?, ?, 'planned', ?, ?)`
			)
			.run(
				'lesson-own-unpaid',
				'center-own',
				'class-own',
				'schedule-own',
				'2026-08-11',
				'admin-own',
				'2026-08-01T00:00:00.000Z'
			);
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '20',
			effectiveFrom: '2026-01-01'
		});
		root.learningProgress.recordAttendance({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-own',
			attendance: 'present'
		});

		const beforePayment = calendarLoad(calendarEvent(root)) as CalendarPageData;
		expect(beforePayment.lessons).toEqual(expect.arrayContaining([
			expect.objectContaining({ lessonId: 'lesson-own', paymentStatus: 'unpaid' }),
			expect.objectContaining({ lessonId: 'lesson-own-unpaid', paymentStatus: 'unpaid' })
		]));

		const created = await lessonContextActions.default(
			paymentActionEvent('session-teacher-own', {
				action: 'createPayment',
				studentAccountId: 'student-own',
				amount: '20',
				factualDate: '',
				confirmation: 'payment-lesson-own-1'
			})
		);
		expect(created).toEqual({ paymentSuccess: true });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 1 });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payment_allocations').get()).toEqual({ count: 1 });

		const afterPayment = calendarLoad(calendarEvent(root)) as CalendarPageData;
		expect(afterPayment.lessons).toEqual(expect.arrayContaining([
			expect.objectContaining({ lessonId: 'lesson-own', paymentStatus: 'paid' }),
			expect.objectContaining({ lessonId: 'lesson-own-unpaid', paymentStatus: 'unpaid' })
		]));
		const rendered = render(CalendarPage, { props: { data: afterPayment } } as any).body;
		expect(rendered).toContain('data-payment-status="paid"');
		expect(rendered).toContain('data-payment-status="unpaid"');
		expect(rendered).toContain('Оплачено');
		expect(rendered).toContain('Не оплачено');
		expect(rendered).toContain('paid-lesson');
		expect(rendered).toContain('unpaid-lesson');

		for (const sessionToken of ['session-admin-own', 'session-teacher-own']) {
			const sharedCalendar = calendarLoad(calendarEvent(root, sessionToken)) as CalendarPageData;
			expect(sharedCalendar.lessons.every((lesson) => lesson.paymentStatus === undefined)).toBe(true);
		}

		const teacherPage = lessonContextLoad(
			lessonContextEvent('/lesson-context?classId=class-own&lessonId=lesson-own', 'session-teacher-own')
		) as any;
		expect(teacherPage.canCreatePayment).toBe(true);
		expect(render(LessonContextPage, { props: { data: teacherPage } } as any).body).toContain('Внести оплату');
		const studentPage = lessonContextLoad(
			lessonContextEvent('/lesson-context?classId=class-own&lessonId=lesson-own', 'session-student-own')
		) as any;
		expect(studentPage.canCreatePayment).toBe(false);
		expect(render(LessonContextPage, { props: { data: studentPage } } as any).body).not.toContain('Внести оплату');

		const denied = await lessonContextActions.default(
			paymentActionEvent('session-student-own', {
				action: 'createPayment',
				studentAccountId: 'student-own',
				amount: '20',
				factualDate: '2026-08-10',
				confirmation: 'payment-student-denied'
			})
		);
		expect(denied).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(root.database.sqlite.prepare('SELECT COUNT(*) AS count FROM financial_payments').get()).toEqual({ count: 1 });

		const routeSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'), 'utf8');
		expect(routeSource).toContain('financialLedger.createPayment');
		expect(routeSource).not.toContain('.sqlite');
	});

	it('opens an authorized lesson before shared material has been added', () => {
		root.database.sqlite.prepare('DELETE FROM lesson_context_material WHERE lesson_id = ?').run('lesson-own');

		const context = lessonContextLoad(lessonContextEvent('/lesson-context?classId=class-own&lessonId=lesson-own')) as {
			dayContext: null;
			lesson: { className: string; lessonId: string; classId: string; lessonDate: string; status: string };
		};
		const response = render(LessonContextPage, { props: { data: context } } as any);

		expect(context).toMatchObject({
			dayContext: null,
			lesson: {
				className: 'Алгебра',
				lessonId: 'lesson-own',
				classId: 'class-own',
				lessonDate: '2026-08-10',
				status: 'planned'
			}
		});
		expect(response.body).toContain('Материал пока не добавлен');
	});

	it('allows Admin and assigned Teacher to save material while denying Student', async () => {
		const saved = await lessonContextActions.default(
			lessonMaterialActionEvent('session-admin-own', {
				topic: 'Updated topic',
				practicalWork: 'Updated practice',
				homework: 'Updated homework'
			})
		);
		expect(saved).toEqual({ success: true });
		expect(root.lessonContext.getDayContext({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			lessonId: 'lesson-own'
		}).material).toEqual({
			lessonId: 'lesson-own',
			classId: 'class-own',
			topic: 'Updated topic',
			practicalWork: 'Updated practice',
			homework: 'Updated homework'
		});

		const teacherSaved = await lessonContextActions.default(
			lessonMaterialActionEvent('session-teacher-own', {
				topic: 'Teacher topic',
				practicalWork: 'Teacher practice',
				homework: 'Teacher homework'
			})
		);
		expect(teacherSaved).toEqual({ success: true });

		const beforeStudentAttempt = snapshot(root);
		const denied = await lessonContextActions.default(
			lessonMaterialActionEvent('session-student-own', {
				topic: 'Student topic',
				practicalWork: 'Student practice',
				homework: 'Student homework'
			})
		);
		expect(denied).toMatchObject({ status: 403, data: { error: 'forbidden' } });
		expect(snapshot(root)).toEqual(beforeStudentAttempt);
	});
});

describe('TASK-050 independent personal payment projection verification', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = seedRoot();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('derives Student status from the ledger and omits it for shared roles', async () => {
		root.financialLedger.setClassPrice({
			sessionToken: 'session-admin-own',
			classId: 'class-own',
			amount: '20',
			effectiveFrom: '2026-01-01'
		});
		root.learningProgress.recordAttendance({
			sessionToken: 'session-teacher-own',
			classId: 'class-own',
			lessonId: 'lesson-own',
			studentAccountId: 'student-own',
			attendance: 'present'
		});

		const unpaid = calendarLoad(calendarEvent(root)) as CalendarPageData;
		expect(unpaid.lessons).toEqual(expect.arrayContaining([
			expect.objectContaining({ lessonId: 'lesson-own', paymentStatus: 'unpaid' })
		]));

		const created = await lessonContextActions.default(
			paymentActionEvent('session-teacher-own', {
				action: 'createPayment',
				studentAccountId: 'student-own',
				amount: '20',
				factualDate: '2026-08-10',
				confirmation: 'task-050-verifier-payment'
			})
		);
		expect(created).toEqual({ paymentSuccess: true });

		const paid = calendarLoad(calendarEvent(root)) as CalendarPageData;
		expect(paid.lessons).toEqual(expect.arrayContaining([
			expect.objectContaining({ lessonId: 'lesson-own', paymentStatus: 'paid' })
		]));

		for (const sessionToken of ['session-admin-own', 'session-teacher-own']) {
			const shared = calendarLoad(calendarEvent(root, sessionToken)) as CalendarPageData;
			expect(shared.lessons.every((lesson) => lesson.paymentStatus === undefined)).toBe(true);
		}

		const calendarSource = readFileSync(resolve(process.cwd(), 'src/routes/calendar/+page.server.ts'), 'utf8');
		expect(calendarSource).toContain('lessonContext.getStudentPaymentStatuses');
		expect(calendarSource).not.toContain('.sqlite');
		expect(calendarSource).not.toMatch(/financial_(?:payments|payment_allocations|payment_commands|audit_records)/);
	});

	it('rejects forged payment scope before mutation and ignores shared URL student hints', async () => {
		const before = snapshot(root);
		const denied = await lessonContextActions.default(
			paymentActionEvent('session-teacher-own', {
				action: 'createPayment',
				studentAccountId: 'forged-student-account',
				amount: '20',
				factualDate: '2026-08-10',
				confirmation: 'task-050-semantic-forged'
			})
		);
		expect(denied).toMatchObject({ status: 403, data: { error: 'payment_forbidden' } });
		expect(snapshot(root)).toEqual(before);

		const forgedSharedEvent = calendarEvent(root, 'session-admin-own');
		forgedSharedEvent.url.searchParams.set('studentAccountId', 'student-own');
		const shared = calendarLoad(forgedSharedEvent) as CalendarPageData;
		expect(shared.lessons.every((lesson) => lesson.paymentStatus === undefined)).toBe(true);

		const calendarServerSource = readFileSync(resolve(process.cwd(), 'src/routes/calendar/+page.server.ts'), 'utf8');
		const calendarPageSource = readFileSync(resolve(process.cwd(), 'src/routes/calendar/+page.svelte'), 'utf8');
		expect(calendarServerSource).not.toMatch(/(?:root\.database|\.sqlite|financial_(?:payments|payment_allocations|payment_commands|audit_records))/);
		expect(calendarServerSource).toContain("scope.role === 'student'");
		expect(calendarPageSource).toContain("if (data.role !== 'student') return undefined");
	});
});
