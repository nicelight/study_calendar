import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutServerPath = resolve(process.cwd(), 'src/routes/+layout.server.ts');
const layoutPath = resolve(process.cwd(), 'src/routes/+layout.svelte');
const logoutPath = resolve(process.cwd(), 'src/routes/auth/logout/+server.ts');

function read(path: string): string {
	return readFileSync(path, 'utf8');
}

	describe('TASK-079 protected navigation shell', () => {
	it('resolves actor visibility on the server for protected routes only', async () => {
		if (!existsSync(layoutServerPath)) {
			expect(existsSync(layoutServerPath)).toBe(true);
			return;
		}
		const module = await import('../../src/routes/+layout.server');
		const actor = { accountId: 'task-079-admin', role: 'admin' as const };
		const protectedData = module.load({
			locals: { actor },
			url: new URL('http://calendar.test/admin')
		} as never);
		const publicData = module.load({
			locals: { actor },
			url: new URL('http://calendar.test/')
		} as never);
		const classData = module.load({
			locals: { actor },
			url: new URL('http://calendar.test/center/center-one/class/class-one')
		} as never);
		const loginData = module.load({
			locals: { actor: null },
			url: new URL('http://calendar.test/login')
		} as never);

		expect(protectedData).toEqual({ actor: { role: 'admin' } });
		expect(classData).toEqual({ actor: { role: 'admin' } });
		expect(publicData).toEqual({ actor: null });
		expect(loginData).toEqual({ actor: null });
	});

	it('declares the exact shell controls and existing logout integration', () => {
		const layout = read(layoutPath);
		const server = read(layoutServerPath);
		const logout = read(logoutPath);

		expect(server).toContain('locals.actor');
		expect(server).toContain("'/home'");
		expect(server).toContain("'/classes'");
		expect(server).toContain("'/statistics'");
		expect(server).toContain("'/profile'");
		expect(layout).toContain('Открыть меню');
		expect(layout).toContain('href="/home"');
		expect(layout).toContain('href="/classes"');
		expect(layout).toContain('href="/statistics"');
		expect(layout).toContain('href="/profile"');
		expect(layout).toContain('action="/auth/logout"');
		expect(layout).toContain('Выйти');
		expect(logout).toContain('getAuthenticationTransport().logout(event)');
	});

	it('keeps the shell in runes mode and does not expose client authorization inputs', () => {
		const layout = read(layoutPath);

		expect(layout).toContain('$state');
		expect(layout).not.toMatch(/name=["'](?:role|centerId|accountId|sessionToken)["']/);
		expect(layout).not.toContain('localStorage');
	});
});
