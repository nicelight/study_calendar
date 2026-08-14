<script lang="ts">
	let { data, form } = $props();

	const teachers = $derived(
		data.participants.filter((participant) => participant.role === 'teacher')
	);
	const weekdays = [
		{ value: 1, label: 'Пн' },
		{ value: 2, label: 'Вт' },
		{ value: 3, label: 'Ср' },
		{ value: 4, label: 'Чт' },
		{ value: 5, label: 'Пт' },
		{ value: 6, label: 'Сб' },
		{ value: 0, label: 'Вс' }
	] as const;

	function roleLabel(role: string): string {
		return {
			admin: 'Admin',
			teacher: 'Учитель',
			student: 'Ученик',
			parent: 'Родитель'
		}[role] ?? role;
	}

	function messageLabel(message: string): string {
		return {
			class_created: 'Класс создан.',
			class_updated: 'Класс обновлён.',
			class_deleted: 'Класс удалён.',
			schedule_created: 'Расписание и запланированные уроки созданы.',
			teacher_assigned: 'Учитель назначен на класс.',
			teacher_removed: 'Доступ учителя к классу отозван.',
			teacher_membership_removed: 'Учитель удалён из центра.',
			invitation_created: 'Приглашение создано.'
		}[message] ?? 'Изменения сохранены.';
	}

	function errorLabel(error: string): string {
		return {
			unauthorized: 'Сессия завершена. Войдите снова.',
			forbidden: 'Недостаточно прав для этой операции.',
			invalid_request: 'Проверьте заполненные поля.',
			invalid_name: 'Укажите название класса.',
			invalid_mode: 'Выберите индивидуальный или групповой режим.',
			invalid_schedule: 'Проверьте даты и выберите хотя бы один день недели.',
			invalid_teacher: 'Выберите учителя этого центра.',
			invalid_role: 'Выберите разрешённую роль участника.',
			conflict: 'Операция конфликтует с текущими данными класса.',
			provisioning_failed: 'Не удалось создать приглашение.',
			operation_failed: 'Не удалось сохранить изменения.'
		}[error] ?? 'Не удалось выполнить операцию.';
	}
</script>

<svelte:head>
	<title>{data.name} — управление центром</title>
</svelte:head>

<main class="admin-shell">
	<header class="hero">
		<div>
			<p class="eyebrow">Protected Admin · {data.centerId}</p>
			<h1>{data.name}</h1>
			<p class="intro">Классы, расписания, участники и доступ учителей — в одном месте.</p>
		</div>
		<form method="POST" action="/auth/logout" class="logout-form">
			<button class="button secondary" type="submit">Выйти</button>
		</form>
	</header>

	{#if form?.message}
		<p class="notice success" aria-live="polite">{messageLabel(form.message)}</p>
	{/if}
	{#if form?.error}
		<p class="notice error" role="alert">{errorLabel(form.error)}</p>
	{/if}

	<section class="metrics" aria-label="Сводка центра">
		<div><strong>{data.classes.length}</strong><span>классов</span></div>
		<div><strong>{teachers.length}</strong><span>учителей</span></div>
		<div><strong>{data.participants.length}</strong><span>участников</span></div>
	</section>

	<div class="layout">
		<section class="main-column" aria-labelledby="classes-title">
			<div class="section-heading">
				<div>
					<p class="eyebrow">Учебные группы</p>
					<h2 id="classes-title">Классы</h2>
				</div>
			</div>

			<article class="card create-card">
				<h3>Новый класс</h3>
				<form method="POST" action="?/createClass" class="form-grid compact-form">
					<label>
						<span>Название</span>
						<input name="name" required autocomplete="off" placeholder="Например, Английский A2" />
					</label>
					<label>
						<span>Режим</span>
						<select name="mode" required>
							<option value="group">Групповой</option>
							<option value="individual">Индивидуальный</option>
						</select>
					</label>
					<button class="button primary" type="submit">Создать класс</button>
				</form>
			</article>

			{#if data.classes.length === 0}
				<div class="empty-state">
					<strong>Классов пока нет</strong>
					<p>Создайте первый класс, затем назначьте учителя и добавьте расписание.</p>
				</div>
			{:else}
				<div class="class-list">
					{#each data.classes as classView (classView.classId)}
						{@const availableTeachers = teachers.filter(
							(teacher) => !classView.teacherAccountIds.includes(teacher.accountId)
						)}
						<article class="card class-card">
							<div class="class-title-row">
								<div>
									<span class:individual={classView.mode === 'individual'} class="mode-pill">
										{classView.mode === 'individual' ? 'Индивидуальный' : 'Групповой'}
									</span>
									<h3>{classView.name}</h3>
									<p>{classView.studentCount} учеников · {classView.schedules.length} расписаний</p>
								</div>
								<code>{classView.classId}</code>
							</div>

							<details>
								<summary>Настройки класса</summary>
								<form method="POST" action="?/updateClass" class="form-grid compact-form inset-form">
									<input type="hidden" name="classId" value={classView.classId} />
									<label>
										<span>Название</span>
										<input name="name" value={classView.name} required />
									</label>
									<label>
										<span>Режим</span>
										<select name="mode" required>
											<option value="group" selected={classView.mode === 'group'}>Групповой</option>
											<option value="individual" selected={classView.mode === 'individual'}>Индивидуальный</option>
										</select>
									</label>
									<button class="button secondary" type="submit">Сохранить</button>
								</form>
							</details>

							<div class="subsection">
								<h4>Доступ учителей</h4>
								{#if classView.teacherAccountIds.length > 0}
									<ul class="assignment-list">
										{#each classView.teacherAccountIds as teacherAccountId}
											<li>
												<code>{teacherAccountId}</code>
												<form method="POST" action="?/removeTeacher">
													<input type="hidden" name="classId" value={classView.classId} />
													<input type="hidden" name="teacherAccountId" value={teacherAccountId} />
													<button class="text-button danger" type="submit">Отозвать доступ</button>
												</form>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="muted">Учителя не назначены.</p>
								{/if}

								{#if availableTeachers.length > 0}
									<form method="POST" action="?/assignTeacher" class="inline-form">
										<input type="hidden" name="classId" value={classView.classId} />
										<label>
											<span class="sr-only">Учитель</span>
											<select name="teacherAccountId" required>
												<option value="">Выберите учителя</option>
												{#each availableTeachers as teacher}
													<option value={teacher.accountId}>{teacher.accountId}</option>
												{/each}
											</select>
										</label>
										<button class="button secondary" type="submit">Назначить</button>
									</form>
								{/if}
							</div>

							<div class="subsection">
								<h4>Новое расписание</h4>
								<form method="POST" action="?/createSchedule" class="schedule-form">
									<input type="hidden" name="classId" value={classView.classId} />
									<div class="date-grid">
										<label><span>С даты</span><input type="date" name="startDate" required /></label>
										<label><span>По дату</span><input type="date" name="endDate" required /></label>
									</div>
									<fieldset>
										<legend>Дни занятий</legend>
										<div class="weekday-grid">
											{#each weekdays as weekday}
												<label>
													<input type="checkbox" name="weekdays" value={weekday.value} />
													<span>{weekday.label}</span>
												</label>
											{/each}
										</div>
									</fieldset>
									<button class="button secondary" type="submit">Создать расписание</button>
								</form>
								{#if classView.schedules.length > 0}
									<ul class="schedule-list">
										{#each classView.schedules as schedule}
											<li>{schedule.startDate} — {schedule.endDate} · дни {schedule.weekdays.join(', ')}</li>
										{/each}
									</ul>
								{/if}
							</div>

							<form method="POST" action="?/deleteClass" class="delete-form">
								<input type="hidden" name="classId" value={classView.classId} />
								<p>Удаление класса также удалит его расписание и уроки.</p>
								<button class="button danger" type="submit">Удалить класс «{classView.name}»</button>
							</form>
						</article>
					{/each}
				</div>
			{/if}
		</section>

		<aside class="side-column" aria-labelledby="participants-title">
			<section class="card sticky-card">
				<div>
					<p class="eyebrow">Команда центра</p>
					<h2 id="participants-title">Участники</h2>
				</div>

				<ul class="participant-list">
					{#each data.participants as participant}
						<li>
							<div>
								<strong>{roleLabel(participant.role)}</strong>
								<code>{participant.accountId}</code>
							</div>
							{#if participant.role === 'teacher'}
								<form method="POST" action="?/removeTeacherMembership">
									<input type="hidden" name="teacherAccountId" value={participant.accountId} />
									<button class="text-button danger" type="submit">Удалить из центра</button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>

				<div class="invite-block">
					<h3>Новое приглашение</h3>
					<p class="muted">Аккаунт и роль фиксируются до перехода по одноразовой ссылке.</p>
					<form method="POST" action="?/inviteParticipant" class="form-grid">
						<label>
							<span>Роль участника</span>
							<select name="role" required>
								<option value="teacher">Учитель</option>
								<option value="student">Ученик</option>
								<option value="parent">Родитель</option>
							</select>
						</label>
						<button class="button primary" type="submit">Создать приглашение</button>
					</form>
					{#if form?.invitationUrl}
						<div class="invitation-result" aria-live="polite">
							<strong>Ссылка готова</strong>
							<a href={form.invitationUrl}>{form.invitationUrl}</a>
							<small>Действует до {form.expiresAt}</small>
						</div>
					{/if}
				</div>
			</section>
		</aside>
	</div>
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(:root) {
		--paper: #f7f3eb;
		--surface: #fffdf8;
		--surface-soft: #eef2eb;
		--ink: #25332e;
		--muted: #6d7a73;
		--line: #d9e0d8;
		--accent: #3f765d;
		--accent-soft: #dcebdd;
		--danger: #9b4e39;
		--danger-soft: #f9e7e2;
		--shadow: 0 20px 50px rgba(39, 61, 48, .09);
	}
	:global(body) {
		margin: 0;
		background: var(--paper);
		color: var(--ink);
		font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif;
	}
	:global(button), :global(input), :global(select) { font: inherit; }
	.admin-shell { width: min(100% - 1.5rem, 80rem); margin: 0 auto; padding: 2rem 0 5rem; }
	.hero { display: grid; gap: 1.5rem; margin-bottom: 2rem; }
	.eyebrow { margin: 0; color: var(--accent); font-size: .72rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
	h1 { margin: .45rem 0 .8rem; font-size: clamp(2.6rem, 10vw, 6.5rem); letter-spacing: -.075em; line-height: .9; }
	h2 { margin: .3rem 0 0; font-size: clamp(1.75rem, 6vw, 2.6rem); letter-spacing: -.05em; }
	h3, h4 { margin: 0; letter-spacing: -.025em; }
	h4 { font-size: 1rem; }
	.intro, .muted { color: var(--muted); line-height: 1.55; }
	.intro { max-width: 46rem; margin: 0; font-size: 1rem; }
	.logout-form { align-self: start; }
	.notice { margin: 0 0 1rem; padding: 1rem; border-radius: .8rem; font-weight: 750; }
	.notice.success { background: var(--accent-soft); color: var(--accent); }
	.notice.error { background: var(--danger-soft); color: var(--danger); }
	.metrics { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 2rem; border-block: 1px solid var(--line); }
	.metrics div { display: grid; gap: .15rem; padding: 1rem .35rem; }
	.metrics strong { font-size: 1.7rem; }
	.metrics span { color: var(--muted); font-size: .78rem; font-weight: 750; }
	.layout, .main-column, .side-column, .class-list { display: grid; gap: 1rem; }
	.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: .5rem; }
	.card { padding: 1.1rem; border: 1px solid var(--line); border-radius: 1rem; background: var(--surface); box-shadow: var(--shadow); }
	.create-card, .class-card, .sticky-card { display: grid; gap: 1.25rem; }
	.form-grid, label { display: grid; gap: .45rem; }
	.form-grid { gap: .85rem; }
	label > span, legend { color: var(--muted); font-size: .8rem; font-weight: 800; }
	input, select, .button {
		width: 100%; min-height: 2.75rem; padding: .65rem .75rem; border: 1px solid #b8c8ba;
		border-radius: .65rem; background: var(--surface); color: var(--ink); font-size: 1rem;
	}
	.button { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 850; text-decoration: none; }
	.button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
	.button.secondary { border-color: var(--accent); background: transparent; color: var(--accent); }
	.button.danger { border-color: var(--danger); background: transparent; color: var(--danger); }
	.class-title-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: start; justify-content: space-between; }
	.class-title-row h3 { margin: .55rem 0 .25rem; font-size: 1.45rem; }
	.class-title-row p { margin: 0; color: var(--muted); font-size: .88rem; }
	code { color: var(--muted); font: .78rem/1.4 ui-monospace, "SFMono-Regular", Consolas, monospace; overflow-wrap: anywhere; }
	.mode-pill { display: inline-flex; padding: .28rem .52rem; border-radius: 999px; background: var(--accent-soft); color: var(--accent); font-size: .7rem; font-weight: 850; }
	.mode-pill.individual { background: #f3e6d0; color: #815f2e; }
	details { border-block: 1px solid var(--line); padding: .9rem 0; }
	summary { min-height: 2.75rem; display: flex; align-items: center; cursor: pointer; color: var(--accent); font-weight: 850; }
	.inset-form { padding-top: .8rem; }
	.subsection { display: grid; gap: .85rem; }
	.assignment-list, .participant-list, .schedule-list { margin: 0; padding: 0; list-style: none; }
	.assignment-list li, .participant-list li { display: flex; gap: .8rem; align-items: center; justify-content: space-between; padding: .75rem 0; border-bottom: 1px solid var(--line); }
	.assignment-list li:first-child, .participant-list li:first-child { border-top: 1px solid var(--line); }
	.participant-list li > div { display: grid; gap: .15rem; }
	.text-button { min-height: 2.75rem; padding: .4rem 0; border: 0; background: transparent; cursor: pointer; color: var(--accent); font-weight: 800; }
	.text-button.danger { color: var(--danger); }
	.inline-form { display: grid; gap: .65rem; }
	.schedule-form { display: grid; gap: .9rem; padding: 1rem; border-radius: .8rem; background: var(--surface-soft); }
	.date-grid { display: grid; gap: .75rem; }
	fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
	.weekday-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .4rem; margin-top: .5rem; }
	.weekday-grid label { position: relative; }
	.weekday-grid input { position: absolute; opacity: 0; pointer-events: none; }
	.weekday-grid span { display: grid; min-height: 2.75rem; place-items: center; border: 1px solid var(--line); border-radius: .55rem; background: var(--surface); color: var(--ink); cursor: pointer; }
	.weekday-grid input:checked + span { border-color: var(--accent); background: var(--accent); color: #fff; }
	.weekday-grid input:focus-visible + span { outline: 3px solid var(--accent-soft); outline-offset: 2px; }
	.schedule-list { display: grid; gap: .4rem; color: var(--muted); font-size: .82rem; }
	.delete-form { display: grid; gap: .6rem; padding-top: 1rem; border-top: 1px solid var(--line); }
	.delete-form p { margin: 0; color: var(--muted); font-size: .82rem; }
	.empty-state { padding: 2.5rem 1rem; border: 1px dashed var(--line); border-radius: 1rem; text-align: center; }
	.empty-state p { margin: .5rem auto 0; max-width: 30rem; color: var(--muted); line-height: 1.5; }
	.invite-block { display: grid; gap: .9rem; padding-top: 1.2rem; border-top: 1px solid var(--line); }
	.invite-block p { margin: 0; }
	.invitation-result { display: grid; gap: .45rem; padding: .85rem; border-radius: .7rem; background: var(--accent-soft); }
	.invitation-result a { color: var(--accent); font-weight: 800; overflow-wrap: anywhere; }
	.invitation-result small { color: var(--muted); }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

	@media (min-width: 42rem) {
		.admin-shell { width: min(100% - 3rem, 80rem); padding-top: 3rem; }
		.hero { grid-template-columns: 1fr auto; align-items: start; }
		.compact-form { grid-template-columns: minmax(0, 1.6fr) minmax(10rem, .8fr) auto; align-items: end; }
		.compact-form .button { width: auto; }
		.date-grid, .inline-form { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; }
		.weekday-grid { grid-template-columns: repeat(7, 1fr); }
	}

	@media (min-width: 64rem) {
		.layout { grid-template-columns: minmax(0, 1.75fr) minmax(18rem, .75fr); gap: 1.5rem; align-items: start; }
		.sticky-card { position: sticky; top: 1.5rem; }
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--paper: #18201d;
			--surface: #202b26;
			--surface-soft: #27342e;
			--ink: #eef3ed;
			--muted: #a7b5ab;
			--line: #405149;
			--accent: #9ed2b2;
			--accent-soft: #314b3e;
			--danger: #f0aa96;
			--danger-soft: #4a2c25;
			--shadow: 0 20px 50px rgba(0, 0, 0, .2);
		}
		.mode-pill.individual { background: #4e402a; color: #f1d49e; }
		input, select, .button { border-color: var(--line); }
	}

	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
	}
</style>
