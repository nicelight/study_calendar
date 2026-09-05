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
								<input name="amount" type="number" min="0.01" step="any" required value={classView.currentAmount ?? ''} />
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
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.finance-shell { width: min(100% - 2rem, 76rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.hero { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
	.hero h1 { margin: .4rem 0 1rem; font-size: clamp(2.8rem, 8vw, 5.5rem); letter-spacing: -.07em; line-height: .95; }
	.hero p:not(.eyebrow), .history-heading p, .journal-heading p, .empty p, .cancel-form p { color: #6d7a73; line-height: 1.6; }
	.eyebrow { margin: 0; color: #3f765d; font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	nav { display: flex; flex-wrap: wrap; gap: .65rem; }
	nav a { color: #25332e; font-weight: 800; }
	.notice { margin: 0 0 1.5rem; padding: .85rem 1rem; border-radius: .7rem; font-weight: 800; }
	.notice.success { background: #dcebdd; color: #2f6b4f; }
	.notice.error { background: #f8e2dd; color: #8e3f2b; }
	.class-list { display: grid; gap: 1.5rem; }
	.class-card, .empty { padding: clamp(1rem, 3vw, 2rem); border: 1px solid #d9e0d8; border-radius: 1rem; background: #fffdf8; box-shadow: 0 16px 36px rgba(39, 61, 48, .08); }
	.class-header, .history-heading { display: flex; align-items: start; justify-content: space-between; gap: 1.5rem; }
	.class-header { padding-bottom: 1.25rem; border-bottom: 1px solid #e5e9e2; }
	h2, h3 { margin: .4rem 0 .6rem; letter-spacing: -.035em; }
	code { color: #6d7a73; font-size: .78rem; }
	.current-price { display: grid; gap: .25rem; margin: 0; padding: .75rem 1rem; border-radius: .75rem; background: #e9f2e9; text-align: right; }
	.current-price span { color: #6d7a73; font-size: .75rem; }
	.current-price strong { color: #2f6b4f; font-size: 1.35rem; }
	.forms { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1.5rem; }
	.price-form { display: grid; gap: .8rem; padding: 1rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #f7faf5; }
	.price-form h3 { margin-top: 0; font-size: 1.05rem; }
	.price-form label { display: grid; gap: .35rem; color: #6d7a73; font-size: .8rem; font-weight: 800; }
	.price-form input, .price-form select, .price-form button { min-height: 2.7rem; border: 1px solid #b8c8ba; border-radius: .6rem; padding: .6rem .7rem; font: inherit; }
	.price-form input, .price-form select { background: #fffdf8; color: #25332e; }
	.price-form button { border-color: #3f765d; background: #3f765d; color: white; font-weight: 800; cursor: pointer; }
	.price-form button:disabled { cursor: not-allowed; opacity: .5; }
	.history { margin-top: 1.5rem; }
	.history-heading { align-items: end; }
	.history-heading p { margin: 0; font-size: .85rem; }
	.table-wrap { overflow-x: auto; border: 1px solid #d9e0d8; border-radius: .75rem; }
	table { width: 100%; border-collapse: collapse; font-size: .88rem; }
	th, td { padding: .75rem .8rem; border-bottom: 1px solid #e5e9e2; text-align: left; vertical-align: top; white-space: nowrap; }
	th { color: #3f765d; font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; }
	tbody tr:last-child td { border-bottom: 0; }
	.empty-history { margin: 0; padding: 1rem; border: 1px dashed #b8c8ba; border-radius: .7rem; color: #6d7a73; }
	.journal { margin-top: 2rem; padding: clamp(1rem, 3vw, 2rem); border: 1px solid #d9e0d8; border-radius: 1rem; background: #eff5ed; }
	.journal-heading { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.25rem; }
	.journal-heading h2 { margin-bottom: 0; }
	.journal-heading p { margin: 0; font-size: .85rem; }
	.journal-list { display: grid; gap: 1rem; }
	.journal-card { padding: 1rem; border: 1px solid #d9e0d8; border-radius: .8rem; background: #fffdf8; }
	.journal-card-heading { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
	.journal-card-heading h3 { margin-bottom: .2rem; }
	.journal-card-heading p { margin: 0; color: #6d7a73; }
	.payment-status { padding: .4rem .65rem; border-radius: 999px; background: #dcebdd; color: #2f6b4f; font-size: .78rem; white-space: nowrap; }
	.payment-status.cancelled { background: #f8e2dd; color: #8e3f2b; }
	.payment-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem; margin: 1rem 0 0; }
	.payment-facts div { padding: .7rem; border-radius: .65rem; background: #f3f7f0; }
	.payment-facts dt { color: #6d7a73; font-size: .72rem; font-weight: 800; }
	.payment-facts dd { margin: .25rem 0 0; font-weight: 800; }
	.journal-details { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 1rem; margin-top: 1rem; }
	.journal-details section { padding-top: .8rem; border-top: 1px solid #e5e9e2; }
	.journal-details h4, .payment-form h4 { margin: 0 0 .6rem; letter-spacing: -.02em; }
	.fact-list, .audit-list { display: grid; gap: .5rem; margin: 0; padding: 0; list-style: none; }
	.fact-list li { display: flex; justify-content: space-between; gap: .75rem; }
	.audit-list li { display: grid; gap: .15rem; padding: .5rem .65rem; border-radius: .55rem; background: #f3f7f0; font-size: .8rem; }
	.audit-list span, .audit-list small, .muted { color: #6d7a73; }
	.payment-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
	.payment-form { display: grid; gap: .7rem; padding: 1rem; border: 1px solid #d9e0d8; border-radius: .7rem; background: #f7faf5; }
	.payment-form label:not(.confirmation) { display: grid; gap: .35rem; color: #6d7a73; font-size: .8rem; font-weight: 800; }
	.payment-form input[type="number"], .payment-form input[type="date"], .payment-form button { min-height: 2.6rem; border: 1px solid #b8c8ba; border-radius: .6rem; padding: .6rem .7rem; font: inherit; }
	.payment-form input[type="number"], .payment-form input[type="date"] { background: #fffdf8; color: #25332e; }
	.payment-form button { border-color: #3f765d; background: #3f765d; color: white; font-weight: 800; cursor: pointer; }
	.cancel-form button { border-color: #a94d36; background: #a94d36; }
	.confirmation { display: flex; align-items: start; gap: .5rem; color: #25332e; font-size: .8rem; font-weight: 700; }
	.confirmation input { margin-top: .15rem; }
	@media (max-width: 48rem) { .hero, .class-header, .history-heading, .journal-heading, .journal-card-heading { align-items: start; flex-direction: column; } .current-price { text-align: left; } .forms, .payment-actions, .journal-details { grid-template-columns: 1fr; } .payment-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
