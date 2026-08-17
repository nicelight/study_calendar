import Database from 'better-sqlite3';
import { expect, test } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@nicelight.ai';
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const databaseFilename = process.env.DATABASE_URL ?? 'study-calendar.db';

type MaterialRow = {
	lesson_id: string;
	topic: string;
	practical_work: string;
	homework: string;
	updated_at: string;
};

test('real Admin can open a class lesson through the browser', async ({ page }) => {
	test.skip(!adminPassword, 'E2E_ADMIN_PASSWORD is required for the real database smoke test');
	let lessonId: string | undefined;
	let originalMaterial: MaterialRow | null | undefined;
	let loginSessionToken: string | undefined;

	try {
		await page.goto('/login');
		await page.getByLabel('Email').fill(adminEmail);
		await page.getByLabel('Пароль').fill(adminPassword!);
		await page.getByRole('button', { name: 'Войти' }).click();

		await expect(page).toHaveURL(/\/admin\/[^/]+$/);
		loginSessionToken = (await page.context().cookies()).find(
			(cookie) => cookie.name === 'foundation_session'
		)?.value;
		if (!loginSessionToken) throw new Error('The real login did not set foundation_session');
		await expect(page.getByRole('heading', { name: 'Новый аккаунт' })).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Пароль')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Создать аккаунт' })).toBeVisible();
		const classLink = page.getByRole('link', { name: 'Открыть класс' }).first();
		await expect(classLink).toBeVisible();
		await classLink.click();

		await expect(page).toHaveURL(/\/center\/[^/]+\/class\/[^/]+$/);
		const calendarLink = page.getByRole('link', { name: 'Открыть календарь' });
		await expect(calendarLink).toBeVisible();
		await calendarLink.click();

		await expect(page).toHaveURL(/\/calendar\?classId=[^&]+$/);
		const lessonLink = page.locator('a.lesson-link').first();
		await expect(lessonLink).toBeVisible();
		await expect(lessonLink.getByText('Открыть урок')).toBeVisible();
		const lessonHref = await lessonLink.getAttribute('href');
		lessonId = new URL(`http://127.0.0.1:5173${lessonHref}`).searchParams.get('lessonId') ?? undefined;
		if (!lessonId) throw new Error('The real lesson link did not contain lessonId');
		const database = new Database(databaseFilename);
		try {
			originalMaterial = (database
				.prepare(
					'SELECT lesson_id, topic, practical_work, homework, updated_at FROM lesson_context_material WHERE lesson_id = ?'
				)
				.get(lessonId) as MaterialRow | undefined) ?? null;
		} finally {
			database.close();
		}
		await lessonLink.click();

		await expect(page).toHaveURL(/\/lesson-context\?date=[^&]+&classId=[^&]+&lessonId=[^&]+$/);
		await expect(
			page.getByText(/Материал пока не добавлен|Общий материал/).first()
		).toBeVisible();

		const materialForm = page.getByRole('form', { name: 'Материал занятия' });
		await expect(materialForm).toBeVisible();
		await materialForm.getByLabel('Тема занятия').fill('E2E проверка темы');
		await materialForm.getByLabel('Практическая работа').fill('E2E проверка практики');
		await materialForm.getByLabel('Домашнее задание').fill('E2E проверка домашнего задания');
		await materialForm.getByRole('button', { name: 'Сохранить материал' }).click();

		await expect(page.getByRole('heading', { name: 'E2E проверка темы' })).toBeVisible();
		await expect(page.getByText('Материал сохранён.')).toBeVisible();
		await page.reload();
		await expect(page.getByRole('heading', { name: 'E2E проверка темы' })).toBeVisible();
		await expect(page.getByText('E2E проверка практики')).toBeVisible();
		await expect(page.getByText('E2E проверка домашнего задания')).toBeVisible();

		const classId = new URL(page.url()).searchParams.get('classId');
		if (!classId) throw new Error('The real lesson context URL did not contain classId');
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(`/calendar?classId=${encodeURIComponent(classId)}`);
		const freeDayLink = page.locator('.day:not(.lesson-day) .day-link').first();
		await expect(freeDayLink).toBeVisible();
		await freeDayLink.click();
		await expect(page).toHaveURL(/\/calendar\?classId=[^&]+&date=[^&]+$/);

		await page.goto('/admin');
		const logout = page.getByRole('button', { name: 'Выйти' });
		await expect(logout).toBeVisible();
		await logout.click();
		await expect(page).toHaveURL(/\/login$/);
	} finally {
		if (lessonId && originalMaterial !== undefined) {
			const database = new Database(databaseFilename);
			try {
				if (originalMaterial) {
					database
						.prepare(
							'UPDATE lesson_context_material SET topic = ?, practical_work = ?, homework = ?, updated_at = ? WHERE lesson_id = ?'
						)
						.run(
							originalMaterial.topic,
							originalMaterial.practical_work,
							originalMaterial.homework,
							originalMaterial.updated_at,
							lessonId
						);
				} else {
					database.prepare('DELETE FROM lesson_context_material WHERE lesson_id = ?').run(lessonId);
				}
			} finally {
				database.close();
			}
		}
		if (loginSessionToken) {
			const database = new Database(databaseFilename);
			try {
				database.prepare('DELETE FROM sessions WHERE token = ?').run(loginSessionToken);
			} finally {
				database.close();
			}
		}
	}
});
