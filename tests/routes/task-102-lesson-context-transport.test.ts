import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { actions } from '../../src/routes/lesson-context/+page.server';

describe('TASK-102 named Lesson Context transport', () => {
	it('exports only the accepted existing and Collaboration named actions', () => {
		const routeSource = readFileSync(
			resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'),
			'utf8'
		);

		expect(Object.keys(actions).sort()).toEqual([
			'completeHomework',
			'createFieldComment',
			'createHomework',
			'createMessage',
			'createPayment',
			'editFieldComment',
			'recordGrade',
			'replyToMessage',
			'saveAttendance',
			'setReaction',
			'setSharedLessonMaterial'
		]);
		expect(routeSource).not.toMatch(/\bdefault\s*:/);
	});

	it('migrates every existing Lesson Context form to a named target', () => {
		const pageSource = readFileSync(
			resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'),
			'utf8'
		);

		for (const action of [
			'saveAttendance',
			'createHomework',
			'completeHomework',
			'recordGrade',
			'setSharedLessonMaterial',
			'createPayment'
		]) {
			expect(pageSource).toContain(`action={actionHref('${action}')}`);
		}
		expect(pageSource).toContain('new URLSearchParams({ classId, lessonId })');
		expect(pageSource).toContain('return `?${params.toString()}&/${action}`');
		expect(pageSource).toContain('const studentAccountId = context?.navigation.studentAccountId;');
		expect(pageSource).toContain("params.set('studentAccountId', studentAccountId);");
		expect(pageSource).not.toMatch(/name="action"/);
	});

	it('exposes the bounded participant-label provider and browser projection composition', async () => {
		const identitySource = readFileSync(
			resolve(process.cwd(), 'src/lib/server/modules/identity-access/public.ts'),
			'utf8'
		);
		const contextSource = readFileSync(
			resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'),
			'utf8'
		);
		const collaborationSource = readFileSync(
			resolve(process.cwd(), 'src/lib/server/modules/collaboration/public.ts'),
			'utf8'
		);

		expect(identitySource).toContain('getParticipantLabels');
		expect(contextSource).toContain('getBrowserProjection');
		expect(collaborationSource).toContain('getBrowserProjection');
		expect(contextSource).toContain('collaboration.getBrowserProjection');
	});

	it('keeps the browser projection free of route-owned persistence', () => {
		const routeSource = readFileSync(
			resolve(process.cwd(), 'src/routes/lesson-context/+page.server.ts'),
			'utf8'
		);
		const contextSource = readFileSync(
			resolve(process.cwd(), 'src/lib/server/modules/lesson-context/public.ts'),
			'utf8'
		);

		expect(routeSource).not.toContain('.sqlite');
		expect(contextSource).not.toMatch(/collaboration_(comments|reactions|messages)/);
	});
});
