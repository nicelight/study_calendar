import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('TASK-102 Attempt 2 personal named-form scope probe', () => {
	it('keeps the selected student scope in the native named-action URL', () => {
		const pageSource = readFileSync(resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'), 'utf8');
		const helper = pageSource.match(/function actionHref\(action: string\): string \{[\s\S]*?\n\t\}/)?.[0] ?? '';
		expect.soft(helper).toContain('studentAccountId');

		const personalPageUrl = new URL(
			'https://calendar.test/lesson-context?classId=class-verify-102&lessonId=lesson-verify-102&studentAccountId=student-one-verify-102'
		);
		const actionUrl = new URL(
			'?classId=class-verify-102&lessonId=lesson-verify-102&/completeHomework',
			personalPageUrl
		);
		expect(actionUrl.searchParams.get('studentAccountId')).toBe('student-one-verify-102');
	});
});
