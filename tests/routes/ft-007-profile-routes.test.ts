import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import type { ActorContext, CurrentActorProfile } from '../../src/lib/server/modules/identity-access/public';

const profileServerPath = resolve(process.cwd(), 'src/routes/profile/+page.server.ts');
const profilePagePath = resolve(process.cwd(), 'src/routes/profile/+page.svelte');
const layoutPath = resolve(process.cwd(), 'src/routes/+layout.svelte');

function event(currentActor: ActorContext | null, token = 'profile-session'): any {
	const url = new URL('https://calendar.test/profile');
	return {
		url,
		params: {},
		request: new Request(url),
		locals: { actor: currentActor },
		cookies: { get: (name: string) => name === 'foundation_session' ? token : undefined }
	};
}

async function thrown(action: () => unknown): Promise<any> {
	try {
		await action();
		throw new Error('expected SvelteKit control flow');
	} catch (cause) {
		return cause;
	}
}

describe('FT-007-AC-007 canonical Profile route', () => {
	it('uses the current-actor profile query only, renders exactly its three facts, and fails closed', async () => {
		expect(existsSync(profileServerPath), 'the task-owned /profile server route must exist').toBe(true);
		expect(existsSync(profilePagePath), 'the task-owned /profile page must exist').toBe(true);

		const { _createProfilePageLoad } = await import('../../src/routes/profile/+page.server');
		const ProfilePage = (await import('../../src/routes/profile/+page.svelte')).default;
		const actor: ActorContext = { accountId: 'profile-admin', role: 'admin' };
		const profile: CurrentActorProfile = {
			accountId: actor.accountId,
			fullName: 'Профиль Админа',
			role: 'admin',
			registeredAt: '2026-08-24T10:00:00.000Z'
		};
		const getCurrentActorProfile = vi.fn(() => profile);
		const data = _createProfilePageLoad({ getCurrentActorProfile })(event(actor));

		expect(getCurrentActorProfile).toHaveBeenCalledExactlyOnceWith('profile-session');
		expect(data).toEqual({ profile: { fullName: profile.fullName, role: profile.role, registeredAt: profile.registeredAt } });
		expect(JSON.parse(JSON.stringify(data))).toEqual(data);

		const body = render(ProfilePage, { props: { data } } as any).body;
		for (const value of ['Профиль', 'Профиль Админа', 'admin', '2026-08-24T10:00:00.000Z']) {
			expect(body).toContain(value);
		}
		expect(body).not.toContain('<form');
		expect(body).not.toContain('<input');
		expect(body).not.toContain('<button');

		const anonymousCall = vi.fn(() => profile);
		const anonymous = await thrown(() => _createProfilePageLoad({ getCurrentActorProfile: anonymousCall })(event(null)));
		expect(anonymous.status).toBe(303);
		expect(anonymous.location).toBe('/login');
		expect(anonymousCall).not.toHaveBeenCalled();

		const revoked = await thrown(() => _createProfilePageLoad({ getCurrentActorProfile: () => null })(event(actor, 'revoked-session')));
		expect(revoked.status).toBe(403);
		expect(revoked.body?.message ?? revoked.message).toContain('Forbidden');
	});

	it('keeps the route a narrow Identity & Access query consumer', () => {
		expect(existsSync(profileServerPath), 'the task-owned /profile server route must exist').toBe(true);
		const source = readFileSync(profileServerPath, 'utf8');
		expect(source).toContain('identityAccess.getCurrentActorProfile');
		expect(source).not.toContain('.sqlite');
		expect(source).not.toContain('account_profiles');
		expect(source).not.toContain('center-scheduling');
		expect(source).not.toContain('lesson-context');
		expect(source).not.toContain('financial-ledger');
	});

	it('keeps the shell integration on the exact four canonical destinations and existing logout POST', () => {
		const layout = readFileSync(layoutPath, 'utf8');
		const hrefs = [...layout.matchAll(/<a href="([^"]+)">(?:Home|Classes|Statistics|Profile)<\/a>/g)]
			.map((match) => match[1]);
		expect(hrefs).toEqual(['/home', '/classes', '/statistics', '/profile']);
		expect(layout).toContain('<form method="POST" action="/auth/logout">');
	});
});
