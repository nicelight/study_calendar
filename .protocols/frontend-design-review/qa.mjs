import { chromium } from '@playwright/test';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:5175';
const databasePath = path.resolve('tmp/frontend-review-20260906.db');
const evidenceDir = path.resolve('.protocols/frontend-design-review');
const adminReviewToken = 'frontend-review-admin-20260906-qa';
const centerId = '30c7c313-bc73-4a49-aceb-8f351e73ee76';
const classId = '1d760b24-43f9-4b87-9799-1e447af2e2c6';
const lessonId = '223681dd-ba1a-44ed-97bf-7e3d4c76d14c:2026-08-15';
const lessonDate = '2026-08-15';

fs.mkdirSync(evidenceDir, { recursive: true });

const targetsByRole = {
	anonymous: [
		{ id: 'public', path: '/' },
		{ id: 'login', path: '/login' }
	],
	student: [
		{ id: 'calendar-student', path: `/calendar?classId=${classId}&date=${lessonDate}` },
		{
			id: 'lesson-student',
			path: `/lesson-context?classId=${classId}&lessonId=${encodeURIComponent(lessonId)}&date=${lessonDate}`
		}
	],
	parent: [
		{ id: 'calendar-parent', path: `/calendar?classId=${classId}&date=${lessonDate}` },
		{
			id: 'lesson-parent',
			path: `/lesson-context?classId=${classId}&lessonId=${encodeURIComponent(lessonId)}&date=${lessonDate}`
		}
	],
	admin: [
		{ id: 'home-admin', path: '/home' },
		{ id: 'profile-admin', path: '/profile' },
		{ id: 'statistics-admin', path: '/statistics' },
		{ id: 'admin-center', path: `/admin/${centerId}` },
		{ id: 'admin-finance', path: `/admin/${centerId}/finance` }
	]
};

function metricValue(metrics, name) {
	return metrics.find((metric) => metric.name === name)?.value ?? null;
}

async function readPerformance(cdp) {
	const response = await cdp.send('Performance.getMetrics');
	return metricValue(response.metrics, 'TaskDuration');
}

async function inspectPage(page, cdp, viewportWidth) {
	const taskBefore = await readPerformance(cdp);
	await page.waitForTimeout(450);
	const taskAfter = await readPerformance(cdp);
	const state = await page.evaluate((width) => {
		const visible = (element) => {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
		};
		const rectOf = (element) => {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return {
				selector: element.className || element.tagName.toLowerCase(),
				width: Math.round(rect.width * 10) / 10,
				height: Math.round(rect.height * 10) / 10,
				fontSize: style.fontSize,
				minHeight: style.minHeight
			};
		};
		const documentElement = document.documentElement;
		const bodyStyle = getComputedStyle(document.body);
		const focusSelectors = 'a, button, input, select, textarea';
		const focusables = [...document.querySelectorAll(focusSelectors)].filter(visible);
		const dateInput = document.querySelector('input[aria-label="Выбранная дата"]');
		const formFields = [...document.querySelectorAll('form input:not([type="hidden"]), form select, form textarea')].filter(visible);
		const targetSelector = '.login-link, .day, .day-link, .lesson-link, form button, input[aria-label="Выбранная дата"]';
		const targetSizes = [...document.querySelectorAll(targetSelector)].filter(visible).map(rectOf);
		const runningAnimations = document.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').map((animation) => ({
			name: animation.animationName || animation.effect?.target?.className || 'anonymous',
			currentTime: animation.currentTime,
			iterations: animation.effect?.getTiming?.().iterations ?? null,
			duration: animation.effect?.getTiming?.().duration ?? null
		}));
		const nestedHorizontalScroll = [...document.querySelectorAll('*')].filter((element) => {
			const style = getComputedStyle(element);
			return visible(element) && ['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
		}).map((element) => element.className || element.tagName.toLowerCase());
		const palette = {
			backgroundColor: bodyStyle.backgroundColor,
			color: bodyStyle.color,
			fontFamily: bodyStyle.fontFamily
		};
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		return {
			viewport: width,
			url: location.href,
			title: document.title,
			bodyPalette: palette,
			documentOverflow: documentElement.scrollWidth > documentElement.clientWidth + 1,
			documentWidth: documentElement.scrollWidth,
			viewportDocumentWidth: documentElement.clientWidth,
			nestedHorizontalScroll,
			focusableCount: focusables.length,
			dateInput: dateInput ? rectOf(dateInput) : null,
			formFields: formFields.map(rectOf),
			touchTargets: targetSizes,
			focusTarget: document.activeElement?.tagName?.toLowerCase() ?? null,
			focusTargetVisible: document.activeElement instanceof HTMLElement ? visible(document.activeElement) : false,
			runningAnimations,
			reducedMotion
		};
	}, viewportWidth);

	return {
		...state,
		taskDurationDelta: taskBefore !== null && taskAfter !== null ? taskAfter - taskBefore : null
	};
}

async function checkMobileFocus(page, selector) {
	const element = page.locator(selector).first();
	if (!(await element.count())) return null;
	await element.focus();
	return page.evaluate(() => ({
		selector: document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.className ?? document.activeElement?.tagName,
		visible: document.activeElement instanceof HTMLElement && document.activeElement.getBoundingClientRect().height > 0,
		focusVisibleSupported: typeof CSS !== 'undefined' && CSS.supports('selector(:focus-visible)')
	}));
}

async function gotoWithRetry(page, url) {
	try {
		return await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : String(cause);
		if (!message.includes('ERR_ABORTED')) throw cause;
		await page.waitForTimeout(900);
		return page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
	}
}

async function runTarget(page, context, target, role, viewport, paletteBaseline) {
	const pageErrors = [];
	const consoleErrors = [];
	const failedRequests = [];
	const onPageError = (error) => pageErrors.push(error.message);
	const onConsole = (message) => {
		if (message.type() === 'error') consoleErrors.push(message.text());
	};
	const onRequestFailed = (request) => failedRequests.push(new URL(request.url()).pathname);
	page.on('pageerror', onPageError);
	page.on('console', onConsole);
	page.on('requestfailed', onRequestFailed);

	await page.emulateMedia({ reducedMotion: 'no-preference' });
	let response;
	let error = null;
	try {
		response = await gotoWithRetry(page, `${baseUrl}${target.path}`);
		await page.waitForTimeout(220);
	} catch (cause) {
		error = cause instanceof Error ? cause.message : String(cause);
	}

	const cdp = await context.newCDPSession(page);
	await cdp.send('Performance.enable');
	let normal = null;
	if (!error) {
		normal = await inspectPage(page, cdp, viewport.width);
		if (viewport.width <= 390) {
			normal.mobileFocus = {
				date: await checkMobileFocus(page, 'input[aria-label="Выбранная дата"]'),
				firstLink: await checkMobileFocus(page, 'a')
			};
		}
		await page.screenshot({
			path: path.join(evidenceDir, `${viewport.id}-${target.id}.png`),
			fullPage: true
		});

		await page.emulateMedia({ reducedMotion: 'reduce' });
		await gotoWithRetry(page, page.url());
		await page.waitForTimeout(220);
		const reduced = await inspectPage(page, cdp, viewport.width);
		normal.reducedCheck = {
			mediaMatches: reduced.reducedMotion,
			runningAnimations: reduced.runningAnimations
		};
	}

	const result = {
		role,
		viewport: viewport.id,
		target: target.id,
		requestedPath: target.path,
		status: response?.status() ?? null,
		finalPath: new URL(page.url()).pathname + new URL(page.url()).search,
		error,
		pageErrors,
		consoleErrors,
		failedRequests,
		inspection: normal,
		paletteDrift: normal && paletteBaseline && JSON.stringify(normal.bodyPalette) !== JSON.stringify(paletteBaseline)
	};

	page.off('pageerror', onPageError);
	page.off('console', onConsole);
	page.off('requestfailed', onRequestFailed);
	return { result, palette: normal?.bodyPalette ?? paletteBaseline };
}

const db = new Database(databasePath);
const adminAccountId = db.prepare("select id from accounts where role = 'admin' order by id limit 1").get().id;
db.prepare('insert or replace into sessions (token, account_id, revoked_at) values (?, ?, null)').run(adminReviewToken, adminAccountId);

const roleTokens = { admin: adminReviewToken };
for (const role of ['student', 'parent']) {
	const row = db.prepare(`
		select s.token
		from sessions s join accounts a on a.id = s.account_id
		where a.role = ? and s.revoked_at is null
		order by s.rowid
		limit 1
	`).get(role);
	roleTokens[role] = row?.token;
}

const viewports = [
	{ id: 'wide-1440x1000', width: 1440, height: 1000 },
	{ id: 'mobile-390x844', width: 390, height: 844 }
];
const report = [];

try {
	const browser = await chromium.launch({ channel: 'chrome', headless: true });
	try {
		for (const viewport of viewports) {
			for (const [role, targets] of Object.entries(targetsByRole)) {
				const token = roleTokens[role];
				const context = await browser.newContext({ viewport });
				if (token) {
					await context.addCookies([{ name: 'foundation_session', value: token, domain: '127.0.0.1', path: '/' }]);
				}
				const page = await context.newPage();
				let paletteBaseline = null;
				for (const target of targets) {
					const output = await runTarget(page, context, target, role, viewport, paletteBaseline);
					paletteBaseline ??= output.palette;
					report.push(output.result);
				}
				await context.close();
			}
		}
	} finally {
		await browser.close();
	}
} finally {
	db.prepare('delete from sessions where token = ?').run(adminReviewToken);
	db.close();
}

console.log(JSON.stringify({ generatedScreenshots: report.filter((entry) => !entry.error).length, results: report }, null, 2));
