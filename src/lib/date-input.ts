import { parseIsoDate } from '$lib/calendar';

export function parseDisplayDate(value: string): string | null {
	const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
	if (!match) return null;

	const isoDate = `${match[3]}-${match[2]}-${match[1]}`;
	return parseIsoDate(isoDate) ? isoDate : null;
}

export function formatDisplayDate(value: string): string {
	if (!parseIsoDate(value)) return value;
	return `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`;
}

export function formatDateInput(value: string, inputType = ''): string {
	if (inputType.startsWith('delete') && value.includes('.')) {
		return value
			.split('.')
			.slice(0, 3)
			.map((part) => part.replace(/\D/g, '').slice(0, 4))
			.join('.');
	}

	const digits = value.replace(/\D/g, '').slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length === 7) {
		return `0${digits.slice(0, 1)}.${digits.slice(1, 3)}.${digits.slice(3)}`;
	}
	if (digits.length === 8) {
		return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
	}
	if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
	return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function formatDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return new Intl.DateTimeFormat('ru-RU', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}
