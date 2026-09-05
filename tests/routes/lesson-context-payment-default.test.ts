import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';

const routeRoot = vi.hoisted(() => ({ current: undefined as any }));

vi.mock('$lib/server/composition-root', async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getCompositionRoot: () => routeRoot.current };
});

import { createCompositionRoot, type CompositionRoot } from '../../src/lib/server/composition-root';
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';
import {
	actions as lessonContextActions,
	load as lessonContextLoad
} from '../../src/routes/lesson-context/+page.server';

function event(root: CompositionRoot, sessionToken: string, method: 'GET' | 'POST' = 'GET', fields: Record<string, string> = {}) {
	const url = new URL('https://calendar.test/lesson-context?classId=class-default-099&lessonId=lesson-default-099');
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) {
		if (name !== 'action') formData.set(name, value);
	}
	return {
		url,
		request: new Request(url, method === 'POST' ? { method, body: formData } : { method }),
		cookies: { get: (name: string) => (name === 'foundation_session' ? sessionToken : undefined) },
		actionName: fields.action
	} as any;
}

async function invoke(request: any) {
	return lessonContextActions[request.actionName](request);
}

function createFixture(): CompositionRoot {
	const root = createCompositionRoot({ databaseFilename: ':memory:' });
	root.database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-default-099', 'Default Center');
		INSERT INTO accounts (id, role) VALUES ('admin-default-099', 'admin'), ('student-default-099', 'student');
		INSERT INTO sessions (token, account_id, revoked_at)
			VALUES ('session-admin-default-099', 'admin-default-099', NULL);
		INSERT INTO center_memberships (center_id, account_id) VALUES
			('center-default-099', 'admin-default-099'),
			('center-default-099', 'student-default-099');
		INSERT INTO account_profiles (account_id, full_name, registered_at)
			VALUES ('student-default-099', 'Ученик Default', '2026-01-01T00:00:00.000Z');
		INSERT INTO classes (id, center_id, name, mode)
			VALUES ('class-default-099', 'center-default-099', 'Default Class', 'individual');
		INSERT INTO class_students (center_id, class_id, student_account_id)
			VALUES ('center-default-099', 'class-default-099', 'student-default-099');
		INSERT INTO schedules (
			id, center_id, class_id, start_date, end_date, weekdays,
			created_by_account_id, created_at
		) VALUES (
			'schedule-default-099', 'center-default-099', 'class-default-099',
			'2026-01-01', '2026-12-31', '[1]', 'admin-default-099',
			'2026-01-01T00:00:00.000Z'
		);
		INSERT INTO lessons (
			id, center_id, class_id, schedule_id, lesson_date, status,
			created_by_account_id, created_at
		) VALUES (
			'lesson-default-099', 'center-default-099', 'class-default-099',
			'schedule-default-099', '2026-09-07', 'planned', 'admin-default-099',
			'2026-01-01T00:00:00.000Z'
		);
	`);
	root.financialLedger.setClassPrice({
		sessionToken: 'session-admin-default-099',
		classId: 'class-default-099',
		amount: '24.50',
		effectiveFrom: '2026-01-01'
	});
	root.lessonContext.setSharedLessonMaterial({
		sessionToken: 'session-admin-default-099',
		classId: 'class-default-099',
		lessonId: 'lesson-default-099',
		topic: 'Default topic',
		practicalWork: 'Default work',
		homework: 'Default homework'
	});
	return root;
}

describe('TASK-099 Lesson Context payment default', () => {
	let root: CompositionRoot;

	beforeEach(() => {
		root = createFixture();
		routeRoot.current = root;
	});

	afterEach(() => {
		routeRoot.current = undefined;
		root.database.close();
	});

	it('initializes the existing editable payment amount from the authorized class value', async () => {
		const data = lessonContextLoad(event(root, 'session-admin-default-099')) as any;
		expect(data.payment).toMatchObject({
			studentAccountIds: ['student-default-099'],
			defaultAmount: '24.5'
		});
		expect(render(LessonContextPage, { props: { data, form: null } } as any).body).toContain(
			'name="amount" type="number" min="0.01" step="any" required="" value="24.5"'
		);

		const result = await invoke(event(root, 'session-admin-default-099', 'POST', {
			action: 'createPayment',
			studentAccountId: 'student-default-099',
			amount: '7.25',
			factualDate: '',
			confirmation: 'editable-payment-default-099'
		}));
		expect(result).toEqual({ paymentSuccess: true });
		expect(root.database.sqlite.prepare(
			'SELECT amount FROM financial_payments WHERE student_account_id = ?'
		).get('student-default-099')).toEqual({ amount: '7.25' });
	});
});
