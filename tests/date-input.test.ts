import { describe, expect, it } from 'vitest';
import {
	formatDateInput,
	formatDisplayDate,
	parseDisplayDate
} from '../src/lib/date-input';

describe('shared date input presentation', () => {
	it('converts compact digits to a dotted date and preserves deletion', () => {
		expect(formatDateInput('1122026')).toBe('01.12.2026');
		expect(formatDateInput('01.12.202', 'deleteContentBackward')).toBe('01.12.202');
	});

	it('accepts valid display dates and rejects impossible dates', () => {
		expect(parseDisplayDate('01.12.2026')).toBe('2026-12-01');
		expect(parseDisplayDate('31.02.2026')).toBeNull();
		expect(formatDisplayDate('2026-12-01')).toBe('01.12.2026');
	});
});
