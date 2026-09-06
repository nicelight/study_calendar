<script lang="ts">
	import type { StatisticsPageData } from './+page.server';
	import type {
		StatisticsClassRow,
		StatisticsStudentRow,
		StatisticsTeacherRow
	} from '$lib/server/modules/lesson-context/public';

	type Direction = 'ascending' | 'descending';
	type SortState<Key extends string> = { key: Key; direction: Direction };
	type StudentSortKey = 'fullName' | 'registeredAt' | 'className' | 'parentNames' | 'teacherNames' | 'paymentCapabilityPercentage' | 'attendancePercentage' | 'institutionName';
	type TeacherSortKey = 'fullName' | 'registeredAt' | 'classNames' | 'attendancePercentage' | 'institutionName' | 'studentCount';
	type ClassSortKey = 'className' | 'institutionName' | 'studentCount' | 'teacherNames';

	let { data }: { data: StatisticsPageData } = $props();
	let studentSort = $state<SortState<StudentSortKey>>({ key: 'fullName', direction: 'ascending' });
	let teacherSort = $state<SortState<TeacherSortKey>>({ key: 'fullName', direction: 'ascending' });
	let classSort = $state<SortState<ClassSortKey>>({ key: 'className', direction: 'ascending' });

	const textCollator = new Intl.Collator('ru', { sensitivity: 'base', numeric: true });
	function activateSortWithSpace(event: KeyboardEvent) {
		if (event.key === ' ') {
			event.preventDefault();
			(event.currentTarget as HTMLAnchorElement).click();
		}
	}
	const sortedStudents = $derived(sortRows(data.registry.students, studentSort, studentSortValue));
	const sortedTeachers = $derived(sortRows(data.registry.teachers, teacherSort, teacherSortValue));
	const sortedClasses = $derived(sortRows(data.registry.classes, classSort, classSortValue));

	function formatDate(value: string): string {
		return new Intl.DateTimeFormat('ru', { dateStyle: 'medium' }).format(new Date(value));
	}

	function formatPercentage(value: number): string {
		return `${value}%`;
	}

	function orderedNames(names: string[]): string[] {
		return [...names].sort(textCollator.compare);
	}

	function sortRows<Row, Key extends string>(
		rows: Row[],
		sort: SortState<Key>,
		valueFor: (row: Row, key: Key) => string | number
	): Row[] {
		const direction = sort.direction === 'ascending' ? 1 : -1;
		return rows
			.map((row, index) => ({ row, index, value: valueFor(row, sort.key) }))
			.sort((left, right) => {
				const comparison = typeof left.value === 'number' && typeof right.value === 'number'
					? left.value - right.value
					: textCollator.compare(String(left.value), String(right.value));
				return comparison === 0 ? left.index - right.index : comparison * direction;
			})
			.map(({ row }) => row);
	}

	function studentSortValue(row: StatisticsStudentRow, key: StudentSortKey): string | number {
		switch (key) {
			case 'registeredAt': return new Date(row.registeredAt).getTime();
			case 'parentNames': return orderedNames(row.parentNames).join('\n');
			case 'teacherNames': return orderedNames(row.teacherNames).join('\n');
			default: return row[key];
		}
	}

	function teacherSortValue(row: StatisticsTeacherRow, key: TeacherSortKey): string | number {
		switch (key) {
			case 'registeredAt': return new Date(row.registeredAt).getTime();
			case 'classNames': return orderedNames(row.classNames)[0] ?? '';
			default: return row[key];
		}
	}

	function classSortValue(row: StatisticsClassRow, key: ClassSortKey): string | number {
		return key === 'teacherNames' ? orderedNames(row.teacherNames).join('\n') : row[key];
	}

	function toggleSort<Key extends string>(sort: SortState<Key>, key: Key): SortState<Key> {
		return sort.key === key
			? { key, direction: sort.direction === 'ascending' ? 'descending' : 'ascending' }
			: { key, direction: 'ascending' };
	}

	function sortAria<Key extends string>(sort: SortState<Key>, key: Key): Direction | 'none' {
		return sort.key === key ? sort.direction : 'none';
	}

	function sortLabel<Key extends string>(label: string, sort: SortState<Key>, key: Key): string {
		const direction = sort.key === key && sort.direction === 'ascending' ? 'убыванию' : 'возрастанию';
		return `Сортировать ${label} по ${direction}`;
	}

	function sortMark<Key extends string>(sort: SortState<Key>, key: Key): string {
		return sort.key === key ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕';
	}
</script>

<svelte:head>
	<title>Statistics</title>
	<meta name="description" content="Разрешённые сервером ученики, учителя и классы." />
</svelte:head>

<main class="statistics-shell" data-statistics-page>
	<header class="hero">
		<p class="eyebrow">Read-only registry</p>
		<h1>Statistics</h1>
		<p>Только разрешённые сервером данные вашего центра и назначенных классов.</p>
	</header>

	<section aria-labelledby="students-heading">
		<h2 id="students-heading">Students</h2>
		<div class="table-wrap">
			<table>
				<thead><tr>
					<th aria-sort={sortAria(studentSort, 'fullName')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('ФИО', studentSort, 'fullName')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'fullName'); }}>ФИО <span>{sortMark(studentSort, 'fullName')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'registeredAt')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Регистрация', studentSort, 'registeredAt')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'registeredAt'); }}>Регистрация <span>{sortMark(studentSort, 'registeredAt')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'className')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Класс', studentSort, 'className')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'className'); }}>Класс <span>{sortMark(studentSort, 'className')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'parentNames')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Родитель', studentSort, 'parentNames')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'parentNames'); }}>Родитель <span>{sortMark(studentSort, 'parentNames')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'teacherNames')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Teacher', studentSort, 'teacherNames')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'teacherNames'); }}>Teacher <span>{sortMark(studentSort, 'teacherNames')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'paymentCapabilityPercentage')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Payment capability', studentSort, 'paymentCapabilityPercentage')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'paymentCapabilityPercentage'); }}>Payment capability <span>{sortMark(studentSort, 'paymentCapabilityPercentage')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'attendancePercentage')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Attendance', studentSort, 'attendancePercentage')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'attendancePercentage'); }}>Attendance <span>{sortMark(studentSort, 'attendancePercentage')}</span></a></th>
					<th aria-sort={sortAria(studentSort, 'institutionName')}><a role="button" href="#students-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Institution', studentSort, 'institutionName')} onclick={(event) => { event.preventDefault(); studentSort = toggleSort(studentSort, 'institutionName'); }}>Institution <span>{sortMark(studentSort, 'institutionName')}</span></a></th>
				</tr></thead>
				<tbody>
					{#each sortedStudents as student}
						<tr><td>{student.fullName}</td><td>{formatDate(student.registeredAt)}</td><td>{student.className}</td><td>{student.parentNames.length ? orderedNames(student.parentNames).join(', ') : '—'}</td><td>{student.teacherNames.length ? orderedNames(student.teacherNames).join(', ') : '—'}</td><td>{formatPercentage(student.paymentCapabilityPercentage)}</td><td>{formatPercentage(student.attendancePercentage)}</td><td>{student.institutionName}</td></tr>
					{:else}
						<tr><td colspan="8" class="empty">Нет доступных учеников.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section aria-labelledby="teachers-heading">
		<h2 id="teachers-heading">Teachers</h2>
		<div class="table-wrap">
			<table>
				<thead><tr>
					<th aria-sort={sortAria(teacherSort, 'fullName')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('ФИО', teacherSort, 'fullName')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'fullName'); }}>ФИО <span>{sortMark(teacherSort, 'fullName')}</span></a></th>
					<th aria-sort={sortAria(teacherSort, 'registeredAt')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Регистрация', teacherSort, 'registeredAt')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'registeredAt'); }}>Регистрация <span>{sortMark(teacherSort, 'registeredAt')}</span></a></th>
					<th aria-sort={sortAria(teacherSort, 'classNames')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Классы', teacherSort, 'classNames')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'classNames'); }}>Классы <span>{sortMark(teacherSort, 'classNames')}</span></a></th>
					<th aria-sort={sortAria(teacherSort, 'attendancePercentage')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Attendance', teacherSort, 'attendancePercentage')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'attendancePercentage'); }}>Attendance <span>{sortMark(teacherSort, 'attendancePercentage')}</span></a></th>
					<th aria-sort={sortAria(teacherSort, 'institutionName')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Institution', teacherSort, 'institutionName')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'institutionName'); }}>Institution <span>{sortMark(teacherSort, 'institutionName')}</span></a></th>
					<th aria-sort={sortAria(teacherSort, 'studentCount')}><a role="button" href="#teachers-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Students', teacherSort, 'studentCount')} onclick={(event) => { event.preventDefault(); teacherSort = toggleSort(teacherSort, 'studentCount'); }}>Students <span>{sortMark(teacherSort, 'studentCount')}</span></a></th>
				</tr></thead>
				<tbody>
					{#each sortedTeachers as teacher}
						<tr><td>{teacher.fullName}</td><td>{formatDate(teacher.registeredAt)}</td><td>{#if teacher.classNames.length}{#each orderedNames(teacher.classNames) as className}<span class="stacked-value">{className}</span>{/each}{:else}—{/if}</td><td>{formatPercentage(teacher.attendancePercentage)}</td><td>{teacher.institutionName}</td><td>{teacher.studentCount}</td></tr>
					{:else}
						<tr><td colspan="6" class="empty">Нет доступных учителей.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section aria-labelledby="classes-heading">
		<h2 id="classes-heading">Classes</h2>
		<div class="table-wrap">
			<table>
				<thead><tr>
					<th aria-sort={sortAria(classSort, 'className')}><a role="button" href="#classes-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Название', classSort, 'className')} onclick={(event) => { event.preventDefault(); classSort = toggleSort(classSort, 'className'); }}>Название <span>{sortMark(classSort, 'className')}</span></a></th>
					<th aria-sort={sortAria(classSort, 'institutionName')}><a role="button" href="#classes-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Institution', classSort, 'institutionName')} onclick={(event) => { event.preventDefault(); classSort = toggleSort(classSort, 'institutionName'); }}>Institution <span>{sortMark(classSort, 'institutionName')}</span></a></th>
					<th aria-sort={sortAria(classSort, 'studentCount')}><a role="button" href="#classes-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Students', classSort, 'studentCount')} onclick={(event) => { event.preventDefault(); classSort = toggleSort(classSort, 'studentCount'); }}>Students <span>{sortMark(classSort, 'studentCount')}</span></a></th>
					<th aria-sort={sortAria(classSort, 'teacherNames')}><a role="button" href="#classes-heading" onkeydown={activateSortWithSpace} aria-label={sortLabel('Teacher', classSort, 'teacherNames')} onclick={(event) => { event.preventDefault(); classSort = toggleSort(classSort, 'teacherNames'); }}>Teacher <span>{sortMark(classSort, 'teacherNames')}</span></a></th>
				</tr></thead>
				<tbody>
					{#each sortedClasses as classRow}
						<tr><td>{classRow.className}</td><td>{classRow.institutionName}</td><td>{classRow.studentCount}</td><td>{classRow.teacherNames.length ? orderedNames(classRow.teacherNames).join(', ') : '—'}</td></tr>
					{:else}
						<tr><td colspan="4" class="empty">Нет доступных классов.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>

<style>
	.statistics-shell { width: min(100% - 2rem, 74rem); margin: 0 auto; padding: 1.75rem 0 3rem; }
	.hero { max-width: 48rem; margin-bottom: 2.5rem; }
	.eyebrow { margin: 0 0 .55rem; color: var(--ui-accent-ink); font-size: .8125rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
	h1, h2, p { margin-top: 0; }
	h1 { margin-bottom: 1rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.035em; line-height: 1.2; }
	h2 { margin: 2rem 0 .75rem; font-size: 1.125rem; letter-spacing: -.04em; }
	.hero p:last-child { color: var(--ui-muted); line-height: 1.6; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--ui-line); border-radius: var(--ui-radius); background: var(--ui-surface);  }
	table { width: 100%; border-collapse: collapse; font-size: .9rem; }
	th, td { padding: .85rem 1rem; border-bottom: 1px solid var(--ui-line); text-align: left; vertical-align: top; white-space: nowrap; }
	th { color: var(--ui-accent-ink); font-size: .8125rem; letter-spacing: .06em; text-transform: uppercase; }
	th [role='button'] { display: inline-flex; gap: .4rem; align-items: center; color: inherit; font: inherit; font-weight: 600; letter-spacing: inherit; text-decoration: none; text-transform: inherit; cursor: pointer; }
	th [role='button']:focus-visible { outline: 2px solid var(--ui-accent); outline-offset: 3px; border-radius: .2rem; }
	th [role='button'] span { font-size: .95rem; line-height: 1; }
	tbody tr:last-child td { border-bottom: 0; }
	.stacked-value { display: block; }
	.empty { color: var(--ui-muted); text-align: center; }
	table { font-variant-numeric: tabular-nums; }
	th [role='button'] { min-height: 44px; }
	th[aria-sort='ascending'], th[aria-sort='descending'] { background: var(--ui-accent-soft); }
	tbody tr:hover { background: #f5f9fa; }
</style>
