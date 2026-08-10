import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';

describe('TASK-014 adversarial semantic UI check', () => {
	it('AC-004 renders the selected provider-owned grade in the personal day form', () => {
		const rendered = render(LessonContextPage, {
			props: {
				data: {
					dayContext: {
						mode: 'personal',
						lesson: {
							lessonId: 'lesson-own',
							centerId: 'center-own',
							classId: 'class-own',
							className: 'Own Class',
							lessonDate: '2026-08-10',
							status: 'planned'
						},
						navigation: {
							date: '2026-08-10',
							classId: 'class-own',
							lessonId: 'lesson-own',
							studentAccountId: 'student-one'
						},
						material: {
							lessonId: 'lesson-own',
							classId: 'class-own',
							topic: 'Newton laws',
							practicalWork: 'Measure acceleration',
							homework: 'Solve exercises 1–3'
						},
						discussion: { commonMessages: [] },
						personal: {
							studentAccountId: 'student-one',
							progress: {
								attendance: {
									lessonId: 'lesson-own',
									classId: 'class-own',
									studentAccountId: 'student-one',
									attendance: 'present',
									recordedByAccountId: 'teacher-own',
									recordedAt: '2026-08-10T00:00:00.000Z'
								},
								grade: {
									homeworkId: 'homework-own',
									classId: 'class-own',
									studentAccountId: 'student-one',
									grade: 'β',
									recordedByAccountId: 'teacher-own',
									recordedAt: '2026-08-10T00:00:00.000Z'
								}
							},
							discussion: { commonMessages: [] },
							financial: {
								balance: { charges: [], balance: '0', advance: '0', allocations: [], payments: [], audit: [] },
								paymentMarkers: []
							}
						}
					}
				}
			}
		});

		expect(rendered.body).toContain('β');
	});
});
