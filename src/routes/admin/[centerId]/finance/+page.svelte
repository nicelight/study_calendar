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
			student_price_saved: 'Цена ученика сохранена.'
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
			price_operation_failed: 'Не удалось сохранить настройку.'
		}[error] ?? 'Не удалось выполнить операцию.';
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
								<input name="amount" type="number" min="0.01" step="0.01" required value={classView.currentAmount ?? ''} />
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
								<input name="amount" type="number" min="0.01" step="0.01" required disabled={classView.students.length === 0} />
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
</main>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f7f3eb; color: #25332e; font-family: ui-rounded, "SF Pro Rounded", "Segoe UI", sans-serif; }
	.finance-shell { width: min(100% - 2rem, 76rem); margin: 0 auto; padding: 3rem 0 5rem; }
	.hero { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; }
	.hero h1 { margin: .4rem 0 1rem; font-size: clamp(2.8rem, 8vw, 5.5rem); letter-spacing: -.07em; line-height: .95; }
	.hero p:not(.eyebrow), .history-heading p, .empty p { color: #6d7a73; line-height: 1.6; }
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
	@media (max-width: 48rem) { .hero, .class-header, .history-heading { align-items: start; flex-direction: column; } .current-price { text-align: left; } .forms { grid-template-columns: 1fr; } }
</style>
