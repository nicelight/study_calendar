import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
	resolve(process.cwd(), 'src/routes/lesson-context/+page.svelte'),
	'utf8'
);

describe('TASK-103 Collaboration browser UI', () => {
	it('renders every projected collaboration target through the existing named actions', () => {
		expect(pageSource).toContain("ReactionForm('field', fieldKey, fieldReactions(fieldKey))");
		expect(pageSource).toContain("ReactionForm('comment', comment.commentId, comment.reactions)");
		expect(pageSource).toContain("ReactionForm('message', message.messageId, message.reactions)");
		expect(pageSource).toContain("actionHref('createFieldComment')");
		expect(pageSource).toContain("actionHref('editFieldComment')");
		expect(pageSource).toContain("actionHref('createMessage')");
		expect(pageSource).toContain("actionHref('replyToMessage')");
		expect(pageSource).toContain("actionHref('setReaction')");
		expect(pageSource).not.toContain('.sqlite');
	});

	it('keeps branch selection in URL state and renders arbitrary-depth replies', () => {
		expect(pageSource).toContain("page.url.searchParams.get('branchRootId')");
		expect(pageSource).toContain('branchRootId: rootMessageId');
		expect(pageSource).toContain('data-selected-branch={branchRootId}');
		expect(pageSource).toContain('function messageDepth');
		expect(pageSource).toContain('data-message-depth={messageDepth(message, allMessages)}');
		expect(pageSource).not.toContain('href={`#branch-${branch.rootMessageId}`}');
	});

	it('keeps participant labels visible for field, comment, and message reactions', () => {
		expect(pageSource).toContain('data-reaction-participants');
		expect(pageSource).toContain('reactionNames(targetReactions)');
		expect(pageSource).toContain('reactorLabel');
	});
});
