import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import LessonContextPage from '../../src/routes/lesson-context/+page.svelte';

const personalContext = {
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
			grade: null
		},
		discussion: { commonMessages: [] },
		financial: {
			balance: { charges: [], balance: '0', advance: '0', allocations: [], payments: [], audit: [] },
			paymentMarkers: []
		}
	}
};

function renderPersonal(grade: object | null) {
	return render(LessonContextPage, {
		props: {
			data: {
				dayContext: {
					...personalContext,
					personal: {
						...personalContext.personal,
						progress: { ...personalContext.personal.progress, grade }
					}
				}
			}
		}
	} as any);
}

describe('Lesson Context personal page rendering', () => {
	it('renders the authorized grade when present', () => {
		const rendered = renderPersonal({
			homeworkId: 'homework-own',
			classId: 'class-own',
			studentAccountId: 'student-one',
			grade: 'β',
			recordedByAccountId: 'teacher-own',
			recordedAt: '2026-08-10T00:00:00.000Z'
		});

		expect(rendered.body).toContain('Оценка: β');
	});

	it('renders a safe empty state when no grade is available', () => {
		const rendered = renderPersonal(null);

		expect(rendered.body).toContain('Оценка: пока не выставлена');
		expect(rendered.body).not.toContain('undefined');
	});
});
