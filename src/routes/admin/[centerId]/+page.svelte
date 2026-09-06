<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import {
		formatDateInput,
		formatDisplayDate,
		parseDisplayDate
	} from '$lib/date-input';

	let { data, form } = $props();
	type ParticipantRole = 'teacher' | 'student' | 'parent';
	let participantRole = $state<ParticipantRole>('teacher');

	const teachers = $derived(
		data.participants.filter((participant) => participant.role === 'teacher')
	);
	const students = $derived(
		data.participants.filter((participant) => participant.role === 'student')
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

	type ScheduleDraft = {
		startDate: string;
		endDate: string;
		weekdays: number[];
	};

	type ScheduleDateField = 'startDate' | 'endDate';

	function scheduleDraftKey(centerId: string, classId: string): string {
		return `study-calendar:schedule-draft:${centerId}:${classId}`;
	}

	function isStoredDate(value: unknown): value is string {
		if (typeof value !== 'string') return false;
		if (value === '') return true;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
		const date = new Date(`${value}T00:00:00.000Z`);
		return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
	}

	function parseScheduleDate(value: string): string | null {
		const isoDate = parseDisplayDate(value);
		return isoDate && isStoredDate(isoDate) ? isoDate : null;
	}

	function formatScheduleDate(value: string): string {
		return isStoredDate(value) ? formatDisplayDate(value) : '';
	}

	function formatScheduleDateInput(value: string, inputType = ''): string {
		return formatDateInput(value, inputType);
	}

	function isScheduleDraft(value: unknown): value is ScheduleDraft {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
		const draft = value as Record<string, unknown>;
		if (
			Object.keys(draft).length !== 3 ||
			!('startDate' in draft) ||
			!('endDate' in draft) ||
			!('weekdays' in draft) ||
			!isStoredDate(draft.startDate) ||
			!isStoredDate(draft.endDate) ||
			!Array.isArray(draft.weekdays) ||
			!draft.weekdays.every((weekday) => Number.isInteger(weekday) && weekday >= 0 && weekday <= 6)
		) {
			return false;
		}

		return new Set(draft.weekdays).size === draft.weekdays.length;
	}

	function readScheduleDraft(key: string): ScheduleDraft | null {
		try {
			const stored = localStorage.getItem(key);
			if (!stored) return null;
			const draft: unknown = JSON.parse(stored);
			return isScheduleDraft(draft) ? draft : null;
		} catch {
			return null;
		}
	}

	function saveScheduleDraft(formElement: HTMLFormElement): void {
		const key = formElement.dataset.scheduleDraftKey;
		const startDate = formElement.querySelector<HTMLInputElement>('[name="startDate"]')?.value;
		const endDate = formElement.querySelector<HTMLInputElement>('[name="endDate"]')?.value;
		if (!key || startDate === undefined || endDate === undefined) return;

		const draft: ScheduleDraft = {
			startDate,
			endDate,
			weekdays: Array.from(
				formElement.querySelectorAll<HTMLInputElement>('[name="weekdays"]:checked'),
				(input) => Number(input.value)
			)
		};
		if (!isScheduleDraft(draft)) return;

		try {
			localStorage.setItem(key, JSON.stringify(draft));
		} catch {
			// Browser storage is optional disposable UI state.
		}
	}

	function syncScheduleDateInput(input: HTMLInputElement, inputType = ''): void {
		const field = input.dataset.scheduleDateField as ScheduleDateField | undefined;
		if (field !== 'startDate' && field !== 'endDate') return;

		const formElement = input.form;
		const hiddenInput = formElement?.querySelector<HTMLInputElement>(
			`input[type="hidden"][name="${field}"]`
		);
		if (!formElement || !hiddenInput) return;

		input.value = formatScheduleDateInput(input.value, inputType);
		const isoDate = parseScheduleDate(input.value);
		const invalid = input.value !== '' && isoDate === null;
		input.setCustomValidity(invalid ? 'Введите существующую дату в формате dd.mm.yyyy.' : '');
		input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
		hiddenInput.value = isoDate ?? '';

		const error = formElement.querySelector<HTMLElement>(`[data-date-error-for="${field}"]`);
		if (error) error.hidden = !invalid;
	}

	function syncScheduleDate(event: Event): void {
		const inputEvent = event as InputEvent;
		syncScheduleDateInput(event.currentTarget as HTMLInputElement, inputEvent.inputType ?? '');
	}

	function persistScheduleDraft(event: Event): void {
		saveScheduleDraft(event.currentTarget as HTMLFormElement);
	}

	function restoreScheduleDraft(formElement: HTMLFormElement): void {
		const key = formElement.dataset.scheduleDraftKey;
		if (!key) return;
		const draft = readScheduleDraft(key);
		if (!draft) return;

		const startDate = formElement.querySelector<HTMLInputElement>('[name="startDate"]');
		const endDate = formElement.querySelector<HTMLInputElement>('[name="endDate"]');
		const startDateInput = formElement.querySelector<HTMLInputElement>(
			'[data-schedule-date-field="startDate"]'
		);
		const endDateInput = formElement.querySelector<HTMLInputElement>(
			'[data-schedule-date-field="endDate"]'
		);
		if (!startDate || !endDate || !startDateInput || !endDateInput) return;
		startDate.value = draft.startDate;
		endDate.value = draft.endDate;
		startDateInput.value = formatScheduleDate(draft.startDate);
		endDateInput.value = formatScheduleDate(draft.endDate);
		syncScheduleDateInput(startDateInput);
		syncScheduleDateInput(endDateInput);
		for (const input of formElement.querySelectorAll<HTMLInputElement>('[name="weekdays"]')) {
			input.checked = draft.weekdays.includes(Number(input.value));
		}
	}

	function clearScheduleDraft(key: string): void {
		try {
			localStorage.removeItem(key);
		} catch {
			// Browser storage is optional disposable UI state.
		}
	}

	const handleScheduleSubmit: SubmitFunction = ({ formData }) => {
		const classId = formData.get('classId');
		return async ({ result, update }) => {
			await update();
			if (
				result.type === 'success' &&
				result.data?.message === 'schedule_created' &&
				typeof classId === 'string'
			) {
				clearScheduleDraft(scheduleDraftKey(data.centerId, classId));
			}
		};
	};

	onMount(() => {
		for (const formElement of document.querySelectorAll<HTMLFormElement>('.schedule-form')) {
			restoreScheduleDraft(formElement);
		}
	});

	function roleLabel(role: string): string {
		return {
			admin: 'Admin',
			teacher: 'Учитель',
			student: 'Ученик',
			parent: 'Родитель'
		}[role] ?? role;
	}

	type ParticipantOption = {
		accountId: string;
		fullName: string | null;
		email: string | null;
	};

	function participantLabel(participant: ParticipantOption): string {
		if (participant.fullName && participant.email) return `${participant.fullName} · ${participant.email}`;
		return participant.fullName ?? participant.email ?? 'Аккаунт без ФИО';
	}

	function teacherLabel(teacher: ParticipantOption): string {
		return participantLabel(teacher);
	}

	function assignedTeacherLabel(accountId: string): string {
		const teacher = teachers.find((candidate) => candidate.accountId === accountId);
		return teacher ? teacherLabel(teacher) : 'Учитель без профиля';
	}

	function assignedStudentLabel(accountId: string): string {
		const student = students.find((candidate) => candidate.accountId === accountId);
		return student ? participantLabel(student) : 'Ученик без профиля';
	}

	function lessonStatusLabel(status: string): string {
		return {
			planned: 'Запланирован',
			completed: 'Завершён',
			cancelled: 'Отменён'
		}[status] ?? status;
	}

	function selectParticipantRole(event: Event): void {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (value === 'teacher' || value === 'student' || value === 'parent') {
			participantRole = value;
		}
	}

	function messageLabel(message: string): string {
		return {
			class_created: 'Класс создан.',
			class_updated: 'Класс обновлён.',
			class_deleted: 'Класс удалён.',
			schedule_created: 'Расписание создано; пересекающиеся запланированные даты заменены.',
			lesson_added: 'Отдельный урок добавлен.',
			lesson_transferred: 'Урок перенесён.',
			lesson_cancelled: 'Урок отменён.',
			teacher_assigned: 'Учитель назначен на класс.',
			teacher_removed: 'Доступ учителя к классу отозван.',
			student_added: 'Ученик добавлен в класс.',
			student_removed: 'Ученик убран из класса.',
				teacher_membership_removed: 'Учитель удалён из центра.',
				participant_created: 'Аккаунт создан. Передайте пользователю email и пароль.',
				invitation_created: 'Приглашение создано.'
		}[message] ?? 'Изменения сохранены.';
	}

	function errorLabel(error: string): string {
		return {
			unauthorized: 'Сессия завершена. Войдите снова.',
			forbidden: 'Недостаточно прав для этой операции.',
				invalid_request: 'Проверьте заполненные поля.',
				invalid_name: 'Укажите название класса.',
				invalid_profile_name: 'Укажите фамилию и имя участника.',
				invalid_mode: 'Выберите индивидуальный или групповой режим.',
			invalid_schedule: 'Проверьте даты и выберите хотя бы один день недели.',
			schedule_conflict: 'Нельзя заменить завершённое или отменённое занятие.',
				invalid_teacher: 'Выберите учителя этого центра.',
				invalid_student: 'Выберите ученика этого центра.',
				invalid_role: 'Выберите разрешённую роль участника.',
				invalid_email: 'Укажите корректный email.',
				invalid_password: 'Укажите пароль.',
				invalid_parent_student: 'Для родителя выберите ученика.',
				email_exists: 'Аккаунт с таким email уже существует.',
				conflict: 'Операция конфликтует с текущими данными класса.',
				provisioning_failed: 'Не удалось создать аккаунт.',
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
		<nav aria-label="Разделы Admin">
			<a class="button secondary" href={`/admin/${data.centerId}/finance`}>Финансы</a>
		</nav>
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
						{@const availableStudents = students.filter(
							(student) => !classView.studentAccountIds.includes(student.accountId)
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
								<div class="class-title-actions">
									<code>{classView.classId}</code>
									<a
										class="button secondary"
										href={`/center/${data.centerId}/class/${classView.classId}`}
									>
										Открыть класс
									</a>
								</div>
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
												<span>{assignedTeacherLabel(teacherAccountId)}</span>
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
													<option value={teacher.accountId}>{teacherLabel(teacher)}</option>
												{/each}
											</select>
										</label>
										<button class="button secondary" type="submit">Назначить</button>
									</form>
								{/if}
							</div>

							<div class="subsection">
								<h4>Ученики</h4>
								{#if classView.studentAccountIds.length > 0}
									<ul class="assignment-list">
										{#each classView.studentAccountIds as studentAccountId}
											<li>
												<span>{assignedStudentLabel(studentAccountId)}</span>
												<form method="POST" action="?/removeStudent">
													<input type="hidden" name="classId" value={classView.classId} />
													<input type="hidden" name="studentAccountId" value={studentAccountId} />
													<button class="text-button danger" type="submit">Убрать из класса</button>
												</form>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="muted">Ученики не назначены.</p>
								{/if}

								{#if availableStudents.length > 0 && (classView.mode === 'group' || classView.studentCount === 0)}
									<form method="POST" action="?/addStudent" class="inline-form">
										<input type="hidden" name="classId" value={classView.classId} />
										<label>
											<span class="sr-only">Ученик</span>
											<select name="studentAccountId" required>
												<option value="">Выберите ученика</option>
												{#each availableStudents as student}
													<option value={student.accountId}>{participantLabel(student)}</option>
												{/each}
											</select>
										</label>
										<button class="button secondary" type="submit">Добавить ученика</button>
									</form>
								{:else if classView.mode === 'individual' && classView.studentCount > 0}
									<p class="muted">Индивидуальный класс уже занят.</p>
								{/if}
							</div>

							<div class="subsection">
								<h4>Новое расписание</h4>
								<form
									method="POST"
									action="?/createSchedule"
									class="schedule-form"
									data-schedule-draft-key={scheduleDraftKey(data.centerId, classView.classId)}
									oninput={persistScheduleDraft}
									onchange={persistScheduleDraft}
									use:enhance={handleScheduleSubmit}
								>
									<input type="hidden" name="classId" value={classView.classId} />
									<div class="date-grid">
										<input type="hidden" name="startDate" />
										<input type="hidden" name="endDate" />
										<label>
											<span>С даты (dd.mm.yyyy)</span>
											<input
												type="text"
												inputmode="numeric"
												placeholder="dd.mm.yyyy"
												pattern={'[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}'}
												required
												data-schedule-date-field="startDate"
												aria-invalid="false"
												oninput={syncScheduleDate}
												onchange={syncScheduleDate}
											/>
											<span class="date-error" data-date-error-for="startDate" hidden role="alert">
												Введите существующую дату в формате dd.mm.yyyy.
											</span>
										</label>
										<label>
											<span>По дату (dd.mm.yyyy)</span>
											<input
												type="text"
												inputmode="numeric"
												placeholder="dd.mm.yyyy"
												pattern={'[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}'}
												required
												data-schedule-date-field="endDate"
												aria-invalid="false"
												oninput={syncScheduleDate}
												onchange={syncScheduleDate}
											/>
											<span class="date-error" data-date-error-for="endDate" hidden role="alert">
												Введите существующую дату в формате dd.mm.yyyy.
											</span>
										</label>
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
											<li>{formatScheduleDate(schedule.startDate)} — {formatScheduleDate(schedule.endDate)} · дни {schedule.weekdays.join(', ')}</li>
										{/each}
									</ul>
								{/if}
							</div>

								<div class="subsection lesson-subsection">
									<h4>Отдельные уроки</h4>
									<form method="POST" action="?/addLesson" class="lesson-form">
										<input type="hidden" name="classId" value={classView.classId} />
										<label>
											<span>Расписание</span>
											<select name="scheduleId" required disabled={classView.schedules.length === 0}>
												<option value="">Выберите расписание</option>
												{#each classView.schedules as schedule}
													<option value={schedule.scheduleId}>
														{formatScheduleDate(schedule.startDate)} — {formatScheduleDate(schedule.endDate)}
													</option>
												{/each}
											</select>
										</label>
										<label>
											<span>Дата урока</span>
											<input type="date" name="lessonDate" required disabled={classView.schedules.length === 0} />
										</label>
										<button class="button secondary" type="submit" disabled={classView.schedules.length === 0}>
											Добавить урок
										</button>
									</form>
									{#if classView.schedules.length === 0}
										<p class="muted">Сначала создайте расписание.</p>
									{/if}
									{#if classView.lessons.length > 0}
										<ul class="lesson-list">
											{#each classView.lessons as lesson (lesson.lessonId)}
												<li class="lesson-row">
													<div class="lesson-summary">
														<strong>{formatDisplayDate(lesson.lessonDate)}</strong>
														<span class="lesson-meta">{lessonStatusLabel(lesson.status)} · {lesson.lessonId}</span>
													</div>
													{#if lesson.status === 'planned'}
														<div class="lesson-actions">
															<form method="POST" action="?/transferLesson" class="lesson-form">
																<input type="hidden" name="classId" value={classView.classId} />
																<input type="hidden" name="lessonId" value={lesson.lessonId} />
																<label>
																	<span class="sr-only">Новая дата урока</span>
																	<input type="date" name="lessonDate" value={lesson.lessonDate} required />
																</label>
																<button class="button secondary" type="submit">Перенести</button>
															</form>
															<form method="POST" action="?/cancelLesson">
																<input type="hidden" name="classId" value={classView.classId} />
																<input type="hidden" name="lessonId" value={lesson.lessonId} />
																<button class="text-button danger" type="submit">Отменить</button>
															</form>
														</div>
													{:else if lesson.status === 'completed'}
														<span class="muted">Завершённое занятие нельзя отменить.</span>
													{/if}
												</li>
											{/each}
										</ul>
									{:else}
										<p class="muted">Отдельных уроков пока нет.</p>
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
							<strong>{participantLabel(participant)}</strong>
							<span class="participant-meta">
									{roleLabel(participant.role)}{participant.email ? ` · ${participant.email}` : ''}
							</span>
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
					<h3>Новый аккаунт</h3>
					<p class="muted">Укажите ФИО, придумайте пароль и передайте пользователю email вместе с ним.</p>
					<form method="POST" action="?/createParticipant" class="form-grid">
						<label>
							<span>Фамилия</span>
							<input name="surname" required autocomplete="family-name" />
						</label>
						<label>
							<span>Имя</span>
							<input name="givenName" required autocomplete="given-name" />
						</label>
						<label>
							<span>Роль</span>
							<select name="role" value={participantRole} onchange={selectParticipantRole} required>
								<option value="teacher">Учитель</option>
								<option value="student">Ученик</option>
								<option value="parent">Родитель</option>
							</select>
						</label>
						<label>
							<span>Email</span>
							<input name="email" type="email" autocomplete="off" required placeholder="user@example.com" />
						</label>
						<label>
							<span>Пароль</span>
							<input name="password" type="password" autocomplete="new-password" required />
						</label>
						{#if participantRole === 'parent'}
							<label>
								<span>Связать с учеником</span>
								<select name="studentAccountId" required disabled={students.length === 0}>
									<option value="">Выберите ученика</option>
									{#each students as student}
										<option value={student.accountId}>{participantLabel(student)}</option>
									{/each}
								</select>
								{#if students.length === 0}
									<span class="muted">Сначала создайте аккаунт ученика.</span>
								{/if}
							</label>
						{/if}
						<button class="button primary" type="submit" disabled={participantRole === 'parent' && students.length === 0}>
							Создать аккаунт
						</button>
					</form>
					{#if form?.participantEmail}
						<div class="invitation-result" aria-live="polite">
							<strong>Аккаунт создан</strong>
							<span>{form.participantEmail}</span>
						</div>
					{/if}
				</div>
			</section>
		</aside>
	</div>
</main>

<style>
	.admin-shell {
		--surface: var(--ui-surface, #fff);
		--surface-soft: var(--ui-accent-soft, #edf7f9);
		--ink: var(--ui-text, #202a2d);
		--muted: var(--ui-muted, #58666b);
		--line: var(--ui-line, #e3eaed);
		--field-line: #7c9299;
		--accent: var(--ui-accent, #2fa5bf);
		--accent-soft: var(--ui-accent-soft, #edf7f9);
		--warn-soft: var(--ui-warn-soft, #fbf4e9);
		--danger: var(--ui-danger, #a23d42);
		--danger-soft: #fbeff0;
		--radius: var(--ui-radius, 12px);
		--font: var(--ui-font, system-ui, sans-serif);
		width: min(calc(100% - 2rem), 80rem);
		margin: 0 auto;
		padding: 1.75rem 0 5rem;
		color: var(--ink);
		font-family: var(--font);
	}
	.hero { display: grid; gap: 1.25rem; margin-bottom: 1.75rem; }
	.eyebrow { margin: 0; color: var(--ui-accent-ink); font-size: .72rem; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
	h1 { margin: .5rem 0 .7rem; font-size: clamp(1.5rem, 4vw, 1.75rem); letter-spacing: -.04em; line-height: 1.1; }
	h2 { margin: .25rem 0 0; font-size: clamp(1.125rem, 3vw, 1.25rem); letter-spacing: -.025em; }
	h3, h4 { margin: 0; letter-spacing: -.025em; }
	h4 { font-size: 1rem; }
	.intro, .muted { color: var(--muted); line-height: 1.55; }
	.intro { max-width: 46rem; margin: 0; font-size: 1rem; }
	.hero nav { display: flex; flex-wrap: wrap; gap: .6rem; }
	.logout-form { align-self: start; }
	.notice { margin: 0 0 1rem; padding: .9rem 1rem; border: 1px solid transparent; border-radius: 8px; font-weight: 700; }
	.notice.success { border-color: color-mix(in srgb, var(--accent) 22%, var(--line)); background: var(--accent-soft); color: var(--ui-accent-ink); }
	.notice.error { border-color: color-mix(in srgb, var(--danger) 24%, var(--line)); background: var(--danger-soft); color: var(--danger); }
	.metrics { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 1.75rem; border-block: 1px solid var(--line); }
	.metrics div { display: grid; gap: .15rem; padding: .9rem .35rem; }
	.metrics strong { font-size: 1.65rem; font-variant-numeric: tabular-nums; }
	.metrics span { color: var(--muted); font-size: .8rem; font-weight: 700; }
	.layout, .main-column, .side-column, .class-list { display: grid; gap: 1rem; }
	.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: .15rem; }
	.card {
		padding: clamp(1.1rem, 2.5vw, 1.5rem);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(135deg, var(--surface), var(--accent-soft));
	}
	.create-card, .class-card, .sticky-card { display: grid; gap: 1.15rem; }
	.form-grid, label { display: grid; gap: .45rem; }
	.form-grid { gap: .8rem; }
	label > span, legend { color: var(--muted); font-size: .82rem; font-weight: 700; }
	input, select, .button {
		width: 100%;
		min-height: 2.75rem;
		padding: .65rem .75rem;
		border: 1px solid var(--field-line);
		border-radius: 8px;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 1rem;
	}
	.button { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 750; text-decoration: none; transition: opacity 140ms ease, background-color 140ms ease, border-color 140ms ease; }
	.button:hover:not(:disabled) { opacity: .88; }
	.button.primary { border-color: var(--accent); background: var(--accent); color: var(--ui-on-accent); }
	.button.secondary { border-color: var(--accent); background: transparent; color: var(--ui-accent-ink); }
	.button.danger { border-color: var(--danger); background: transparent; color: var(--danger); }
	.button:disabled { cursor: not-allowed; opacity: .5; }
	:where(a, button, input, select, summary):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
	.class-title-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: start; justify-content: space-between; }
	.class-title-row h3 { margin: .55rem 0 .25rem; color: var(--ink); font-size: 1.35rem; }
	.class-title-row p { margin: 0; color: var(--muted); font-size: .88rem; }
	.class-title-actions { display: grid; gap: .55rem; justify-items: end; }
	.class-title-actions .button { width: auto; }
	code { color: var(--muted); font: .78rem/1.4 ui-monospace, "SFMono-Regular", Consolas, monospace; overflow-wrap: anywhere; }
	.mode-pill { display: inline-flex; padding: .28rem .52rem; border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--line)); border-radius: 999px; background: var(--accent-soft); color: var(--ui-accent-ink); font-size: .7rem; font-weight: 750; }
	.mode-pill.individual { border-color: color-mix(in srgb, #9a6a25 22%, var(--line)); background: var(--warn-soft); color: #815f2e; }
	details { border-block: 1px solid var(--line); padding: .75rem 0; }
	summary { min-height: 2.75rem; display: flex; align-items: center; cursor: pointer; color: var(--ui-accent-ink); font-weight: 750; }
	.inset-form { padding-top: .8rem; }
	.subsection { display: grid; gap: .8rem; padding-top: 1rem; border-top: 1px solid var(--line); }
	.assignment-list, .participant-list, .schedule-list { margin: 0; padding: 0; list-style: none; }
	.assignment-list li, .participant-list li { display: flex; gap: .8rem; align-items: center; justify-content: space-between; padding: .65rem 0; border-bottom: 1px solid var(--line); }
	.assignment-list li:first-child, .participant-list li:first-child { border-top: 1px solid var(--line); }
	.participant-list li > div { display: grid; gap: .15rem; min-width: 0; }
	.participant-list li strong { overflow-wrap: anywhere; }
	.participant-meta { color: var(--muted); font-size: .78rem; overflow-wrap: anywhere; }
	.text-button { min-height: 2.75rem; padding: .4rem 0; border: 0; background: transparent; cursor: pointer; color: var(--ui-accent-ink); font: inherit; font-weight: 700; text-align: right; }
	.text-button:hover { color: var(--ink); }
	.text-button.danger { color: var(--danger); }
	.inline-form { display: grid; gap: .6rem; }
	.schedule-form { display: grid; gap: .85rem; padding: 1rem; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(135deg, var(--surface-soft), var(--surface)); }
	.lesson-form { display: grid; gap: .6rem; }
	.date-grid { display: grid; gap: .7rem; }
	.date-error { color: var(--danger); font-size: .82rem; }
	.admin-shell :global([data-schedule-date-field][aria-invalid="true"]) { border-color: var(--danger); }
	fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
	.weekday-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .4rem; margin-top: .5rem; }
	.weekday-grid label { position: relative; }
	.weekday-grid input { position: absolute; width: 1px; height: 1px; padding: 0; opacity: 0; pointer-events: none; }
	.weekday-grid span { display: grid; min-height: 2.75rem; place-items: center; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); cursor: pointer; transition: background-color 140ms ease, border-color 140ms ease; }
	.weekday-grid input:checked + span { border-color: var(--accent); background: var(--accent); color: var(--ui-on-accent); }
	.weekday-grid input:focus-visible + span { outline: 3px solid var(--accent); outline-offset: 2px; }
	.schedule-list { display: grid; gap: .35rem; color: var(--muted); font-size: .82rem; }
	.lesson-list { display: grid; gap: .65rem; margin: 0; padding: 0; list-style: none; }
	.lesson-row { display: grid; gap: .7rem; padding: .8rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-soft); }
	.lesson-summary { display: grid; gap: .2rem; min-width: 0; }
	.lesson-meta { color: var(--muted); font-size: .75rem; overflow-wrap: anywhere; }
	.lesson-actions { display: grid; gap: .55rem; }
	.lesson-actions .button { width: auto; }
	.delete-form { display: grid; gap: .55rem; padding: 1rem; border: 1px solid color-mix(in srgb, var(--danger) 22%, var(--line)); border-radius: 8px; background: var(--warn-soft); }
	.delete-form p { margin: 0; color: var(--muted); font-size: .82rem; }
	.empty-state { padding: 2.5rem 1rem; border: 1px dashed var(--line); border-radius: var(--radius); text-align: center; background: var(--surface); }
	.empty-state p { margin: .5rem auto 0; max-width: 30rem; color: var(--muted); line-height: 1.5; }
	.invite-block { display: grid; gap: .85rem; padding-top: 1.15rem; border-top: 1px solid var(--line); }
	.invite-block p { margin: 0; }
	.invitation-result { display: grid; gap: .4rem; padding: .85rem; border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--line)); border-radius: 8px; background: var(--accent-soft); }
	.invitation-result span { color: var(--ui-accent-ink); font-weight: 750; overflow-wrap: anywhere; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

	@media (min-width: 42rem) {
		.admin-shell { width: min(calc(100% - 3rem), 80rem); padding-top: 3rem; }
		.hero { grid-template-columns: minmax(0, 1fr) auto auto; align-items: end; }
		.compact-form { grid-template-columns: minmax(0, 1.6fr) minmax(10rem, .8fr) auto; align-items: end; }
		.compact-form .button { width: auto; }
		.date-grid, .inline-form { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; }
		.lesson-form { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
		.lesson-actions { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
		.weekday-grid { grid-template-columns: repeat(7, 1fr); }
	}

	@media (min-width: 64rem) {
		.layout { grid-template-columns: minmax(0, 1.75fr) minmax(18rem, .75fr); gap: 1.5rem; align-items: start; }
		.sticky-card { position: sticky; top: 1.5rem; }
	}

	@media (prefers-reduced-motion: reduce) {
		.button, .weekday-grid span { transition: none; }
	}
</style>
