<script lang="ts">
	import type { AdminFinancePageData } from './+page.server';

	let { data, form }: { data: AdminFinancePageData; form: { error?: string; message?: string } | null } = $props();

	function settingStudentLabel(setting: AdminFinancePageData['classes'][number]['settings'][number]): string {
		if (!setting.studentAccountId) return 'Цена класса · значение по умолчанию';
		for (const classView of data.classes) {
			const student = classView.students.find((candidate) => candidate.accountId === setting.studentAccountId);
			if (student) return `Переопределение · ${student.label}`;
		}
		return `Переопределение · ${setting.studentAccountId}`;
	}

	function messageLabel(message: string): string {
		return {
			class_price_saved: 'Цена класса сохранена.',
			student_price_saved: 'Цена ученика сохранена.',
			payment_edited: 'Платёж изменён.',
			payment_cancelled: 'Платёж отменён.'
		}[message] ?? 'Настройка сохранена.';
	}

	function errorLabel(error: string): string {
		return {
			unauthorized: 'Сессия завершена. Войдите снова.',
			forbidden: 'Недостаточно прав для этой страницы.',
			invalid_price_request: 'Проверьте заполненные поля.',
			invalid_price_amount: 'Укажите положительную сумму.',
			invalid_price_date: 'Укажите корректную дату начала действия.',
			price_forbidden: 'Настройка недоступна для выбранного класса или ученика.',
			price_operation_failed: 'Не удалось сохранить настройку.',
			invalid_payment_request: 'Проверьте данные платежа.',
			invalid_payment_amount: 'Укажите положительную сумму платежа.',
			invalid_payment_date: 'Укажите корректную дату платежа.',
			payment_confirmation_required: 'Подтвердите операцию.',
			payment_forbidden: 'Платёж недоступен в этом центре.',
			payment_not_editable: 'Отменённый платёж нельзя изменить.',
			payment_not_cancellable: 'Этот платёж уже отменён.',
			payment_confirmation_conflict: 'Подтверждение уже связано с другими данными.',
			payment_operation_failed: 'Не удалось изменить платёж.'
		}[error] ?? 'Не удалось выполнить операцию.';
	}

	function paymentStatusLabel(status: 'recorded' | 'cancelled'): string {
		return status === 'recorded' ? 'Проведён' : 'Отменён';
	}

	function auditActionLabel(action: string): string {
		return {
			'payment-created': 'Создан',
			'payment-edited': 'Изменён',
			'payment-cancelled': 'Отменён'
		}[action] ?? action;
	}

	function paymentSnapshot(
		payment: AdminFinancePageData['journal'][number]['audit'][number]['before']
	): string {
		if (!payment) return '—';
		return `${payment.amount} · ${payment.factualDate} · ${paymentStatusLabel(payment.status)}`;
	}

	function paymentSubmissionPayload(form: HTMLFormElement): string {
		const payload = new URLSearchParams();
		for (const [name, value] of new FormData(form).entries()) {
			if (name !== 'confirmation') payload.append(name, String(value));
		}
		return payload.toString();
	}

	function preparePaymentSubmission(event: SubmitEvent): void {
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const confirmation = form.elements.namedItem('confirmation');
		if (!(confirmation instanceof HTMLInputElement)) return;

		const payload = paymentSubmissionPayload(form);
		if (!confirmation.value || form.dataset.confirmationPayload !== payload) {
			confirmation.value = crypto.randomUUID();
			form.dataset.confirmationPayload = payload;
		}
	}
</script>

<svelte:head>
	<title>{data.name} — финансы</title>
	<meta name="description" content="Цены классов и индивидуальные финансовые настройки." />
</svelte:head>

<main class="finance-shell" data-finance-page>
	<header class="hero">
		<div>
			<p class="eyebrow">Protected Admin · {data.centerId}</p>
			<h1>Финансы</h1>
			<p>Настройте цену занятия и проверьте историю изменений для центра «{data.name}».</p>
		</div>
		<nav aria-label="Разделы Admin">
			<a href={`/admin/${data.centerId}`}>Управление центром</a>
		</nav>
	</header>

	{#if form?.message}
		<p class="notice success" role="status">{messageLabel(form.message)}</p>
	{:else if form?.error}
		<p class="notice error" role="alert">{errorLabel(form.error)}</p>
	{/if}

	{#if data.classes.length === 0}
		<section class="empty">
			<h2>Классов пока нет</h2>
			<p>Создайте класс в управлении центром, чтобы настроить цену.</p>
		</section>
	{:else}
		<div class="class-list">
			{#each data.classes as classView (classView.classId)}
				<section class="class-card" data-class-id={classView.classId}>
					<header class="class-header">
						<div>
							<p class="eyebrow">Класс</p>
							<h2>{classView.name}</h2>
							<code>{classView.classId}</code>
						</div>
						<p class="current-price" data-current-payment-default={classView.currentAmount ?? ''}>
							<span>Текущее значение</span>
							<strong>{classView.currentAmount ?? 'Не задано'}</strong>
						</p>
					</header>

					<div class="forms">
						<form method="POST" action="?/setClassPrice" class="price-form" aria-label={`Цена класса ${classView.name}`}>
							<h3>Цена занятия и начальная сумма оплаты</h3>
							<input type="hidden" name="classId" value={classView.classId} />
							<label>
								<span>Сумма</span>
								{#if classView.currentAmount !== null}
									<input name="amount" type="number" min="0.01" step="any" required value={classView.currentAmount} />
								{:else}
									<input name="amount" type="number" min="0.01" step="any" required />
								{/if}
							</label>
							<label>
								<span>Действует с</span>
								<input name="effectiveFrom" type="date" required />
							</label>
							<button type="submit">Сохранить цену класса</button>
						</form>

						<form method="POST" action="?/setStudentPriceOverride" class="price-form" aria-label={`Цена ученика ${classView.name}`}>
							<h3>Цена для ученика</h3>
							<input type="hidden" name="classId" value={classView.classId} />
							<label>
								<span>Ученик</span>
								<select name="studentAccountId" required disabled={classView.students.length === 0}>
									<option value="">Выберите ученика</option>
									{#each classView.students as student}
										<option value={student.accountId}>{student.label}</option>
									{/each}
								</select>
							</label>
							<label>
								<span>Сумма</span>
								<input name="amount" type="number" min="0.01" step="any" required disabled={classView.students.length === 0} />
							</label>
							<label>
								<span>Действует с</span>
								<input name="effectiveFrom" type="date" required disabled={classView.students.length === 0} />
							</label>
							<button type="submit" disabled={classView.students.length === 0}>Сохранить override</button>
						</form>
					</div>

					<div class="history" data-price-history>
						<div class="history-heading">
							<div>
								<p class="eyebrow">Append-only</p>
								<h3>История цен</h3>
							</div>
							<p>Старые настройки и начисления не изменяются.</p>
						</div>
						{#if classView.settings.length > 0}
							<div class="table-wrap">
								<table>
									<thead><tr><th>Область</th><th>Сумма</th><th>Действует с</th><th>Автор</th><th>Создано</th></tr></thead>
									<tbody>
										{#each classView.settings as setting (setting.id)}
											<tr>
												<td>{settingStudentLabel(setting)}</td>
												<td><strong>{setting.amount}</strong></td>
												<td>{setting.effectiveFrom}</td>
												<td>{setting.createdByAccountId}</td>
												<td><time datetime={setting.createdAt}>{setting.createdAt}</time></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p class="empty-history">История пока пуста.</p>
						{/if}
					</div>
				</section>
			{/each}
		</div>
		{/if}

		<section class="journal" data-payment-journal>
			<header class="journal-heading">
				<div>
					<p class="eyebrow">Ledger projection</p>
					<h2>Журнал платежей</h2>
				</div>
				<p>Проведённые и отменённые платежи центра с результатом перерасчёта.</p>
			</header>

			{#if data.journal.length === 0}
				<p class="empty-history">Платежей пока нет.</p>
			{:else}
				<div class="journal-list">
					{#each data.journal as entry (entry.paymentId)}
						<article class="journal-card" data-payment-id={entry.paymentId}>
							<header class="journal-card-heading">
								<div>
									<p class="eyebrow">Платёж</p>
									<h3>{entry.studentLabel}</h3>
									<p>{entry.className} · <code>{entry.paymentId}</code></p>
								</div>
								<strong class:cancelled={entry.status === 'cancelled'} class="payment-status" data-payment-status={entry.status}>
									{paymentStatusLabel(entry.status)}
								</strong>
							</header>

							<dl class="payment-facts">
								<div><dt>Сумма</dt><dd data-payment-amount>{entry.amount}</dd></div>
								<div><dt>Фактическая дата</dt><dd><time datetime={entry.factualDate}>{entry.factualDate}</time></dd></div>
								<div><dt>Баланс</dt><dd data-payment-balance>{entry.balance}</dd></div>
								<div><dt>Аванс</dt><dd data-payment-advance>{entry.advance}</dd></div>
							</dl>

							<div class="journal-details">
								<section>
									<h4>Распределение</h4>
									{#if entry.allocations.length > 0}
										<ul class="fact-list" data-payment-allocations>
											{#each entry.allocations as allocation}
												<li><code>{allocation.lessonId}</code><span>{allocation.amount}</span></li>
											{/each}
										</ul>
									{:else}
										<p class="muted">Нет распределения.</p>
									{/if}
								</section>
								<section>
									<h4>История аудита</h4>
									{#if entry.audit.length > 0}
										<ul class="audit-list" data-payment-audit>
											{#each entry.audit as audit}
												<li>
													<strong>{auditActionLabel(audit.action)}</strong>
													<span>{audit.actorAccountId} · {audit.changedAt}</span>
													<small>До: {paymentSnapshot(audit.before)} · После: {paymentSnapshot(audit.after)}</small>
												</li>
											{/each}
										</ul>
									{:else}
										<p class="muted">Аудит отсутствует.</p>
									{/if}
								</section>
							</div>

							{#if entry.status === 'recorded'}
								<div class="payment-actions">
									<form method="POST" action="?/editPayment" class="payment-form" aria-label={`Изменить платёж ${entry.paymentId}`} onsubmit={preparePaymentSubmission}>
										<h4>Изменить платёж</h4>
										<input type="hidden" name="classId" value={entry.classId} />
										<input type="hidden" name="studentAccountId" value={entry.studentAccountId} />
										<input type="hidden" name="paymentId" value={entry.paymentId} />
										<label><span>Сумма</span><input name="amount" type="number" min="0.01" step="any" required value={entry.amount} /></label>
										<label><span>Фактическая дата</span><input name="factualDate" type="date" required value={entry.factualDate} /></label>
										<label class="confirmation"><input name="confirmation" type="checkbox" value="" required /><span>Подтверждаю изменение платежа</span></label>
										<button type="submit">Сохранить изменение</button>
									</form>
									<form method="POST" action="?/cancelPayment" class="payment-form cancel-form" aria-label={`Отменить платёж ${entry.paymentId}`} onsubmit={preparePaymentSubmission}>
										<h4>Отменить платёж</h4>
										<input type="hidden" name="classId" value={entry.classId} />
										<input type="hidden" name="studentAccountId" value={entry.studentAccountId} />
										<input type="hidden" name="paymentId" value={entry.paymentId} />
										<p>Платёж останется в журнале как отменённый, а распределение будет пересчитано.</p>
										<label class="confirmation"><input name="confirmation" type="checkbox" value="" required /><span>Подтверждаю отмену платежа</span></label>
										<button type="submit">Отменить платёж</button>
									</form>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</main>

<style>
	.finance-shell {
		--surface: var(--ui-surface, #fff);
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
	h3, h4 { margin: 0; letter-spacing: -.02em; }
	h3 { font-size: 1rem; }
	h4 { font-size: .95rem; }
	.hero > div > p:not(.eyebrow), .history-heading p, .journal-heading p, .empty p, .cancel-form p { margin: 0; color: var(--muted); line-height: 1.55; }
	.hero > div > p:not(.eyebrow) { max-width: 48rem; font-size: 1rem; }
	nav { display: flex; flex-wrap: wrap; gap: .6rem; }
	nav a { display: inline-flex; min-height: 2.75rem; align-items: center; padding: .65rem .85rem; border: 1px solid var(--accent); border-radius: 8px; color: var(--ui-accent-ink); font-weight: 750; text-decoration: none; }
	:where(a, button, input, select):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
	.notice { margin: 0 0 1.25rem; padding: .9rem 1rem; border: 1px solid transparent; border-radius: 8px; font-weight: 700; }
	.notice.success { border-color: color-mix(in srgb, var(--accent) 22%, var(--line)); background: var(--accent-soft); color: var(--ui-accent-ink); }
	.notice.error { border-color: color-mix(in srgb, var(--danger) 24%, var(--line)); background: var(--danger-soft); color: var(--danger); }
	.class-list { display: grid; gap: 1rem; min-width: 0; }
	.class-card, .table-wrap, .price-form, .forms, .journal-card { min-width: 0; }
	.class-card, .empty { padding: clamp(1.1rem, 3vw, 1.5rem); border: 1px solid var(--line); border-radius: var(--radius); background: linear-gradient(135deg, var(--surface), var(--accent-soft)); }
	.class-header, .history-heading, .journal-heading, .journal-card-heading { display: flex; flex-direction: column; align-items: start; justify-content: space-between; gap: 1rem; }
	.class-header { padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
	code { color: var(--muted); font: .78rem/1.4 ui-monospace, "SFMono-Regular", Consolas, monospace; overflow-wrap: anywhere; }
	.current-price { display: grid; gap: .25rem; margin: 0; padding: .7rem .85rem; border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--line)); border-radius: 8px; background: var(--accent-soft); text-align: right; }
	.current-price span { color: var(--muted); font-size: .75rem; }
	.current-price strong { color: var(--ui-accent-ink); font-size: 1.2rem; font-variant-numeric: tabular-nums; }
	.forms { display: grid; gap: .85rem; margin-top: 1rem; }
	.price-form { display: grid; gap: .75rem; align-content: start; padding: 1rem; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(135deg, var(--surface), var(--ui-bg, #f7f9fa)); }
	.price-form h3 { margin-bottom: .15rem; }
	.price-form label, .payment-form label:not(.confirmation) { display: grid; gap: .35rem; color: var(--muted); font-size: .82rem; font-weight: 700; }
	.price-form input, .price-form select, .price-form button, .payment-form input[type="number"], .payment-form input[type="date"], .payment-form button {
		width: 100%;
		min-height: 2.75rem;
		padding: .65rem .75rem;
		border: 1px solid var(--field-line);
		border-radius: 8px;
		font: inherit;
		font-size: 1rem;
	}
	.price-form input, .price-form select, .payment-form input[type="number"], .payment-form input[type="date"] { background: var(--surface); color: var(--ink); }
	.price-form button, .payment-form button { border-color: var(--accent); background: var(--accent); color: var(--ui-on-accent); cursor: pointer; font-weight: 750; transition: opacity 140ms ease, background-color 140ms ease; }
	.price-form button:hover:not(:disabled), .payment-form button:hover:not(:disabled) { opacity: .9; }
	.price-form button:disabled, .payment-form button:disabled { cursor: not-allowed; opacity: .5; }
	.history { margin-top: 1.25rem; }
	.history-heading { align-items: end; margin-bottom: .75rem; }
	.history-heading p, .journal-heading p { max-width: 32rem; font-size: .84rem; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
	table { width: 100%; min-width: 42rem; border-collapse: collapse; font-size: .86rem; }
	th, td { padding: .7rem .75rem; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; white-space: nowrap; }
	th { color: var(--ui-accent-ink); font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; }
	th:nth-child(2), td:nth-child(2) { text-align: right; font-variant-numeric: tabular-nums; }
	tbody tr:last-child td { border-bottom: 0; }
	.empty-history { margin: 0; padding: .9rem 1rem; border: 1px dashed var(--field-line); border-radius: 8px; color: var(--muted); }
	.journal { margin-top: 1.5rem; padding: clamp(1.1rem, 3vw, 1.5rem); border: 1px solid var(--line); border-radius: var(--radius); background: linear-gradient(135deg, var(--accent-soft), var(--surface)); }
	.journal-heading { align-items: end; margin-bottom: 1rem; }
	.journal-heading h2 { margin-bottom: 0; }
	.journal-list { display: grid; gap: .85rem; }
	.journal-card { padding: 1rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
	.journal-card-heading h3 { margin-bottom: .2rem; }
	.journal-card-heading p { margin: 0; color: var(--muted); }
	.payment-status { padding: .4rem .65rem; border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--line)); border-radius: 999px; background: var(--accent-soft); color: var(--ui-accent-ink); font-size: .78rem; font-weight: 750; white-space: nowrap; }
	.payment-status.cancelled { border-color: color-mix(in srgb, var(--danger) 24%, var(--line)); background: var(--danger-soft); color: var(--danger); }
	.payment-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; margin: 1rem 0 0; }
	.payment-facts div { padding: .7rem; border: 1px solid var(--line); border-radius: 8px; background: var(--ui-bg, #f7f9fa); }
	.payment-facts dt { color: var(--muted); font-size: .72rem; font-weight: 700; }
	.payment-facts dd { margin: .25rem 0 0; font-weight: 750; font-variant-numeric: tabular-nums; text-align: right; }
	.journal-details { display: grid; gap: .85rem; margin-top: 1rem; }
	.journal-details section { padding-top: .8rem; border-top: 1px solid var(--line); }
	.journal-details h4, .payment-form h4 { margin: 0 0 .6rem; }
	.fact-list, .audit-list { display: grid; gap: .5rem; margin: 0; padding: 0; list-style: none; }
	.fact-list li { display: flex; justify-content: space-between; gap: .75rem; }
	.audit-list li { display: grid; gap: .15rem; padding: .55rem .65rem; border-radius: 6px; background: var(--ui-bg, #f7f9fa); font-size: .8rem; }
	.audit-list span, .audit-list small, .muted { color: var(--muted); }
	.payment-actions { display: grid; gap: .85rem; margin-top: 1rem; }
	.payment-form { display: grid; gap: .7rem; padding: 1rem; border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(135deg, var(--surface), var(--ui-bg, #f7f9fa)); }
	.payment-form input[type="number"], .payment-form input[type="date"] { color: var(--ink); }
	.cancel-form { background: var(--warn-soft); }
	.cancel-form button { border-color: var(--danger); background: var(--danger); color: var(--surface); }
	.confirmation { display: flex; align-items: start; gap: .5rem; color: var(--ink); font-size: .82rem; font-weight: 700; }
	.confirmation input { width: 1.1rem; min-height: 1.1rem; margin-top: .2rem; accent-color: var(--accent); }

	@media (min-width: 42rem) {
		.class-header, .history-heading, .journal-heading, .journal-card-heading { flex-direction: row; }
		.hero { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
		.forms, .payment-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.journal-details { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
		.payment-facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
	}

	@media (prefers-reduced-motion: reduce) {
		.price-form button, .payment-form button { transition: none; }
	}
</style>
