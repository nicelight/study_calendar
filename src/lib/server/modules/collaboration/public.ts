import {
	CenterSchedulingBoundary,
	type AuthorizedClassScope,
	type LessonView
} from '$lib/server/modules/center-scheduling/public';
import {
	IdentityAccessBoundary,
	type ActorContext
} from '$lib/server/modules/identity-access/public';
import type { SharedDatabase } from '$lib/server/platform/database';

export const STANDARD_REACTIONS = [
	'like',
	'love',
	'laugh',
	'celebrate',
	'question'
] as const;

export type Reaction = (typeof STANDARD_REACTIONS)[number];
export type DiscussionScope = 'shared' | 'personal';
export type ReactionTargetType = 'field' | 'comment' | 'message';

export type FieldCommentView = {
	commentId: string;
	centerId: string;
	classId: string;
	lessonId: string;
	scope: DiscussionScope;
	studentAccountId: string | null;
	fieldKey: string;
	body: string;
	authorAccountId: string;
	createdAt: string;
	lastChangedAt: string;
};

export type ReactionView = {
	targetType: ReactionTargetType;
	targetId: string;
	centerId: string;
	classId: string;
	lessonId: string;
	scope: DiscussionScope;
	studentAccountId: string | null;
	reaction: Reaction;
	reactorAccountId: string;
	createdAt: string;
	lastChangedAt: string;
};

export type MessageView = {
	messageId: string;
	centerId: string;
	classId: string;
	lessonId: string;
	scope: DiscussionScope;
	studentAccountId: string | null;
	parentMessageId: string | null;
	rootMessageId: string;
	body: string;
	authorAccountId: string;
	createdAt: string;
};

export type BranchTabView = {
	rootMessageId: string;
	messageCount: number;
	lastActivityAt: string;
};

export type DayDiscussionView = {
	commonMessages: MessageView[];
	recentBranchTabs: BranchTabView[];
};

type CommentRow = {
	id: string;
	center_id: string;
	class_id: string;
	lesson_id: string;
	scope: DiscussionScope;
	student_account_id: string | null;
	field_key: string;
	body: string;
	author_account_id: string;
	created_at: string;
	last_changed_at: string;
};

type ReactionRow = {
	target_type: ReactionTargetType;
	target_id: string;
	center_id: string;
	class_id: string;
	lesson_id: string;
	scope: DiscussionScope;
	student_account_id: string | null;
	reaction: Reaction;
	reactor_account_id: string;
	created_at: string;
	last_changed_at: string;
};

type MessageRow = {
	id: string;
	center_id: string;
	class_id: string;
	lesson_id: string;
	scope: DiscussionScope;
	student_account_id: string | null;
	parent_message_id: string | null;
	root_message_id: string;
	body: string;
	author_account_id: string;
	created_at: string;
};

type BranchTabRow = {
	root_message_id: string;
	message_count: number;
	last_activity_at: string;
};

type DiscussionRequest = {
	sessionToken?: string;
	classId: string;
	lessonId: string;
	scope: DiscussionScope;
	studentAccountId?: string;
};

type AuthorizedDiscussionScope = {
	actor: ActorContext;
	classScope: AuthorizedClassScope;
	lesson: LessonView;
	studentAccountId: string | null;
};

type CollaborationOptions = {
	now?: () => Date;
};

export class CollaborationBoundary {
	private readonly now: () => Date;

	constructor(
		private readonly database: SharedDatabase,
		private readonly identityAccess: Pick<IdentityAccessBoundary, 'resolveActor'>,
		private readonly centerScheduling: Pick<
			CenterSchedulingBoundary,
			'getAuthorizedClassScope' | 'getLessons'
		>,
		options: CollaborationOptions = {}
	) {
		this.now = options.now ?? (() => new Date());
	}

	createFieldComment(request: {
		sessionToken?: string;
		classId: string;
		lessonId: string;
		scope: DiscussionScope;
		studentAccountId?: string;
		fieldKey: string;
		commentId: string;
		body: string;
	}): FieldCommentView {
		return this.database.transaction(() => {
			const target = this.requireDiscussionScope(request);
			const fieldKey = this.requireText(request.fieldKey, 'invalid-field-key');
			const body = this.requireText(request.body, 'invalid-comment-body');
			const commentId = this.requireText(request.commentId, 'invalid-comment-id');
			const createdAt = this.now().toISOString();

			try {
				this.database.sqlite
					.prepare(
						`INSERT INTO collaboration_comments (
							id, center_id, class_id, lesson_id, scope, student_account_id,
							field_key, author_account_id, body, created_at, last_changed_at
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
					)
					.run(
						commentId,
						target.lesson.centerId,
						target.classScope.classId,
						target.lesson.lessonId,
						request.scope,
						target.studentAccountId,
						fieldKey,
						target.actor.accountId,
						body,
						createdAt,
						createdAt
					);
			} catch (error) {
				if (this.isConstraintError(error)) {
					throw new Error('comment-already-exists');
				}
				throw error;
			}

			return this.requireCommentView(commentId);
		});
	}

	editFieldComment(request: {
		sessionToken?: string;
		commentId: string;
		body: string;
	}): FieldCommentView {
		return this.database.transaction(() => {
			const comment = this.getComment(request.commentId);
			if (!comment) {
				throw new Error('not-authorized');
			}
			const target = this.requireDiscussionScope({
				sessionToken: request.sessionToken,
				classId: comment.class_id,
				lessonId: comment.lesson_id,
				scope: comment.scope,
				studentAccountId: comment.student_account_id ?? undefined
			});
			if (comment.author_account_id !== target.actor.accountId) {
				throw new Error('not-authorized');
			}

			const body = this.requireText(request.body, 'invalid-comment-body');
			const lastChangedAt = this.now().toISOString();
			this.database.sqlite
				.prepare('UPDATE collaboration_comments SET body = ?, last_changed_at = ? WHERE id = ?')
				.run(body, lastChangedAt, comment.id);

			return this.requireCommentView(comment.id);
		});
	}

	getFieldComments(request: DiscussionRequest & { fieldKey: string }): FieldCommentView[] {
		const target = this.requireDiscussionScope(request);
		const fieldKey = this.requireText(request.fieldKey, 'invalid-field-key');
		const rows = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, lesson_id, scope, student_account_id,
						field_key, body, author_account_id, created_at, last_changed_at
				 FROM collaboration_comments
				 WHERE class_id = ? AND lesson_id = ? AND scope = ?
				   AND COALESCE(student_account_id, '') = COALESCE(?, '')
				   AND field_key = ?
				 ORDER BY created_at, id`
			)
			.all(
				target.classScope.classId,
				target.lesson.lessonId,
				request.scope,
				target.studentAccountId,
				fieldKey
			) as CommentRow[];
		return rows.map((row) => this.toCommentView(row));
	}

	createMessage(request: DiscussionRequest & {
		messageId: string;
		body: string;
	}): MessageView {
		return this.database.transaction(() => {
			const target = this.requireDiscussionScope(request);
			const messageId = this.requireText(request.messageId, 'invalid-message-id');
			const body = this.requireText(request.body, 'invalid-message-body');
			const createdAt = this.now().toISOString();

			this.database.sqlite
				.prepare(
					`INSERT INTO collaboration_messages (
						id, center_id, class_id, lesson_id, scope, student_account_id,
						parent_message_id, root_message_id, author_account_id, body, created_at
					) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`
				)
				.run(
					messageId,
					target.lesson.centerId,
					target.classScope.classId,
					target.lesson.lessonId,
					request.scope,
					target.studentAccountId,
					messageId,
					target.actor.accountId,
					body,
					createdAt
				);

			return this.requireMessageView(messageId);
		});
	}

	replyToMessage(request: DiscussionRequest & {
		parentMessageId: string;
		messageId: string;
		body: string;
	}): MessageView {
		return this.database.transaction(() => {
			const target = this.requireDiscussionScope(request);
			const parentMessageId = this.requireText(
				request.parentMessageId,
				'invalid-parent-message-id'
			);
			const parent = this.getMessage(parentMessageId);
			if (!parent || !this.messageBelongsToTarget(parent, target, request.scope)) {
				throw new Error('not-authorized');
			}

			const messageId = this.requireText(request.messageId, 'invalid-message-id');
			const body = this.requireText(request.body, 'invalid-message-body');
			const createdAt = this.now().toISOString();
			this.database.sqlite
				.prepare(
					`INSERT INTO collaboration_messages (
						id, center_id, class_id, lesson_id, scope, student_account_id,
						parent_message_id, root_message_id, author_account_id, body, created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.run(
					messageId,
					target.lesson.centerId,
					target.classScope.classId,
					target.lesson.lessonId,
					request.scope,
					target.studentAccountId,
					parent.id,
					parent.root_message_id,
					target.actor.accountId,
					body,
					createdAt
				);

			return this.requireMessageView(messageId);
		});
	}

	getDayDiscussion(request: DiscussionRequest): DayDiscussionView {
		const target = this.requireDiscussionScope(request);
		const commonMessages = this.getScopedMessages(target, request.scope);
		const recentBranchTabs = this.database.sqlite
			.prepare(
				`SELECT root_message_id,
						COUNT(*) AS message_count,
						MAX(created_at) AS last_activity_at
				 FROM collaboration_messages
				 WHERE class_id = ? AND lesson_id = ? AND scope = ?
				   AND COALESCE(student_account_id, '') = COALESCE(?, '')
				 GROUP BY root_message_id
				 HAVING COUNT(*) > 1
				 ORDER BY MAX(rowid) DESC
				 LIMIT 10`
			)
			.all(
				target.classScope.classId,
				target.lesson.lessonId,
				request.scope,
				target.studentAccountId
			) as BranchTabRow[];

		return {
			commonMessages,
			recentBranchTabs: recentBranchTabs.map((tab) => ({
				rootMessageId: tab.root_message_id,
				messageCount: tab.message_count,
				lastActivityAt: tab.last_activity_at
			}))
		};
	}

	getBranchMessages(request: DiscussionRequest & { rootMessageId: string }): MessageView[] {
		const target = this.requireDiscussionScope(request);
		const rootMessageId = this.requireText(request.rootMessageId, 'invalid-root-message-id');
		const root = this.getMessage(rootMessageId);
		if (
			!root ||
			root.parent_message_id !== null ||
			root.root_message_id !== root.id ||
			!this.messageBelongsToTarget(root, target, request.scope)
		) {
			throw new Error('not-authorized');
		}

		const rows = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, lesson_id, scope, student_account_id,
						parent_message_id, root_message_id, body, author_account_id, created_at
				 FROM collaboration_messages
				 WHERE class_id = ? AND lesson_id = ? AND scope = ?
				   AND COALESCE(student_account_id, '') = COALESCE(?, '')
				   AND root_message_id = ?
				 ORDER BY rowid`
			)
			.all(
				target.classScope.classId,
				target.lesson.lessonId,
				request.scope,
				target.studentAccountId,
				rootMessageId
			) as MessageRow[];

		return rows.map((row) => this.toMessageView(row));
	}

	setReaction(request: DiscussionRequest & {
		targetType: ReactionTargetType;
		targetId: string;
		reaction: Reaction;
	}): ReactionView {
		return this.database.transaction(() => {
			const target = this.requireDiscussionScope(request);
			const targetId = this.requireText(request.targetId, 'invalid-reaction-target');
			this.requireReaction(request.reaction);
			this.requireReactionTarget(request, target);
			const changedAt = this.now().toISOString();

			this.database.sqlite
				.prepare(
					`INSERT INTO collaboration_reactions (
						target_type, target_id, center_id, class_id, lesson_id, scope,
						student_account_id, reaction, reactor_account_id, created_at, last_changed_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT DO UPDATE SET reaction = excluded.reaction, last_changed_at = excluded.last_changed_at`
				)
				.run(
					request.targetType,
					targetId,
					target.lesson.centerId,
					target.classScope.classId,
					target.lesson.lessonId,
					request.scope,
					target.studentAccountId,
					request.reaction,
					target.actor.accountId,
					changedAt,
					changedAt
				);

			return this.requireReactionView(
				request.targetType,
				targetId,
				target.classScope.classId,
				target.lesson.lessonId,
				request.scope,
				target.studentAccountId,
				target.actor.accountId
			);
		});
	}

	getReactions(request: DiscussionRequest & {
		targetType: ReactionTargetType;
		targetId: string;
	}): ReactionView[] {
		const target = this.requireDiscussionScope(request);
		const targetId = this.requireText(request.targetId, 'invalid-reaction-target');
		this.requireReactionTarget(request, target);
		const rows = this.database.sqlite
			.prepare(
				`SELECT target_type, target_id, center_id, class_id, lesson_id, scope,
						student_account_id, reaction, reactor_account_id, created_at, last_changed_at
				 FROM collaboration_reactions
				 WHERE target_type = ? AND target_id = ? AND class_id = ? AND lesson_id = ?
				   AND scope = ? AND COALESCE(student_account_id, '') = COALESCE(?, '')
				 ORDER BY reaction, reactor_account_id`
			)
			.all(
				request.targetType,
				targetId,
				target.classScope.classId,
				target.lesson.lessonId,
				request.scope,
				target.studentAccountId
			) as ReactionRow[];
		return rows.map((row) => this.toReactionView(row));
	}

	private requireDiscussionScope(request: DiscussionRequest): AuthorizedDiscussionScope {
		if (request.scope !== 'shared' && request.scope !== 'personal') {
			throw new Error('invalid-discussion-scope');
		}

		const actor = this.identityAccess.resolveActor(request.sessionToken);
		const classScope = this.centerScheduling.getAuthorizedClassScope(
			request.sessionToken,
			request.classId
		);
		const lessons = classScope
			? this.centerScheduling.getLessons({
					sessionToken: request.sessionToken,
					classId: request.classId
				})
			: null;
		const lesson = lessons?.find((candidate) => candidate.lessonId === request.lessonId);
		if (!actor || !classScope || !lesson) {
			throw new Error('not-authorized');
		}

		if (request.scope === 'shared') {
			if (request.studentAccountId !== undefined) {
				throw new Error('invalid-discussion-scope');
			}
			return { actor, classScope, lesson, studentAccountId: null };
		}

		const studentAccountId = this.requireText(
			request.studentAccountId ?? '',
			'not-authorized'
		);
		if (!classScope.studentAccountIds.includes(studentAccountId)) {
			throw new Error('not-authorized');
		}
		return { actor, classScope, lesson, studentAccountId };
	}

	private requireReactionTarget(
		request: DiscussionRequest & { targetType: ReactionTargetType; targetId: string },
		target: AuthorizedDiscussionScope
	): void {
		const targetId = this.requireText(request.targetId, 'invalid-reaction-target');
		switch (request.targetType) {
			case 'field':
				this.requireText(targetId, 'invalid-field-key');
				return;
			case 'comment': {
				const comment = this.getComment(targetId);
				if (
					!comment ||
					comment.class_id !== target.classScope.classId ||
					comment.lesson_id !== target.lesson.lessonId ||
					comment.scope !== request.scope ||
					(comment.student_account_id ?? null) !== target.studentAccountId
				) {
					throw new Error('not-authorized');
				}
				return;
			}
			case 'message':
				if (!this.messageTableContainsTarget(target, request.scope, targetId)) {
					throw new Error('reaction-target-not-found');
				}
				return;
			default:
				throw new Error('invalid-reaction-target');
		}
	}

	private messageTableContainsTarget(
		target: AuthorizedDiscussionScope,
		scope: DiscussionScope,
		targetId: string
	): boolean {
		const message = this.getMessage(targetId);
		return Boolean(message && this.messageBelongsToTarget(message, target, scope));
	}

	private getScopedMessages(
		target: AuthorizedDiscussionScope,
		scope: DiscussionScope
	): MessageView[] {
		const rows = this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, lesson_id, scope, student_account_id,
						parent_message_id, root_message_id, body, author_account_id, created_at
				 FROM collaboration_messages
				 WHERE class_id = ? AND lesson_id = ? AND scope = ?
				   AND COALESCE(student_account_id, '') = COALESCE(?, '')
				 ORDER BY rowid`
			)
			.all(
				target.classScope.classId,
				target.lesson.lessonId,
				scope,
				target.studentAccountId
			) as MessageRow[];
		return rows.map((row) => this.toMessageView(row));
	}

	private getMessage(messageId: string): MessageRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, lesson_id, scope, student_account_id,
						parent_message_id, root_message_id, body, author_account_id, created_at
				 FROM collaboration_messages WHERE id = ?`
			)
			.get(messageId) as MessageRow | undefined;
	}

	private requireMessageView(messageId: string): MessageView {
		const message = this.getMessage(messageId);
		if (!message) {
			throw new Error('message-not-found');
		}
		return this.toMessageView(message);
	}

	private messageBelongsToTarget(
		message: MessageRow,
		target: AuthorizedDiscussionScope,
		scope: DiscussionScope
	): boolean {
		return (
			message.center_id === target.lesson.centerId &&
			message.class_id === target.classScope.classId &&
			message.lesson_id === target.lesson.lessonId &&
			message.scope === scope &&
			message.student_account_id === target.studentAccountId
		);
	}

	private requireReaction(value: Reaction): void {
		if (!(STANDARD_REACTIONS as readonly string[]).includes(value)) {
			throw new Error('invalid-reaction');
		}
	}

	private requireText(value: string, errorCode: string): string {
		const normalized = value.trim();
		if (!normalized) {
			throw new Error(errorCode);
		}
		return normalized;
	}

	private getComment(commentId: string): CommentRow | undefined {
		return this.database.sqlite
			.prepare(
				`SELECT id, center_id, class_id, lesson_id, scope, student_account_id,
						field_key, body, author_account_id, created_at, last_changed_at
				 FROM collaboration_comments WHERE id = ?`
			)
			.get(commentId) as CommentRow | undefined;
	}

	private requireCommentView(commentId: string): FieldCommentView {
		const comment = this.getComment(commentId);
		if (!comment) {
			throw new Error('comment-not-found');
		}
		return this.toCommentView(comment);
	}

	private requireReactionView(
		targetType: ReactionTargetType,
		targetId: string,
		classId: string,
		lessonId: string,
		scope: DiscussionScope,
		studentAccountId: string | null,
		reactorAccountId: string
	): ReactionView {
		const row = this.database.sqlite
			.prepare(
				`SELECT target_type, target_id, center_id, class_id, lesson_id, scope,
						student_account_id, reaction, reactor_account_id, created_at, last_changed_at
				 FROM collaboration_reactions
				 WHERE target_type = ? AND target_id = ? AND class_id = ? AND lesson_id = ?
				   AND scope = ? AND COALESCE(student_account_id, '') = COALESCE(?, '')
				   AND reactor_account_id = ?`
			)
			.get(
				targetType,
				targetId,
				classId,
				lessonId,
				scope,
				studentAccountId,
				reactorAccountId
			) as ReactionRow | undefined;
		if (!row) {
			throw new Error('reaction-not-found');
		}
		return this.toReactionView(row);
	}

	private toCommentView(row: CommentRow): FieldCommentView {
		return {
			commentId: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			lessonId: row.lesson_id,
			scope: row.scope,
			studentAccountId: row.student_account_id,
			fieldKey: row.field_key,
			body: row.body,
			authorAccountId: row.author_account_id,
			createdAt: row.created_at,
			lastChangedAt: row.last_changed_at
		};
	}

	private toReactionView(row: ReactionRow): ReactionView {
		return {
			targetType: row.target_type,
			targetId: row.target_id,
			centerId: row.center_id,
			classId: row.class_id,
			lessonId: row.lesson_id,
			scope: row.scope,
			studentAccountId: row.student_account_id,
			reaction: row.reaction,
			reactorAccountId: row.reactor_account_id,
			createdAt: row.created_at,
			lastChangedAt: row.last_changed_at
		};
	}

	private toMessageView(row: MessageRow): MessageView {
		return {
			messageId: row.id,
			centerId: row.center_id,
			classId: row.class_id,
			lessonId: row.lesson_id,
			scope: row.scope,
			studentAccountId: row.student_account_id,
			parentMessageId: row.parent_message_id,
			rootMessageId: row.root_message_id,
			body: row.body,
			authorAccountId: row.author_account_id,
			createdAt: row.created_at
		};
	}

	private isConstraintError(error: unknown): boolean {
		return error instanceof Error && error.message.includes('UNIQUE constraint failed');
	}
}
