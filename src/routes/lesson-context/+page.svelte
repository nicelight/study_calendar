<script lang="ts">
	import { page } from '$app/state';
	import { formatDateInput, formatDisplayDate, parseDisplayDate } from '$lib/date-input';

	let { data, form }: { data: any; form: any } = $props();
	let context = $derived(data.dayContext);
	let lesson = $derived(data.lesson);
	let material = $derived(context?.material ?? null);
	let attendance = $derived(data.attendance ?? lesson?.attendance ?? null);
	let payment = $derived(data.payment ?? null);
	let homeworkProgress = $derived(context?.homeworkProgress ?? null);
	let discussion = $derived(context?.discussion ?? null);
	let branchRootId = $derived.by(() => {
		try {
			return page.url.searchParams.get('branchRootId');
		} catch {
			return null;
		}
	});

	const fieldKeys = ['topic', 'practicalWork', 'homework'] as const;
	const reactionTypes = ['like', 'love', 'laugh', 'celebrate', 'question'] as const;
	const fieldLabels: Record<string, string> = {
		topic: 'Тема занятия',
		practicalWork: 'Практическая работа',
		homework: 'Домашнее задание'
	};
	const reactionLabels: Record<string, string> = {
		like: 'Нравится',
		love: 'Любовь',
		laugh: 'Смешно',
		celebrate: 'Праздник',
		question: 'Вопрос'
	};

	function studentLabel(studentAccountId: string): string {
		return data.studentLabels?.[studentAccountId] ?? 'Ученик без ФИО';
	}

	function contextHref(current: any, studentAccountId?: string | null): string {
		const params = new URLSearchParams({
			date: current.navigation.date,
			classId: current.navigation.classId,
			lessonId: current.navigation.lessonId
		});
		if (studentAccountId) params.set('studentAccountId', studentAccountId);
		return `/lesson-context?${params.toString()}`;
	}

	function actionHref(action: string): string {
		const classId = context?.navigation.classId ?? lesson?.classId;
		const lessonId = context?.navigation.lessonId ?? lesson?.lessonId;
		if (!classId || !lessonId) return `?/${action}`;
		const params = new URLSearchParams({ classId, lessonId });
		const studentAccountId = context?.navigation.studentAccountId;
		if (studentAccountId) params.set('studentAccountId', studentAccountId);
		if (branchRootId) params.set('branchRootId', branchRootId);
		return `?${params.toString()}&/${action}`;
	}

	function branchHref(rootMessageId: string): string {
		if (!context) return '#';
		const params = new URLSearchParams({
			date: context.navigation.date,
			classId: context.navigation.classId,
			lessonId: context.navigation.lessonId,
			branchRootId: rootMessageId
		});
		if (context.navigation.studentAccountId) params.set('studentAccountId', context.navigation.studentAccountId);
		return `/lesson-context?${params.toString()}`;
	}

	function scopeFor(current: any): 'shared' | 'personal' {
		return current?.mode === 'personal' ? 'personal' : 'shared';
	}

	function fieldComments(fieldKey: string): any[] {
		return discussion?.fieldComments?.[fieldKey] ?? [];
	}

	function fieldReactions(fieldKey: string): any[] {
		return discussion?.fieldReactions?.[fieldKey] ?? [];
	}

	function messages(): any[] {
		return discussion?.commonMessages ?? [];
	}

	function branchMessages(rootMessageId: string): any[] {
		return discussion?.branchMessages?.[rootMessageId] ?? [];
	}

	function messageDepth(message: any, allMessages: any[]): number {
		const byId = new Map(allMessages.map((candidate) => [candidate.messageId, candidate]));
		const visited = new Set<string>();
		let current = message;
		let depth = 0;
		while (current.parentMessageId && !visited.has(current.messageId)) {
			visited.add(current.messageId);
			const parent = byId.get(current.parentMessageId);
			if (!parent) break;
			depth += 1;
			current = parent;
		}
		return depth;
	}

	function reactionNames(reactions: any[]): string {
		return reactions.map((reaction) => `${reactionLabels[reaction.reaction] ?? reaction.reaction}: ${reaction.reactorLabel}`).join(', ');
	}

	function statusLabel(status: 'planned' | 'completed' | 'cancelled'): string {
		return { planned: 'Запланировано', completed: 'Завершено', cancelled: 'Отменено' }[status];
	}

	function errorLabel(error: string): string {
		return {
			invalid_request: 'Проверьте данные формы.',
			invalid_material: 'Заполните все поля материала.',
			forbidden: 'У вас нет права редактировать материал этого урока.',
			operation_failed: 'Не удалось сохранить материал.'
		}[error] ?? 'Не удалось выполнить операцию.';
	}

	function collaborationError(error: string): string {
		return {
			collaboration_invalid: 'Проверьте данные комментария.',
			comment_already_exists: 'Комментарий для этого поля уже существует.',
			comment_forbidden: 'Комментарий недоступен в текущем контексте.',
			comment_failed: 'Не удалось сохранить комментарий.',
			reaction_forbidden: 'Реакция недоступна в текущем контексте.',
			reaction_invalid: 'Проверьте выбранную реакцию.',
			reaction_failed: 'Не удалось сохранить реакцию.',
			message_forbidden: 'Сообщение недоступно в текущем контексте.',
			message_invalid: 'Проверьте текст сообщения.',
			message_failed: 'Не удалось сохранить сообщение.',
			reply_forbidden: 'Ответ недоступен в текущем контексте.',
			reply_invalid: 'Проверьте текст ответа.',
			reply_failed: 'Не удалось сохранить ответ.'
		}[error] ?? 'Не удалось выполнить действие.';
	}

	function paymentErrorLabel(error: string): string {
		return {
			invalid_payment_request: 'Проверьте данные формы оплаты.',
			invalid_payment_amount: 'Укажите положительную сумму.',
			invalid_payment_date: 'Укажите корректную фактическую дату.',
			invalid_payment_confirmation: 'Введите подтверждение операции.',
			payment_forbidden: 'У вас нет права внести эту оплату.',
			payment_operation_failed: 'Не удалось внести оплату.'
		}[error] ?? 'Не удалось внести оплату.';
	}

	function attendanceErrorLabel(error: string): string {
		return {
			invalid_attendance_request: 'Проверьте список отсутствующих учеников.',
			attendance_forbidden: 'У вас нет права отмечать посещаемость этого урока.',
			attendance_operation_failed: 'Не удалось сохранить посещаемость.'
		}[error] ?? 'Не удалось сохранить посещаемость.';
	}

	function gradeFor(studentAccountId: string): string {
		return homeworkProgress?.grades?.find((entry: any) => entry.studentAccountId === studentAccountId)?.grade ?? '';
	}

	function completionStatus(completed: boolean): string {
		return completed ? 'Выполнено' : 'Не выполнено';
	}

	function syncPaymentDate(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		const hiddenInput = input.form?.querySelector<HTMLInputElement>('input[type="hidden"][name="factualDate"]');
		if (!hiddenInput) return;
		const inputEvent = event as InputEvent;
		input.value = formatDateInput(input.value, inputEvent.inputType ?? '');
		const isoDate = parseDisplayDate(input.value);
		input.setCustomValidity(input.value !== '' && isoDate === null ? 'Введите существующую дату в формате dd.mm.yyyy.' : '');
		input.setAttribute('aria-invalid', input.value !== '' && isoDate === null ? 'true' : 'false');
		hiddenInput.value = isoDate ?? '';
	}

	function ensureId(event: SubmitEvent): void {
		const formElement = event.target instanceof HTMLFormElement
			? event.target
			: event.currentTarget as HTMLFormElement;
		const idInput = formElement.querySelector<HTMLInputElement>('input[name="commentId"], input[name="messageId"]');
		if (idInput && !idInput.value) idInput.value = globalThis.crypto.randomUUID();
	}
</script>

<svelte:head>
	<title>Study Calendar — день занятия</title>
	<meta name="description" content="Общий и личный контекст выбранного занятия." />
</svelte:head>

<main class="context-shell">
	{#if context}
		<header class="context-header">
			<div>
				<p class="eyebrow">{context.lesson.className}</p>
				<h1>{formatDisplayDate(context.lesson.lessonDate)}</h1>
				<p class="identity-line">Общий контекст занятия в классе «{context.lesson.className}»</p>
			</div>
			<nav aria-label="Контекст дня">
				<a href={contextHref(context)}>Общий день</a>
				{#if context.navigation.studentAccountId}
					<a href={contextHref(context, context.navigation.studentAccountId)}>Личный день</a>
				{/if}
			</nav>
		</header>

		<section class="material" aria-labelledby="material-title">
			<div class="section-label">Общий материал</div>
			<h2 id="material-title">{context.material.topic}</h2>
			<dl>
				<div><dt>Практическая работа</dt><dd>{context.material.practicalWork}</dd></div>
				<div><dt>Домашнее задание</dt><dd>{context.material.homework}</dd></div>
			</dl>
		</section>

		<section class="homework" aria-labelledby="homework-title">
			<div class="section-label">Домашнее задание</div>
			{#if homeworkProgress?.homework}
				<h2 id="homework-title">{homeworkProgress.homework.title}</h2>
				{#if form?.homeworkSuccess}<p class="form-message success" role="status">Изменение домашнего задания сохранено.</p>{/if}
				{#if context.personal && context.personal.progress.completion && !context.personal.progress.completion.completed}
					<form method="POST" action={actionHref('completeHomework')} class="homework-completion-form"><button type="submit">Отметить выполненным</button></form>
				{/if}
				<div class="homework-statuses" aria-label="Статусы выполнения класса">
					<h3>Статусы класса</h3>
					{#each homeworkProgress.completions as completion}
						<div class="homework-row" data-homework-completion={completion.studentAccountId}>
							<div><strong>{studentLabel(completion.studentAccountId)}</strong><span>{completionStatus(completion.completed)}</span></div>
							{#if data.canEditMaterial}
								<form method="POST" action={actionHref('recordGrade')} class="grade-form" aria-label={`Оценка для ${studentLabel(completion.studentAccountId)}`}>
									<input type="hidden" name="studentAccountId" value={completion.studentAccountId} />
									<label><span>Оценка</span><select name="grade" required value={gradeFor(completion.studentAccountId)}><option value="" disabled>Выберите</option><option value="α">α</option><option value="β">β</option><option value="γ">γ</option><option value="F">F</option></select></label>
									<button type="submit">Сохранить оценку</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			{:else if data.canEditMaterial}
				<h2 id="homework-title">Домашнее задание ещё не создано</h2>
				<p class="editor-intro">Создайте один элемент из домашнего задания общего материала.</p>
				{#if form?.homeworkSuccess}<p class="form-message success" role="status">Изменение домашнего задания сохранено.</p>{/if}
				<form method="POST" action={actionHref('createHomework')} class="homework-create-form" aria-label="Создать домашнее задание"><button type="submit">Создать домашнее задание</button></form>
			{:else}
				<h2 id="homework-title">Домашнее задание ещё не создано</h2><p class="editor-intro">Домашнее задание пока недоступно.</p>
			{/if}
		</section>

		{#if context.personal}
			<section class="personal" aria-labelledby="personal-title">
				<div class="section-label">Личный контекст</div>
				<h2 id="personal-title">Ученик {studentLabel(context.personal.studentAccountId)}</h2>
				<p>Посещаемость: {context.personal.progress.attendance.attendance}</p>
				{#if context.personal.progress.grade}<p>Оценка: {context.personal.progress.grade.grade}</p>{:else}<p>Оценка: пока не выставлена</p>{/if}
				<p>Личная дискуссия: {context.personal.discussion.commonMessages?.length ?? 0} сообщений</p>
				<p>Баланс: {context.personal.financial.balance.balance}</p>
			</section>
		{:else}
			<section class="shared" aria-labelledby="shared-title"><div class="section-label">Класс</div><h2 id="shared-title">Общий день доступен в рамках разрешённого класса</h2><p>Личные оценки, обсуждения и финансовые данные здесь не раскрываются.</p></section>
		{/if}

		<section class="collaboration" aria-labelledby="collaboration-title">
			<div class="section-label">Collaboration</div>
			<h2 id="collaboration-title">Обсуждение {context.mode === 'personal' ? 'ученика' : 'класса'}</h2>
			{#if form?.error && (form.error.includes('comment') || form.error.includes('reaction') || form.error.includes('message') || form.error.includes('reply'))}<p class="form-message error" role="alert">{collaborationError(form.error)}</p>{/if}
			<div class="field-grid">
				{#each fieldKeys as fieldKey}
						<article class="field-card" data-field-key={fieldKey}>
							<header><h3>{fieldLabels[fieldKey]}</h3>{@render ReactionForm('field', fieldKey, fieldReactions(fieldKey))}</header>
						{#each fieldComments(fieldKey) as comment (comment.commentId)}
							<div class="comment" data-comment-id={comment.commentId}>
								<p>{comment.body}</p><small>{comment.authorLabel} · <time datetime={comment.lastChangedAt}>{comment.lastChangedAt}</time></small>
									<div class="comment-actions">{@render ReactionForm('comment', comment.commentId, comment.reactions)}<form method="POST" action={actionHref('editFieldComment')} class="inline-form"><input type="hidden" name="commentId" value={comment.commentId} /><input name="body" value={comment.body} required aria-label="Текст комментария" /><button type="submit">Изменить</button></form></div>
							</div>
						{/each}
						<form method="POST" action={actionHref('createFieldComment')} class="comment-create" onsubmit={(event) => ensureId(event)}>
							<input type="hidden" name="scope" value={scopeFor(context)} />
							{#if context.navigation.studentAccountId}<input type="hidden" name="studentAccountId" value={context.navigation.studentAccountId} />{/if}
							<input type="hidden" name="fieldKey" value={fieldKey} /><input type="hidden" name="commentId" value="" />
							<input name="body" placeholder="Добавить комментарий" required aria-label={`Комментарий: ${fieldLabels[fieldKey]}`} /><button type="submit">Добавить</button>
						</form>
					</article>
				{/each}
			</div>

			<section class="feed" aria-labelledby="feed-title">
					<header><div><h3 id="feed-title">Общий feed</h3><p>Сообщения текущего разрешённого контекста.</p></div></header>
					{#each messages().filter((message) => message.parentMessageId === null) as message (message.messageId)}
						{@render MessageCard(message, messages())}
					{/each}
				<form method="POST" action={actionHref('createMessage')} class="message-create" onsubmit={(event) => ensureId(event)}>
					<input type="hidden" name="scope" value={scopeFor(context)} />
					{#if context.navigation.studentAccountId}<input type="hidden" name="studentAccountId" value={context.navigation.studentAccountId} />{/if}
					<input type="hidden" name="messageId" value="" /><textarea name="body" rows="3" placeholder="Новое сообщение" required></textarea><button type="submit">Опубликовать</button>
				</form>
				{#if discussion?.recentBranchTabs?.length}
						<nav class="branches" aria-label="Ветки обсуждения"><strong>Ветки</strong>{#each discussion.recentBranchTabs as branch (branch.rootMessageId)}<a href={branchHref(branch.rootMessageId)} data-branch-id={branch.rootMessageId} aria-current={branchRootId === branch.rootMessageId ? 'page' : undefined}>Ветка · {branch.messageCount}</a>{/each}</nav>
						{#if branchRootId && branchMessages(branchRootId).length}
							<section class="branch" data-selected-branch={branchRootId} aria-labelledby="selected-branch-title">
								<h4 id="selected-branch-title">Выбранная ветка</h4>
								{#each branchMessages(branchRootId).filter((message) => message.parentMessageId === null) as message (message.messageId)}
									{@render MessageCard(message, branchMessages(branchRootId))}
								{/each}
							</section>
						{:else if branchRootId}
							<p class="participants">Ветка больше не входит в десять последних; её сообщения сохранены в общей ленте.</p>
						{/if}
				{/if}
			</section>
		</section>
	{:else if lesson}
		<header class="context-header"><div><p class="eyebrow">{lesson.className}</p><h1>{formatDisplayDate(lesson.lessonDate)}</h1><p class="identity-line">Занятие в классе «{lesson.className}»</p></div><p class="status">{statusLabel(lesson.status)}</p></header>
		<section class="empty"><div class="section-label">Урок открыт</div><h2>Материал пока не добавлен</h2><p>Доступ к уроку есть. Общий материал, домашнее задание и практическая работа появятся здесь после заполнения.</p></section>
	{:else}
		<section class="empty"><p class="eyebrow">Lesson Context</p><h1>Выберите занятие</h1><p>Передайте дату, класс и lesson identity через URL календаря.</p></section>
	{/if}

	{#if data.canEditAttendance && attendance}
		<section class="attendance-editor"><div class="section-label">Посещаемость</div><h2>Отметить отсутствующих</h2><p class="editor-intro">Поставьте минус отсутствующим. Все остальные ученики будут сохранены как присутствующие.</p>{#if form?.attendanceSuccess}<p class="form-message success" role="status">Посещаемость сохранена.</p>{:else if form?.error}<p class="form-message error" role="alert">{attendanceErrorLabel(form.error)}</p>{/if}<form method="POST" action={actionHref('saveAttendance')} class="attendance-form" aria-label="Посещаемость урока">{#each attendance as entry}<label class="attendance-row"><input type="checkbox" name="absentStudentAccountId" value={entry.studentAccountId} checked={entry.attendance === 'absent' && entry.recordedAt !== null} /><span>{studentLabel(entry.studentAccountId)}</span><span class="attendance-hint">минус</span></label>{/each}<button type="submit">Сохранить посещаемость</button></form></section>
	{/if}

	{#if data.canEditMaterial && (context || lesson)}
		<section class="material-editor"><div class="section-label">Материал занятия</div><h2>{material ? 'Изменить материал' : 'Заполнить занятие'}</h2><p class="editor-intro">Эти данные будут видны участникам класса в общем контексте урока.</p>{#if form?.success}<p class="form-message success" role="status">Материал сохранён.</p>{:else if form?.error}<p class="form-message error" role="alert">{errorLabel(form.error)}</p>{/if}<form method="POST" action={actionHref('setSharedLessonMaterial')} class="material-form" aria-label="Материал занятия"><label><span>Тема занятия</span><input name="topic" required value={material?.topic ?? ''} /></label><label><span>Практическая работа</span><textarea name="practicalWork" required rows="3">{material?.practicalWork ?? ''}</textarea></label><label><span>Домашнее задание</span><textarea name="homework" required rows="3">{material?.homework ?? ''}</textarea></label><button type="submit">Сохранить материал</button></form></section>
	{/if}

	{#if data.canCreatePayment && payment}
		<section class="payment-editor"><div class="section-label">Финансы</div><h2>Внести оплату</h2><p class="editor-intro">Оплата будет зачислена выбранному ученику через финансовый ledger.</p>{#if form?.paymentSuccess}<p class="form-message success" role="status">Оплата внесена.</p>{:else if form?.error}<p class="form-message error" role="alert">{paymentErrorLabel(form.error)}</p>{/if}<form method="POST" action={actionHref('createPayment')} class="material-form" aria-label="Оплата занятия"><label><span>Ученик</span><select name="studentAccountId" required>{#each payment.studentAccountIds as studentAccountId}<option value={studentAccountId}>{studentLabel(studentAccountId)}</option>{/each}</select></label><label><span>Сумма</span><input name="amount" type="number" min="0.01" step="any" required value={payment.defaultAmount ?? ''} /></label><label><span>Фактическая дата (дд.мм.гггг)</span><input type="hidden" name="factualDate" value={payment.factualDate} /><input type="text" inputmode="numeric" maxlength="10" placeholder="дд.мм.гггг" pattern={'[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}'} value={formatDisplayDate(payment.factualDate)} required aria-invalid="false" oninput={syncPaymentDate} onchange={syncPaymentDate} /></label><label><span>Подтверждение операции</span><input name="confirmation" required placeholder="Например, payment-2026-08-10" /></label><button type="submit">Внести оплату</button></form></section>
	{/if}
</main>

{#snippet MessageCard(message: any, allMessages: any[])}
	<article
		class:reply={message.parentMessageId !== null}
		class="message"
		data-message-id={message.messageId}
		data-message-depth={messageDepth(message, allMessages)}
		style={`--thread-depth: ${messageDepth(message, allMessages)}`}
	>
		<p>{message.body}</p><small>{message.authorLabel} · <time datetime={message.createdAt}>{message.createdAt}</time></small>
		{@render ReactionForm('message', message.messageId, message.reactions)}
		<form method="POST" action={actionHref('replyToMessage')} class="reply-form" onsubmit={(event) => ensureId(event)}>
			<input type="hidden" name="scope" value={scopeFor(context)} />
			{#if context?.navigation.studentAccountId}<input type="hidden" name="studentAccountId" value={context.navigation.studentAccountId} />{/if}
			<input type="hidden" name="parentMessageId" value={message.messageId} /><input type="hidden" name="messageId" value="" />
			<input name="body" placeholder="Ответить" required aria-label={`Ответ на ${message.authorLabel}`} /><button type="submit">Ответить</button>
		</form>
		{#each allMessages.filter((candidate) => candidate.parentMessageId === message.messageId) as child (child.messageId)}
			{@render MessageCard(child, allMessages)}
		{/each}
	</article>
{/snippet}

{#snippet ReactionForm(targetType: string, targetId: string, targetReactions: any[] = [])}
	<form method="POST" action={actionHref('setReaction')} class="reaction-form" aria-label={`Реакции: ${targetId}`}>
		<input type="hidden" name="scope" value={scopeFor(context)} />
		{#if context?.navigation.studentAccountId}<input type="hidden" name="studentAccountId" value={context.navigation.studentAccountId} />{/if}
		<input type="hidden" name="targetType" value={targetType} /><input type="hidden" name="targetId" value={targetId} />
		<select name="reaction" aria-label="Выбрать реакцию">{#each reactionTypes as reaction}<option value={reaction}>{reactionLabels[reaction]}</option>{/each}</select><button type="submit">React</button>
	</form>
	{#if targetReactions.length}<p class="participants" data-reaction-participants>{reactionNames(targetReactions)}</p>{/if}
{/snippet}

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.context-shell { width: min(100% - 2rem, 66rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.context-header { display: flex; align-items: end; justify-content: space-between; gap: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #d9e0d8; }
	.context-header h1, .empty h1 { margin: 0; font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -0.07em; line-height: .95; }
	.eyebrow, .section-label { color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	.identity-line { color: #6d7a73; }
	nav { display: flex; flex-wrap: wrap; gap: .65rem; } nav a { padding: .65rem .85rem; border: 1px solid #d9e0d8; border-radius: .65rem; color: #25332e; font-weight: 800; text-decoration: none; }
	.material, .personal, .shared, .empty, .collaboration { margin-top: 2rem; padding: 1.5rem; border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; }
	.homework, .material-editor, .attendance-editor, .payment-editor { display: grid; gap: 1rem; margin-top: 2rem; padding: 1.5rem; border: 1px solid #b8c8ba; border-radius: 1rem; background: #f4f8f0; }
	.payment-editor { border-color: #d6bd8d; background: #fff6e8; }
	h2 { margin: .4rem 0 1rem; letter-spacing: -.03em; } h3 { margin: .2rem 0 .6rem; }
	dl { display: grid; gap: 1rem; margin: 0; } dl div { display: grid; gap: .25rem; } dt { color: #6d7a73; font-size: .78rem; font-weight: 800; text-transform: uppercase; } dd { margin: 0; font-size: 1.1rem; }
	.personal { background: #e9f2e9; } .shared p, .empty p, .editor-intro { color: #6d7a73; line-height: 1.6; }
	.homework-statuses, .attendance-form, .material-form, .field-grid, .feed { display: grid; gap: .8rem; } .homework-statuses h3 { margin: .5rem 0 0; }
	.homework-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem); align-items: center; gap: 1rem; padding: .8rem; border: 1px solid #d9e0d8; border-radius: .65rem; background: #fffdf8; }
	.homework-row > div:first-child { display: grid; gap: .25rem; } .homework-row > div:first-child span { color: #6d7a73; font-size: .85rem; }
	.homework-completion-form, .homework-create-form, .grade-form, .inline-form, .reaction-form, .comment-create, .reply-form { display: flex; gap: .55rem; align-items: end; }
	.grade-form label, .material-form label { display: grid; flex: 1; gap: .35rem; } .grade-form label span, .material-form label span { color: #6d7a73; font-size: .78rem; font-weight: 800; }
	.material-form input, .material-form textarea, .material-form select, .grade-form select, .comment-create input, .inline-form input, .reply-form input, .message-create textarea, .reaction-form select { width: 100%; border: 1px solid #b8c8ba; border-radius: .65rem; padding: .7rem .8rem; background: #fffdf8; color: #25332e; font: inherit; }
	.material-form textarea, .message-create textarea { resize: vertical; }
	button { min-height: 2.65rem; border: 1px solid #3f765d; border-radius: .65rem; padding: 0 .9rem; background: #3f765d; color: #fffdf8; font: inherit; font-weight: 800; cursor: pointer; }
	.attendance-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .7rem; padding: .7rem .8rem; border: 1px solid #d9e0d8; border-radius: .65rem; background: #fffdf8; } .attendance-row input { width: 1.1rem; height: 1.1rem; accent-color: #3f765d; } .attendance-hint, small, .participants { color: #6d7a73; font-size: .78rem; }
	.form-message { margin: 0; padding: .7rem .8rem; border-radius: .6rem; font-weight: 800; } .form-message.success { background: #dcebdd; color: #2f6b4f; } .form-message.error { background: #f8e2dd; color: #8e3f2b; }
	.field-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .field-card, .feed { padding: 1rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #f8fbf6; } .field-card header, .feed > header { display: flex; justify-content: space-between; align-items: start; gap: .75rem; } .field-card header h3 { flex: 1; }
	.comment, .message { display: grid; gap: .35rem; margin-top: .7rem; padding: .75rem; border-left: 3px solid #9abda7; background: #fffdf8; } .comment p, .message p { margin: 0; line-height: 1.45; } .comment-actions { display: grid; gap: .45rem; } .comment-create, .message-create, .reply-form { margin-top: .75rem; } .message.reply { margin-left: calc(1.5rem + (var(--thread-depth, 0) * 1rem)); }
	.reaction-form { align-items: stretch; } .reaction-form select { min-width: 7rem; padding: .45rem; } .reaction-form button { min-height: 2.2rem; padding: 0 .6rem; } .participants { margin: 0; }
	.branches { align-items: center; margin-top: 1rem; } .branch { margin-top: .6rem; padding: .7rem; border: 1px solid #d9e0d8; border-radius: .6rem; background: #fffdf8; } .branch p { margin: .45rem 0; }
	@media (max-width: 48rem) { .context-header { align-items: start; flex-direction: column; } .field-grid { grid-template-columns: 1fr; } .homework-row { grid-template-columns: 1fr; } .grade-form { align-items: stretch; flex-direction: column; } }
</style>
