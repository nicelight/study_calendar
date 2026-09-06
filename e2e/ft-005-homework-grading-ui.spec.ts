import { randomBytes, scryptSync } from 'node:crypto';
import { relative, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { expect, test, type Page } from '@playwright/test';

const databaseFilename = process.env.DATABASE_URL;
const projectRoot = resolve(process.cwd());
const centerId = 'center-e2e-106';
const classId = 'class-e2e-106';
const lessonId = 'lesson-e2e-106';
const admin = { id: 'admin-e2e-106', email: 'admin.task-106@example.test', password: 'Admin-task-106!' };
const teacher = { id: 'teacher-e2e-106', email: 'teacher.task-106@example.test', password: 'Teacher-task-106!' };
const studentOne = { id: 'student-one-e2e-106', email: 'student.one.task-106@example.test', password: 'Student-one-task-106!' };
const studentTwo = { id: 'student-two-e2e-106', email: 'student.two.task-106@example.test', password: 'Student-two-task-106!' };
const linkedParent = { id: 'parent-linked-e2e-106', email: 'parent.linked.task-106@example.test', password: 'Parent-linked-task-106!' };
const unlinkedParent = { id: 'parent-unlinked-e2e-106', email: 'parent.unlinked.task-106@example.test', password: 'Parent-unlinked-task-106!' };

if (!databaseFilename || !relative(projectRoot, resolve(databaseFilename)).startsWith('tmp/')) {
	throw new Error('TASK-106 disposable E2E requires DATABASE_URL under tmp/');
}

function withDatabase<T>(callback: (database: Database.Database) => T): T {
	const database = new Database(databaseFilename!);
	try {
		return callback(database);
	} finally {
		database.close();
	}
}

function progressState(): { homework: unknown[]; completions: unknown[]; grades: unknown[] } {
	return withDatabase((database) => ({
		homework: database.prepare('SELECT * FROM learning_homework ORDER BY id').all(),
		completions: database.prepare('SELECT * FROM learning_homework_completions ORDER BY homework_id, student_account_id').all(),
		grades: database.prepare('SELECT * FROM learning_grades ORDER BY homework_id, student_account_id').all()
	}));
}

function seedAccount(database: Database.Database, account: { id: string; email: string; password: string }, role: string, fullName: string): void {
	database.prepare('INSERT INTO accounts (id, role) VALUES (?, ?)').run(account.id, role);
	database.prepare('INSERT INTO account_profiles (account_id, full_name, registered_at) VALUES (?, ?, ?)')
		.run(account.id, fullName, '2026-01-01T00:00:00.000Z');
	const salt = randomBytes(32);
	database.prepare('INSERT INTO password_credentials (account_id, email, salt, password_hash) VALUES (?, ?, ?, ?)')
		.run(account.id, account.email, salt, scryptSync(account.password, salt, 64));
}

function seedFixture(): void {
	withDatabase((database) => {
		database.pragma('foreign_keys = ON');
		database.transaction(() => {
			database.exec(`
				INSERT INTO centers (id, name) VALUES ('${centerId}', 'Disposable Homework Center');
				INSERT INTO classes (id, center_id, name, mode)
					VALUES ('${classId}', '${centerId}', 'Disposable Homework Class', 'group');
			`);
			seedAccount(database, admin, 'admin', 'Admin TASK-106');
			seedAccount(database, teacher, 'teacher', 'Teacher TASK-106');
			seedAccount(database, studentOne, 'student', 'Student One TASK-106');
			seedAccount(database, studentTwo, 'student', 'Student Two TASK-106');
			seedAccount(database, linkedParent, 'parent', 'Linked Parent TASK-106');
			seedAccount(database, unlinkedParent, 'parent', 'Unlinked Parent TASK-106');
			database.exec(`
				INSERT INTO schedules (
					id, center_id, class_id, start_date, end_date, weekdays,
					created_by_account_id, created_at
				) VALUES (
					'schedule-e2e-106', '${centerId}', '${classId}', '2026-08-10',
					'2026-08-10', '[1]', '${admin.id}', '2026-08-01T00:00:00.000Z'
				);
				INSERT INTO lessons (
					id, center_id, class_id, schedule_id, lesson_date, status,
					created_by_account_id, created_at
				) VALUES (
					'${lessonId}', '${centerId}', '${classId}', 'schedule-e2e-106',
					'2026-08-10', 'planned', '${admin.id}', '2026-08-01T00:00:00.000Z'
				);
				INSERT INTO lesson_context_material (
					lesson_id, center_id, class_id, topic, practical_work, homework,
					created_at, updated_at
				) VALUES (
					'${lessonId}', '${centerId}', '${classId}', 'Homework UI topic',
					'Homework UI practice', 'Read the homework UI chapter',
					'2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'
				);
				INSERT INTO center_memberships (center_id, account_id) VALUES
					('${centerId}', '${admin.id}'), ('${centerId}', '${teacher.id}'),
					('${centerId}', '${studentOne.id}'), ('${centerId}', '${studentTwo.id}'),
					('${centerId}', '${linkedParent.id}'), ('${centerId}', '${unlinkedParent.id}');
				INSERT INTO teacher_assignments (center_id, class_id, teacher_account_id)
					VALUES ('${centerId}', '${classId}', '${teacher.id}');
				INSERT INTO class_students (center_id, class_id, student_account_id) VALUES
					('${centerId}', '${classId}', '${studentOne.id}'),
					('${centerId}', '${classId}', '${studentTwo.id}');
				INSERT INTO parent_student_links (center_id, parent_account_id, student_account_id)
					VALUES ('${centerId}', '${linkedParent.id}', '${studentOne.id}');
			`);
		})();
	});
}

function lessonUrl(studentAccountId?: string): string {
	const params = new URLSearchParams({ date: '2026-08-10', classId, lessonId });
	if (studentAccountId) params.set('studentAccountId', studentAccountId);
	return `/lesson-context?${params.toString()}`;
}

async function loginAs(page: Page, account: { email: string; password: string }): Promise<void> {
	await page.context().clearCookies();
	await page.goto('/login');
	await page.getByLabel('Email').fill(account.email);
	await page.getByLabel('Пароль').fill(account.password);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).not.toHaveURL(/\/login$/);
}

test('disposable homework completion and grading proof uses fresh server projections', async ({ page }) => {
	seedFixture();

	await loginAs(page, admin);
	await page.goto(lessonUrl());
	await expect(page.locator('section.material').getByText('Read the homework UI chapter', { exact: true })).toBeVisible();
	await expect(page.getByRole('form', { name: 'Создать домашнее задание' })).toBeVisible();

	await page.getByRole('form', { name: 'Создать домашнее задание' }).getByRole('button', { name: 'Создать домашнее задание' }).click();
	await expect(page.getByText('Изменение домашнего задания сохранено.')).toBeVisible();

	await loginAs(page, studentOne);
	await page.goto(lessonUrl(studentOne.id));
	const studentHomework = page.locator('section.homework');
	await expect(studentHomework).toContainText('Read the homework UI chapter');
	await expect(studentHomework).toContainText('Не выполнено');
	await studentHomework.getByRole('form', { name: 'Отметить домашнее задание выполненным' }).getByRole('button', { name: 'Отметить выполненным' }).click();
	await expect(page.getByText('Изменение домашнего задания сохранено.')).toBeVisible();
	await page.reload();
	await expect(studentHomework).toContainText('Выполнено');

	await loginAs(page, teacher);
	await page.goto(lessonUrl());
	const teacherHomework = page.locator('section.homework');
	await expect(teacherHomework).toContainText('Student One TASK-106');
	await expect(teacherHomework).toContainText('Выполнено');
	await expect(teacherHomework).toContainText('Student Two TASK-106');
	await expect(teacherHomework).toContainText('Не выполнено');
	const gradeForm = teacherHomework.getByRole('form', { name: 'Оценка для Student One TASK-106' });
	for (const grade of ['α', 'β', 'γ', 'F']) {
		await gradeForm.getByRole('combobox').selectOption(grade);
		await gradeForm.getByRole('button', { name: 'Сохранить оценку' }).click();
		await expect(page.getByText('Изменение домашнего задания сохранено.')).toBeVisible();
		await page.reload();
		await expect(gradeForm.getByRole('combobox')).toHaveValue(grade);
	}

	await loginAs(page, studentOne);
	await page.goto(lessonUrl(studentOne.id));
	await expect(page.getByText('Оценка: F')).toBeVisible();
	await expect(page.getByText('Записать оценку')).toHaveCount(0);

	await loginAs(page, linkedParent);
	await page.goto(lessonUrl(studentOne.id));
	await expect(page.getByText('Оценка: F')).toBeVisible();

	await loginAs(page, studentTwo);
	const deniedActionBefore = progressState();
	const deniedActionResponse = await page.evaluate(async (url) => {
		const response = await fetch(url, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ studentAccountId: 'student-one-e2e-106', grade: 'α' })
		});
		return { status: response.status, body: await response.text() };
	}, `${lessonUrl()}&/recordGrade`);
	await expect(deniedActionResponse.body).toContain('homework_forbidden');
	await expect(progressState()).toEqual(deniedActionBefore);

	const unrelatedStudentBefore = progressState();
	const unrelatedStudentResponse = await page.goto(lessonUrl(studentOne.id));
	await expect(unrelatedStudentResponse).not.toBeNull();
	await expect(unrelatedStudentResponse!.status()).toBe(403);
	await expect(page.getByText('Оценка: F')).toHaveCount(0);
	await expect(progressState()).toEqual(unrelatedStudentBefore);

	await loginAs(page, unlinkedParent);
	const unrelatedParentBefore = progressState();
	const unrelatedParentResponse = await page.goto(lessonUrl(studentOne.id));
	await expect(unrelatedParentResponse).not.toBeNull();
	await expect(unrelatedParentResponse!.status()).toBe(403);
	await expect(page.getByText('Оценка: F')).toHaveCount(0);
	await expect(progressState()).toEqual(unrelatedParentBefore);

	const finalState = progressState();
	expect(finalState.homework).toHaveLength(1);
	expect(finalState.completions).toEqual([
		expect.objectContaining({ student_account_id: studentOne.id, completed_at: expect.any(String) })
	]);
	expect(finalState.grades).toEqual([
		expect.objectContaining({ student_account_id: studentOne.id, grade: 'F' })
	]);
});
