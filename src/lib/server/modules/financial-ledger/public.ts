import type {
	ActorContext,
	IdentityAccessBoundary
} from '$lib/server/modules/identity-access/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export type FinancialClassScope = {
	centerId: string;
	classId: string;
	studentAccountIds: string[];
};

export type FinancialLessonFacts = {
	centerId: string;
	classId: string;
	lessonId: string;
	studentAccountId: string;
	lessonDate: string;
};

export interface FinancialScopePort {
	getFinancialClassScope(
		actor: ActorContext,
		classId: string,
		studentAccountId?: string
	): FinancialClassScope | null;
	getFinancialLessonFacts(
		actor: ActorContext,
		lessonId: string,
		studentAccountId: string
	): FinancialLessonFacts | null;
	getFinancialLessonDates?(actor: ActorContext, classId: string): string[] | null;
}

export type ChargeView = {
	centerId: string;
	classId: string;
	lessonId: string;
	studentAccountId: string;
	lessonDate: string;
	appliedPrice: string;
	status: 'active' | 'cancelled';
	createdAt: string;
	cancelledAt: string | null;
};

export type FinancialAuditView = {
	action: 'charge-created' | 'charge-cancelled' | 'charge-reactivated';
	actorAccountId: string;
	changedAt: string;
	before: ChargeView | null;
	after: ChargeView | null;
};

export type PaymentAllocationView = {
	paymentId: string;
	lessonId: string;
	amount: string;
};

export type ChargeReplayView = {
	charges: ChargeView[];
	balance: string;
	allocations: PaymentAllocationView[];
	audit: FinancialAuditView[];
};

export type PaymentView = {
	id: string;
	centerId: string;
	classId: string;
	studentAccountId: string;
	amount: string;
	factualDate: string;
	status: 'recorded' | 'cancelled';
	createdByAccountId: string;
	createdAt: string;
};

export type PaymentAuditView = {
	action: 'payment-created' | 'payment-edited' | 'payment-cancelled';
	actorAccountId: string;
	changedAt: string;
	before: PaymentView | null;
	after: PaymentView;
};

export type PaymentMarkerView = {
	paymentId: string;
	markerDate: string;
	factualDate: string;
	amount: string;
};

export type FinancialProjectionRange = {
	from?: string;
	to?: string;
};

export type BalanceProjectionView = {
	charges: Array<{
		lessonId: string;
		state: 'open' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
		allocatedAmount: string;
		remainingAmount: string;
	}>;
	balance: string;
	advance: string;
	allocations: PaymentAllocationView[];
	payments: PaymentView[];
	audit: PaymentAuditView[];
};

type PriceSettingRequest = {
	sessionToken?: string;
	classId: string;
	amount: string;
	effectiveFrom: string;
};

type ChargeRow = {
	center_id: string;
	class_id: string;
	lesson_id: string;
	student_account_id: string;
	lesson_date: string;
	applied_price: string;
	status: 'active' | 'cancelled';
	created_at: string;
	cancelled_at: string | null;
};

type AuditRow = {
	action: FinancialAuditView['action'];
	actor_account_id: string;
	changed_at: string;
	before_state: string | null;
	after_state: string | null;
};

type PaymentRow = {
	id: string;
	amount: string;
	factual_date: string;
};

type AllocationRow = {
	payment_id: string;
	lesson_id: string;
	amount: string;
	payment_factual_date: string;
	lesson_date: string;
};

type PaymentDbRow = {
	id: string;
	center_id: string;
	class_id: string;
	student_account_id: string;
	amount: string;
	factual_date: string;
	status: 'recorded' | 'cancelled';
	created_by_account_id: string;
	created_at: string;
};

type PaymentCommandRow = {
	actor_account_id: string;
	operation: 'create' | 'edit' | 'cancel';
	confirmation: string;
	payment_id: string;
	payload: string;
};

type PaymentAuditRow = {
	action: PaymentAuditView['action'];
	actor_account_id: string;
	changed_at: string;
	before_state: string | null;
	after_state: string;
};

type FinancialLedgerOptions = {
	now?: () => Date;
};

export class FinancialLedgerBoundary {
	private readonly now: () => Date;

	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: Pick<IdentityAccessBoundary, 'resolveActor'>,
		private readonly scope: FinancialScopePort,
		options: FinancialLedgerOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
	}

	setClassPrice(request: PriceSettingRequest): void {
		this.setPrice(request);
	}

	setStudentPriceOverride(
		request: PriceSettingRequest & { studentAccountId: string }
	): void {
		this.setPrice(request, request.studentAccountId);
	}

	reconcileLessonCharge(request: {
		sessionToken?: string;
		lessonId: string;
		studentAccountId: string;
		attendanceTransition: {
			from: 'present' | 'absent';
			to: 'present' | 'absent';
		};
	}): ChargeReplayView {
		const reconcile = () => {
			const actor = this.requireActor(request.sessionToken);
			if (actor.role !== 'admin' && actor.role !== 'teacher') {
				throw new Error('not-authorized');
			}

			const lesson = this.scope.getFinancialLessonFacts(
				actor,
				request.lessonId,
				request.studentAccountId
			);
			if (
				!lesson ||
				lesson.lessonId !== request.lessonId ||
				lesson.studentAccountId !== request.studentAccountId
			) {
				throw new Error('not-authorized');
			}
			this.requireIsoDate(lesson.lessonDate);

			if (
				request.attendanceTransition.from !== request.attendanceTransition.to &&
				this.applyAttendanceTarget(actor, lesson, request.attendanceTransition.to)
			) {
				this.recomputeAllocations(lesson.classId, lesson.studentAccountId);
			}

			return this.getChargeReplayUnsafe(lesson.classId, lesson.studentAccountId);
		};

		return this.database.sqlite.inTransaction ? reconcile() : this.database.transaction(reconcile);
	}

	getChargeReplay(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
	}): ChargeReplayView {
		return this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			const scope = this.scope.getFinancialClassScope(
				actor,
				request.classId,
				request.studentAccountId
			);
			if (
				!scope ||
				scope.classId !== request.classId ||
				!scope.studentAccountIds.includes(request.studentAccountId)
			) {
				throw new Error('not-authorized');
			}

			return this.getChargeReplayUnsafe(request.classId, request.studentAccountId);
		});
	}

	createPayment(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
		amount: string;
		factualDate: string;
		confirmation: string;
	}): PaymentView {
		const amount = this.normalizePositiveAmount(request.amount);
		this.requireIsoDate(request.factualDate);
		const confirmation = this.requireConfirmation(request.confirmation);

		return this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			if (actor.role !== 'admin' && actor.role !== 'teacher') {
				throw new Error('not-authorized');
			}
			const scope = this.requirePaymentScope(actor, request.classId, request.studentAccountId);
			const payload = JSON.stringify({
				classId: request.classId,
				studentAccountId: request.studentAccountId,
				amount,
				factualDate: request.factualDate
			});
			const existing = this.getPaymentCommand(actor.accountId, 'create', confirmation);
			if (existing) {
				if (existing.payload !== payload) {
					throw new Error('confirmation-conflict');
				}
				return this.requirePaymentView(existing.payment_id);
			}

			const paymentId = this.nextPaymentId();
			const createdAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO financial_payments (
						id,
						center_id,
						class_id,
						student_account_id,
						amount,
						factual_date,
						status,
						created_by_account_id,
						created_at
					) VALUES (?, ?, ?, ?, ?, ?, 'recorded', ?, ?)`
				)
				.run(
					paymentId,
					scope.centerId,
					request.classId,
					request.studentAccountId,
					amount,
					request.factualDate,
					actor.accountId,
					createdAt
				);
			this.recordPaymentCommand(actor, 'create', confirmation, paymentId, payload, createdAt);
			const payment = this.requirePaymentView(paymentId);
			this.recordPaymentAudit(actor, 'payment-created', null, payment, createdAt);
			this.recomputeAllocations(request.classId, request.studentAccountId);
			return payment;
		});
	}

	editPayment(request: {
		sessionToken?: string;
		paymentId: string;
		change: { amount?: string; factualDate?: string };
		confirmation: string;
	}): PaymentView {
		const confirmation = this.requireConfirmation(request.confirmation);
		const amount = request.change.amount === undefined
			? undefined
			: this.normalizePositiveAmount(request.change.amount);
		const factualDate = request.change.factualDate === undefined
			? undefined
			: (this.requireIsoDate(request.change.factualDate), request.change.factualDate);
		if (amount === undefined && factualDate === undefined) {
			throw new Error('empty-payment-change');
		}

		return this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			if (actor.role !== 'admin') {
				throw new Error('not-authorized');
			}
			const before = this.requirePaymentView(request.paymentId);
			this.requirePaymentScope(actor, before.classId, before.studentAccountId, before.centerId);
			const payload = JSON.stringify({
				paymentId: request.paymentId,
				amount: amount ?? null,
				factualDate: factualDate ?? null
			});
			const existing = this.getPaymentCommand(actor.accountId, 'edit', confirmation);
			if (existing) {
				if (existing.payment_id !== request.paymentId || existing.payload !== payload) {
					throw new Error('confirmation-conflict');
				}
				return this.requirePaymentView(request.paymentId);
			}
			if (before.status !== 'recorded') {
				throw new Error('payment-not-editable');
			}

			const changedAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`UPDATE financial_payments
					 SET amount = COALESCE(?, amount),
					     factual_date = COALESCE(?, factual_date)
					 WHERE id = ?`
				)
				.run(amount ?? null, factualDate ?? null, request.paymentId);
			const after = this.requirePaymentView(request.paymentId);
			this.recordPaymentCommand(actor, 'edit', confirmation, request.paymentId, payload, changedAt);
			this.recordPaymentAudit(actor, 'payment-edited', before, after, changedAt);
			this.recomputeAllocations(after.classId, after.studentAccountId);
			return after;
		});
	}

	cancelPayment(request: {
		sessionToken?: string;
		paymentId: string;
		confirmation: string;
	}): PaymentView {
		const confirmation = this.requireConfirmation(request.confirmation);

		return this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			if (actor.role !== 'admin') {
				throw new Error('not-authorized');
			}
			const before = this.requirePaymentView(request.paymentId);
			this.requirePaymentScope(actor, before.classId, before.studentAccountId, before.centerId);
			const payload = JSON.stringify({ paymentId: request.paymentId });
			const existing = this.getPaymentCommand(actor.accountId, 'cancel', confirmation);
			if (existing) {
				if (existing.payment_id !== request.paymentId || existing.payload !== payload) {
					throw new Error('confirmation-conflict');
				}
				return this.requirePaymentView(request.paymentId);
			}
			if (before.status !== 'recorded') {
				throw new Error('payment-not-cancellable');
			}

			const changedAt = this.now().toISOString();
			this.database.sqlite
				.prepare("UPDATE financial_payments SET status = 'cancelled' WHERE id = ?")
				.run(request.paymentId);
			const after = this.requirePaymentView(request.paymentId);
			this.recordPaymentCommand(actor, 'cancel', confirmation, request.paymentId, payload, changedAt);
			this.recordPaymentAudit(actor, 'payment-cancelled', before, after, changedAt);
			this.recomputeAllocations(after.classId, after.studentAccountId);
			return after;
		});
	}

	getBalanceProjection(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
		range?: FinancialProjectionRange;
	}): BalanceProjectionView {
		return this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			this.requirePaymentScope(actor, request.classId, request.studentAccountId);
			const range = this.normalizeRange(request.range);
			const chargeRows = this.getProjectionChargeRows(request.classId, request.studentAccountId).filter((row) =>
				this.isInRange(row.lesson_date, range)
			);
			const paymentRows = this.getPaymentDbRows(request.classId, request.studentAccountId);
			const selectedPaymentRows = paymentRows.filter((row) => this.isInRange(row.factual_date, range));
			const allocationRows = this.getAllocationRows(request.classId, request.studentAccountId).filter(
				(row) =>
					this.isInRange(row.payment_factual_date, range) && this.isInRange(row.lesson_date, range)
			);
			const amounts = [
				...chargeRows.map((row) => row.applied_price),
				...allocationRows.map((row) => row.amount),
				...selectedPaymentRows.filter((row) => row.status === 'recorded').map((row) => row.amount)
			];
			const scale = this.getAmountScale(amounts);
			const allocatedByLesson = new Map<string, bigint>();
			for (const row of allocationRows) {
				allocatedByLesson.set(
					row.lesson_id,
					(allocatedByLesson.get(row.lesson_id) ?? 0n) + this.toScaledAmount(row.amount, scale)
				);
			}
			const projectionCharges = chargeRows.map((row) => {
				const price = this.toScaledAmount(row.applied_price, scale);
				const allocated = allocatedByLesson.get(row.lesson_id) ?? 0n;
				const remaining = price - allocated;
				return {
					lessonId: row.lesson_id,
					state: this.getChargeState(row, allocated, remaining),
					allocatedAmount: this.fromScaledAmount(allocated, scale),
					remainingAmount: this.fromScaledAmount(remaining > 0n ? remaining : 0n, scale)
				};
			});
			const activeCharges = chargeRows.filter((row) => row.status === 'active').map((row) => row.applied_price);
			const recordedPayments = selectedPaymentRows
				.filter((row) => row.status === 'recorded')
				.map((row) => row.amount);
			const balance = this.calculateBalance(activeCharges, recordedPayments);
			const totalCharges = activeCharges.reduce(
				(total, amount) => total + this.toScaledAmount(amount, scale),
				0n
			);
			const totalPayments = recordedPayments.reduce(
				(total, amount) => total + this.toScaledAmount(amount, scale),
				0n
			);

			return {
				charges: projectionCharges,
				balance,
				advance: this.fromScaledAmount(totalPayments > totalCharges ? totalPayments - totalCharges : 0n, scale),
				allocations: allocationRows.map((row) => ({
					paymentId: row.payment_id,
					lessonId: row.lesson_id,
					amount: row.amount
				})),
				payments: selectedPaymentRows.map((row) => this.toPaymentView(row)),
				audit: this.getPaymentAudit(request.classId, request.studentAccountId)
			};
		});
	}

	getPaymentMarkers(request: {
		sessionToken?: string;
		classId: string;
		studentAccountId: string;
		range?: FinancialProjectionRange;
	}): PaymentMarkerView[] {
		const actor = this.requireActor(request.sessionToken);
		this.requirePaymentScope(actor, request.classId, request.studentAccountId);
		const range = this.normalizeRange(request.range);
		const lessonDates = new Set(
			(this.scope.getFinancialLessonDates?.(actor, request.classId) ?? []).map((date) => {
				this.requireIsoDate(date);
				return date;
			})
		);
		return this.getPaymentDbRows(request.classId, request.studentAccountId)
			.filter((row) => row.status === 'recorded')
			.map((row) => {
				const markerDate = this.getMarkerDate(row.factual_date, lessonDates);
				return {
					paymentId: row.id,
					markerDate,
					factualDate: row.factual_date,
					amount: row.amount
				};
			})
			.filter((marker) => this.isInRange(marker.factualDate, range) || this.isInRange(marker.markerDate, range))
			.sort((left, right) =>
				`${left.markerDate}:${left.factualDate}:${left.paymentId}`.localeCompare(
					`${right.markerDate}:${right.factualDate}:${right.paymentId}`
				)
			);
	}

	private requirePaymentScope(
		actor: ActorContext,
		classId: string,
		studentAccountId: string,
		expectedCenterId?: string
	): FinancialClassScope {
		const scope = this.scope.getFinancialClassScope(actor, classId, studentAccountId);
		if (
			!scope ||
			scope.classId !== classId ||
			!scope.studentAccountIds.includes(studentAccountId) ||
			(expectedCenterId !== undefined && scope.centerId !== expectedCenterId)
		) {
			throw new Error('not-authorized');
		}
		return scope;
	}

	private requireConfirmation(value: string): string {
		if (typeof value !== 'string' || value.trim().length === 0) {
			throw new Error('confirmation-required');
		}
		return value;
	}

	private getPaymentCommand(
		actorAccountId: string,
		operation: PaymentCommandRow['operation'],
		confirmation: string
	): PaymentCommandRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT actor_account_id, operation, confirmation, payment_id, payload
				 FROM financial_payment_commands
				 WHERE actor_account_id = ? AND operation = ? AND confirmation = ?`
			)
			.get(actorAccountId, operation, confirmation) as PaymentCommandRow | undefined;
	}

	private recordPaymentCommand(
		actor: ActorContext,
		operation: PaymentCommandRow['operation'],
		confirmation: string,
		paymentId: string,
		payload: string,
		createdAt: string
	): void {
		this.database.sqlite
			.prepare(
				`INSERT INTO financial_payment_commands (
					actor_account_id,
					operation,
					confirmation,
					payment_id,
					payload,
					created_at
				) VALUES (?, ?, ?, ?, ?, ?)`
			)
			.run(actor.accountId, operation, confirmation, paymentId, payload, createdAt);
	}

	private nextPaymentId(): string {
		const row = this.database.sqlite
			.prepare('SELECT COUNT(*) AS count FROM financial_payments')
			.get() as { count: number };
		let suffix = row.count + 1;
		let id = `payment-${suffix}`;
		while (this.database.sqlite.prepare('SELECT 1 FROM financial_payments WHERE id = ?').get(id)) {
			suffix += 1;
			id = `payment-${suffix}`;
		}
		return id;
	}

	private requirePaymentView(paymentId: string): PaymentView {
		const row = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, student_account_id, amount, factual_date,
						status, created_by_account_id, created_at
				 FROM financial_payments
				 WHERE id = ?`
			)
			.get(paymentId) as PaymentDbRow | undefined;
		if (!row) {
			throw new Error('payment-not-found');
		}
		return this.toPaymentView(row);
	}

	private getPaymentDbRows(classId: string, studentAccountId: string): PaymentDbRow[] {
		return this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, student_account_id, amount, factual_date,
						status, created_by_account_id, created_at
				 FROM financial_payments
				 WHERE class_id = ? AND student_account_id = ?
				 ORDER BY factual_date, id`
			)
			.all(classId, studentAccountId) as PaymentDbRow[];
	}

	private toPaymentView(row: PaymentDbRow): PaymentView {
		return {
			id: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			studentAccountId: row.student_account_id,
			amount: row.amount,
			factualDate: row.factual_date,
			status: row.status,
			createdByAccountId: row.created_by_account_id,
			createdAt: row.created_at
		};
	}

	private recordPaymentAudit(
		actor: ActorContext,
		action: PaymentAuditView['action'],
		before: PaymentView | null,
		after: PaymentView,
		changedAt: string
	): void {
		this.database.sqlite
			.prepare(
				`INSERT INTO financial_payment_audit_records (
					center_id,
					class_id,
					payment_id,
					student_account_id,
					action,
					actor_account_id,
					changed_at,
					before_state,
					after_state
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				after.centerId,
				after.classId,
				after.id,
				after.studentAccountId,
				action,
				actor.accountId,
				changedAt,
				before ? JSON.stringify(before) : null,
				JSON.stringify(after)
			);
	}

	private getPaymentAudit(classId: string, studentAccountId: string): PaymentAuditView[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT action, actor_account_id, changed_at, before_state, after_state
				 FROM financial_payment_audit_records
				 WHERE class_id = ? AND student_account_id = ?
				 ORDER BY id`
			)
			.all(classId, studentAccountId) as PaymentAuditRow[];
		return rows.map((row) => ({
			action: row.action,
			actorAccountId: row.actor_account_id,
			changedAt: row.changed_at,
			before: row.before_state ? (JSON.parse(row.before_state) as PaymentView) : null,
			after: JSON.parse(row.after_state) as PaymentView
		}));
	}

	private getProjectionChargeRows(classId: string, studentAccountId: string): ChargeRow[] {
		return this.database.sqlite
			.prepare(
				`SELECT center_id, class_id, lesson_id, student_account_id, lesson_date,
						applied_price, status, created_at, cancelled_at
				 FROM financial_lesson_charges
				 WHERE class_id = ? AND student_account_id = ?
				 ORDER BY lesson_date, lesson_id`
			)
			.all(classId, studentAccountId) as ChargeRow[];
	}

	private getAllocationRows(classId: string, studentAccountId: string): AllocationRow[] {
		return this.database.sqlite
			.prepare(
				`SELECT a.payment_id,
						a.lesson_id,
						a.amount,
						p.factual_date AS payment_factual_date,
						c.lesson_date
					 FROM financial_payment_allocations a
					 JOIN financial_payments p ON p.id = a.payment_id
					 JOIN financial_lesson_charges c
				   ON c.lesson_id = a.lesson_id
				  AND c.student_account_id = a.student_account_id
				 WHERE p.class_id = ? AND p.student_account_id = ?
				 ORDER BY c.lesson_date, c.lesson_id, p.factual_date, p.id`
			)
			.all(classId, studentAccountId) as AllocationRow[];
	}

	private getChargeState(
		row: ChargeRow,
		allocated: bigint,
		remaining: bigint
	): 'open' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' {
		if (row.status === 'cancelled') {
			return 'cancelled';
		}
		if (remaining <= 0n) {
			return 'paid';
		}
		if (allocated > 0n) {
			return 'partially_paid';
		}
		return row.lesson_date < this.now().toISOString().slice(0, 10) ? 'overdue' : 'open';
	}

	private normalizeRange(range?: FinancialProjectionRange): FinancialProjectionRange | undefined {
		if (!range) {
			return undefined;
		}
		if (range.from !== undefined) {
			this.requireIsoDate(range.from);
		}
		if (range.to !== undefined) {
			this.requireIsoDate(range.to);
		}
		if (range.from !== undefined && range.to !== undefined && range.from > range.to) {
			throw new Error('invalid-date-range');
		}
		return range;
	}

	private isInRange(value: string, range?: FinancialProjectionRange): boolean {
		return (!range?.from || value >= range.from) && (!range?.to || value <= range.to);
	}

	private getMarkerDate(factualDate: string, lessonDates: Set<string>): string {
		if (!lessonDates.has(factualDate)) {
			return factualDate;
		}
		const date = new Date(`${factualDate}T00:00:00.000Z`);
		do {
			date.setUTCDate(date.getUTCDate() - 1);
		} while (lessonDates.has(date.toISOString().slice(0, 10)));
		return date.toISOString().slice(0, 10);
	}

	private setPrice(request: PriceSettingRequest, studentAccountId?: string): void {
		const amount = this.normalizePositiveAmount(request.amount);
		this.requireIsoDate(request.effectiveFrom);

		this.database.transaction(() => {
			const actor = this.requireActor(request.sessionToken);
			if (actor.role !== 'admin') {
				throw new Error('not-authorized');
			}
			const scope = this.scope.getFinancialClassScope(actor, request.classId, studentAccountId);
			if (
				!scope ||
				scope.classId !== request.classId ||
				(studentAccountId !== undefined && !scope.studentAccountIds.includes(studentAccountId))
			) {
				throw new Error('not-authorized');
			}

			this.database.sqlite
				.prepare(
					`INSERT INTO financial_price_settings (
						center_id,
						class_id,
						student_account_id,
						amount,
						effective_from,
						created_by_account_id,
						created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?)`
				)
				.run(
					scope.centerId,
					scope.classId,
					studentAccountId ?? null,
					amount,
					request.effectiveFrom,
					actor.accountId,
					this.now().toISOString()
				);
		});
	}

	private applyAttendanceTarget(
		actor: ActorContext,
		lesson: FinancialLessonFacts,
		target: 'present' | 'absent'
	): boolean {
		const beforeRow = this.getChargeRow(lesson.lessonId, lesson.studentAccountId);

		if (target === 'present') {
			if (beforeRow?.status === 'active') {
				return false;
			}

			const changedAt = this.now().toISOString();
			if (beforeRow) {
				this.database.sqlite
					.prepare(
						`UPDATE financial_lesson_charges
						 SET status = 'active', cancelled_at = NULL
						 WHERE lesson_id = ? AND student_account_id = ?`
					)
					.run(lesson.lessonId, lesson.studentAccountId);
				const afterRow = this.requireChargeRow(lesson.lessonId, lesson.studentAccountId);
				this.recordAudit(actor, 'charge-reactivated', beforeRow, afterRow, changedAt);
				return true;
			}

			const appliedPrice = this.resolveAppliedPrice(lesson);
			this.database.sqlite
				.prepare(
					`INSERT INTO financial_lesson_charges (
						center_id,
						class_id,
						lesson_id,
						student_account_id,
						lesson_date,
						applied_price,
						status,
						created_at,
						cancelled_at
					) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NULL)`
				)
				.run(
					lesson.centerId,
					lesson.classId,
					lesson.lessonId,
					lesson.studentAccountId,
					lesson.lessonDate,
					appliedPrice,
					changedAt
				);
			const afterRow = this.requireChargeRow(lesson.lessonId, lesson.studentAccountId);
			this.recordAudit(actor, 'charge-created', null, afterRow, changedAt);
			return true;
		}

		if (!beforeRow || beforeRow.status === 'cancelled') {
			return false;
		}

		const changedAt = this.now().toISOString();
		this.database.sqlite
			.prepare(
				`UPDATE financial_lesson_charges
				 SET status = 'cancelled', cancelled_at = ?
				 WHERE lesson_id = ? AND student_account_id = ?`
			)
			.run(changedAt, lesson.lessonId, lesson.studentAccountId);
		const afterRow = this.requireChargeRow(lesson.lessonId, lesson.studentAccountId);
		this.recordAudit(actor, 'charge-cancelled', beforeRow, afterRow, changedAt);
		return true;
	}

	private resolveAppliedPrice(lesson: FinancialLessonFacts): string {
		const row = this.database.sqlite
			.prepare(
				`SELECT amount
				 FROM financial_price_settings
				 WHERE class_id = ?
				   AND effective_from <= ?
				   AND (student_account_id = ? OR student_account_id IS NULL)
				 ORDER BY
				   CASE WHEN student_account_id = ? THEN 0 ELSE 1 END,
				   effective_from DESC,
				   id DESC
				 LIMIT 1`
			)
			.get(
				lesson.classId,
				lesson.lessonDate,
				lesson.studentAccountId,
				lesson.studentAccountId
			) as { amount: string } | undefined;

		if (!row) {
			throw new Error('price-not-configured');
		}
		return row.amount;
	}

	private getChargeReplayUnsafe(classId: string, studentAccountId: string): ChargeReplayView {
		const rows = this.database.sqlite
			.prepare(
				`SELECT
					center_id,
					class_id,
					lesson_id,
					student_account_id,
					lesson_date,
					applied_price,
					status,
					created_at,
					cancelled_at
				 FROM financial_lesson_charges
				 WHERE class_id = ? AND student_account_id = ?
				 ORDER BY lesson_date, lesson_id`
			)
			.all(classId, studentAccountId) as ChargeRow[];
		const charges = rows.map((row) => this.toChargeView(row));

		const auditRows = this.database.sqlite
			.prepare(
				`SELECT action, actor_account_id, changed_at, before_state, after_state
				 FROM financial_audit_records
				 WHERE class_id = ? AND student_account_id = ?
				 ORDER BY id`
			)
			.all(classId, studentAccountId) as AuditRow[];
		const paymentRows = this.getPaymentRows(classId, studentAccountId);
		const allocationRows = this.database.sqlite
			.prepare(
				`SELECT
					a.payment_id,
					a.lesson_id,
					a.amount
				 FROM financial_payment_allocations a
				 JOIN financial_payments p ON p.id = a.payment_id
				 JOIN financial_lesson_charges c
				   ON c.lesson_id = a.lesson_id
				  AND c.student_account_id = a.student_account_id
				 WHERE p.class_id = ?
				   AND p.student_account_id = ?
				 ORDER BY p.factual_date, p.id, c.lesson_date, c.lesson_id`
			)
			.all(classId, studentAccountId) as AllocationRow[];

		return {
			charges,
			balance: this.calculateBalance(
				charges
					.filter((charge) => charge.status === 'active')
					.map((charge) => charge.appliedPrice),
				paymentRows.map((payment) => payment.amount)
			),
			allocations: allocationRows.map((row) => ({
				paymentId: row.payment_id,
				lessonId: row.lesson_id,
				amount: row.amount
			})),
			audit: auditRows.map((row) => ({
				action: row.action,
				actorAccountId: row.actor_account_id,
				changedAt: row.changed_at,
				before: row.before_state ? (JSON.parse(row.before_state) as ChargeView) : null,
				after: row.after_state ? (JSON.parse(row.after_state) as ChargeView) : null
			}))
		};
	}

	private recomputeAllocations(classId: string, studentAccountId: string): void {
		const chargeRows = this.database.sqlite
			.prepare(
				`SELECT lesson_id, applied_price
				 FROM financial_lesson_charges
				 WHERE class_id = ?
				   AND student_account_id = ?
				   AND status = 'active'
				 ORDER BY lesson_date, lesson_id`
			)
			.all(classId, studentAccountId) as Array<{
			lesson_id: string;
			applied_price: string;
		}>;
		const paymentRows = this.getPaymentRows(classId, studentAccountId);
		const amounts = [
			...chargeRows.map((charge) => charge.applied_price),
			...paymentRows.map((payment) => payment.amount)
		];
		const scale = this.getAmountScale(amounts);
		const outstanding = chargeRows.map((charge) => ({
			lessonId: charge.lesson_id,
			amount: this.toScaledAmount(charge.applied_price, scale)
		}));

		this.database.sqlite
			.prepare(
				`DELETE FROM financial_payment_allocations
				 WHERE payment_id IN (
					SELECT id
					FROM financial_payments
					WHERE class_id = ? AND student_account_id = ?
				 )`
			)
			.run(classId, studentAccountId);
		const insertAllocation = this.database.sqlite.prepare(
			`INSERT INTO financial_payment_allocations (
				payment_id,
				lesson_id,
				student_account_id,
				amount
			) VALUES (?, ?, ?, ?)`
		);

		for (const payment of paymentRows) {
			let remaining = this.toScaledAmount(payment.amount, scale);
			for (const charge of outstanding) {
				if (remaining === 0n) {
					break;
				}
				if (charge.amount === 0n) {
					continue;
				}

				const allocated = remaining < charge.amount ? remaining : charge.amount;
				insertAllocation.run(
					payment.id,
					charge.lessonId,
					studentAccountId,
					this.fromScaledAmount(allocated, scale)
				);
				remaining -= allocated;
				charge.amount -= allocated;
			}
		}
	}

	private getPaymentRows(classId: string, studentAccountId: string): PaymentRow[] {
		return this.database.sqlite
			.prepare(
				`SELECT id, amount, factual_date
				 FROM financial_payments
				 WHERE class_id = ?
				   AND student_account_id = ?
				   AND status = 'recorded'
				 ORDER BY factual_date, id`
			)
			.all(classId, studentAccountId) as PaymentRow[];
	}

	private recordAudit(
		actor: ActorContext,
		action: FinancialAuditView['action'],
		before: ChargeRow | null,
		after: ChargeRow,
		changedAt: string
	): void {
		this.database.sqlite
			.prepare(
				`INSERT INTO financial_audit_records (
					center_id,
					class_id,
					lesson_id,
					student_account_id,
					action,
					actor_account_id,
					changed_at,
					before_state,
					after_state
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				after.center_id,
				after.class_id,
				after.lesson_id,
				after.student_account_id,
				action,
				actor.accountId,
				changedAt,
				before ? JSON.stringify(this.toChargeView(before)) : null,
				JSON.stringify(this.toChargeView(after))
			);
	}

	private getChargeRow(lessonId: string, studentAccountId: string): ChargeRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT
					center_id,
					class_id,
					lesson_id,
					student_account_id,
					lesson_date,
					applied_price,
					status,
					created_at,
					cancelled_at
				 FROM financial_lesson_charges
				 WHERE lesson_id = ? AND student_account_id = ?`
			)
			.get(lessonId, studentAccountId) as ChargeRow | undefined;
	}

	private requireChargeRow(lessonId: string, studentAccountId: string): ChargeRow {
		const row = this.getChargeRow(lessonId, studentAccountId);
		if (!row) {
			throw new Error('charge-write-failed');
		}
		return row;
	}

	private toChargeView(row: ChargeRow): ChargeView {
		return {
			centerId: row.center_id,
			classId: row.class_id,
			lessonId: row.lesson_id,
			studentAccountId: row.student_account_id,
			lessonDate: row.lesson_date,
			appliedPrice: row.applied_price,
			status: row.status,
			createdAt: row.created_at,
			cancelledAt: row.cancelled_at
		};
	}

	private requireActor(sessionToken: string | undefined): ActorContext {
		const actor = this.identityAccess.resolveActor(sessionToken);
		if (!actor) {
			throw new Error('not-authorized');
		}
		return actor;
	}

	private normalizePositiveAmount(value: string): string {
		if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value)) {
			throw new Error('invalid-amount');
		}
		const [whole, fraction = ''] = value.split('.');
		const normalizedFraction = fraction.replace(/0+$/, '');
		const normalized = normalizedFraction ? `${whole}.${normalizedFraction}` : whole;
		if (normalized === '0') {
			throw new Error('invalid-amount');
		}
		return normalized;
	}

	private calculateBalance(chargeAmounts: string[], paymentAmounts: string[]): string {
		const scale = this.getAmountScale([...chargeAmounts, ...paymentAmounts]);
		const chargeTotal = chargeAmounts.reduce(
			(total, amount) => total + this.toScaledAmount(amount, scale),
			0n
		);
		const paymentTotal = paymentAmounts.reduce(
			(total, amount) => total + this.toScaledAmount(amount, scale),
			0n
		);
		return this.fromScaledAmount(chargeTotal - paymentTotal, scale);
	}

	private getAmountScale(values: string[]): number {
		return values.reduce((scale, value) => {
			const normalized = this.normalizePositiveAmount(value);
			return Math.max(scale, normalized.split('.')[1]?.length ?? 0);
		}, 0);
	}

	private toScaledAmount(value: string, scale: number): bigint {
		const normalized = this.normalizePositiveAmount(value);
		const [whole, fraction = ''] = normalized.split('.');
		return BigInt(`${whole}${fraction.padEnd(scale, '0')}`);
	}

	private fromScaledAmount(value: bigint, scale: number): string {
		const sign = value < 0n ? '-' : '';
		const digits = (value < 0n ? -value : value).toString().padStart(scale + 1, '0');
		if (scale === 0) {
			return `${sign}${digits}`;
		}
		const whole = digits.slice(0, -scale);
		const fraction = digits.slice(-scale).replace(/0+$/, '');
		return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
	}

	private requireIsoDate(value: string): void {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			throw new Error('invalid-date');
		}
		const parsed = new Date(`${value}T00:00:00.000Z`);
		if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
			throw new Error('invalid-date');
		}
	}
}
