<script lang="ts">
	import type { StatisticsPageData } from './+page.server';

	let { data }: { data: StatisticsPageData } = $props();

	function formatDate(value: string): string {
		return new Intl.DateTimeFormat('ru', { dateStyle: 'medium' }).format(new Date(value));
	}

	function formatPercentage(value: number): string {
		return `${value}%`;
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
				<thead><tr><th>ФИО</th><th>Регистрация</th><th>Класс</th><th>Родитель</th><th>Teacher</th><th>Payment capability</th><th>Attendance</th><th>Institution</th></tr></thead>
				<tbody>
					{#each data.registry.students as student}
						<tr>
							<td>{student.fullName}</td>
							<td>{formatDate(student.registeredAt)}</td>
							<td>{student.className}</td>
							<td>{student.parentNames.length ? student.parentNames.join(', ') : '—'}</td>
							<td>{student.teacherNames.length ? student.teacherNames.join(', ') : '—'}</td>
							<td>{formatPercentage(student.paymentCapabilityPercentage)}</td>
							<td>{formatPercentage(student.attendancePercentage)}</td>
							<td>{student.institutionName}</td>
						</tr>
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
				<thead><tr><th>ФИО</th><th>Регистрация</th><th>Классы</th><th>Attendance</th><th>Institution</th><th>Students</th></tr></thead>
				<tbody>
					{#each data.registry.teachers as teacher}
						<tr>
							<td>{teacher.fullName}</td>
							<td>{formatDate(teacher.registeredAt)}</td>
							<td>{teacher.classNames.length ? teacher.classNames.join(', ') : '—'}</td>
							<td>{formatPercentage(teacher.attendancePercentage)}</td>
							<td>{teacher.institutionName}</td>
							<td>{teacher.studentCount}</td>
						</tr>
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
				<thead><tr><th>Название</th><th>Institution</th><th>Students</th><th>Teacher</th></tr></thead>
				<tbody>
					{#each data.registry.classes as classRow}
						<tr>
							<td>{classRow.className}</td>
							<td>{classRow.institutionName}</td>
							<td>{classRow.studentCount}</td>
							<td>{classRow.teacherNames.length ? classRow.teacherNames.join(', ') : '—'}</td>
						</tr>
					{:else}
						<tr><td colspan="4" class="empty">Нет доступных классов.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.statistics-shell { width: min(100% - 2rem, 74rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.hero { max-width: 48rem; margin-bottom: 2.5rem; }
	.eyebrow { margin: 0 0 .55rem; color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	h1, h2, p { margin-top: 0; }
	h1 { margin-bottom: 1rem; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.07em; line-height: .95; }
	h2 { margin: 2rem 0 .75rem; font-size: clamp(1.5rem, 4vw, 2.2rem); letter-spacing: -.04em; }
	.hero p:last-child { color: #6d7a73; line-height: 1.6; }
	.table-wrap { overflow-x: auto; border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; box-shadow: 0 16px 36px rgba(39, 61, 48, .08); }
	table { width: 100%; border-collapse: collapse; font-size: .9rem; }
	th, td { padding: .85rem 1rem; border-bottom: 1px solid #e5e9e2; text-align: left; vertical-align: top; white-space: nowrap; }
	th { color: #3f765d; font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; }
	tbody tr:last-child td { border-bottom: 0; }
	.empty { color: #6d7a73; text-align: center; }
</style>
