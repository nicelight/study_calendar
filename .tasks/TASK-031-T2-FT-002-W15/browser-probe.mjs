import { readFile } from 'node:fs/promises';

const mode = process.argv[2] ?? 'red';
const origin = 'http://127.0.0.1:5175';
const centerA = 'center-task031-a';
const centerB = 'center-task031-b';
const classA1 = 'class-task031-a1';
const classA2 = 'class-task031-a2';
const classB1 = 'class-task031-b1';
const key = (centerId, classId) => `study-calendar:schedule-draft:${centerId}:${classId}`;

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = targets.find((entry) => entry.type === 'page');
if (!target) throw new Error('No Chrome page target is available');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const replies = new Map();
socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	if (message.id) {
		const reply = replies.get(message.id);
		if (reply) {
			replies.delete(message.id);
			reply(message);
		}
	}
});

function cdp(method, params = {}) {
	const id = ++sequence;
	socket.send(JSON.stringify({ id, method, params }));
	return new Promise((resolve, reject) => {
		replies.set(id, (message) => {
			if (message.error) reject(new Error(`${method}: ${message.error.message}`));
			else resolve(message.result);
		});
	});
}

function pause(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function evaluate(expression) {
	const result = await cdp('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
	return result.result.value;
}

async function open(centerId) {
	await cdp('Page.navigate', { url: `${origin}/admin/${centerId}` });
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const ready = await evaluate("document.readyState === 'complete' && document.querySelectorAll('.schedule-form').length > 0");
		if (ready) return;
		await pause(100);
	}
	throw new Error(`Timed out opening ${centerId}`);
}

function formExpression(classId) {
	return `Array.from(document.querySelectorAll('.schedule-form')).find((form) => form.querySelector('[name="classId"]')?.value === '${classId}')`;
}

async function populate(classId, weekdays = [2, 4, 6]) {
	await evaluate(`(() => {
		const form = ${formExpression(classId)};
		if (!form) throw new Error('schedule form missing');
		form.querySelector('[name="startDate"]').value = '2026-08-12';
		form.querySelector('[name="endDate"]').value = '2026-09-01';
		for (const input of form.querySelectorAll('[name="weekdays"]')) input.checked = ${JSON.stringify(weekdays)}.includes(Number(input.value));
		for (const input of form.querySelectorAll('input')) input.dispatchEvent(new Event(input.type === 'checkbox' ? 'change' : 'input', { bubbles: true }));
		return Array.from(new FormData(form).entries());
	})()`);
}

async function readForm(classId) {
	return evaluate(`(() => {
		const form = ${formExpression(classId)};
		if (!form) return null;
		return {
			startDate: form.querySelector('[name="startDate"]').value,
			endDate: form.querySelector('[name="endDate"]').value,
			weekdays: Array.from(form.querySelectorAll('[name="weekdays"]')).filter((input) => input.checked).map((input) => Number(input.value)),
			formData: Array.from(new FormData(form).entries())
		};
	})()`);
}

async function reload() {
	await evaluate('location.reload()');
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const ready = await evaluate("document.readyState === 'complete' && document.querySelectorAll('.schedule-form').length > 0");
		if (ready) {
			await pause(150);
			return;
		}
		await pause(100);
	}
	throw new Error('Timed out reloading page');
}

await cdp('Network.enable');
await cdp('Network.setCookie', {
	url: origin,
	name: 'foundation_session',
	value: 'task031-session'
});
await cdp('Storage.clearDataForOrigin', { origin, storageTypes: 'local_storage' });

const result = { mode, origin, keyA1: key(centerA, classA1) };
await open(centerA);
result.before = await readForm(classA1);
await populate(classA1);
result.populatedBeforeReload = await readForm(classA1);
result.storageBeforeReload = await evaluate(`localStorage.getItem('${key(centerA, classA1)}')`);
await reload();
result.afterReload = await readForm(classA1);
result.storageAfterReload = await evaluate(`localStorage.getItem('${key(centerA, classA1)}')`);

if (mode === 'green') {
	result.sameClassRestored = await readForm(classA1);
	result.sameClassKey = await evaluate(`localStorage.getItem('${key(centerA, classA1)}')`);
	result.otherClass = await readForm(classA2);
	result.otherClassKey = await evaluate(`localStorage.getItem('${key(centerA, classA2)}')`);
	await open(centerB);
	result.otherCenter = await readForm(classB1);
	result.otherCenterKey = await evaluate(`localStorage.getItem('${key(centerB, classB1)}')`);

	await evaluate(`localStorage.setItem('${key(centerA, classA1)}', '{bad json')`);
	await open(centerA);
	await reload();
	result.invalidJsonFallback = await readForm(classA1);
	await evaluate(`localStorage.setItem('${key(centerA, classA1)}', JSON.stringify({ startDate: '2026-08-12', endDate: '2026-09-01', weekdays: [2], extra: 'ignored' }))`);
	await reload();
	result.wrongShapeFallback = await readForm(classA1);
	await evaluate(`localStorage.setItem('${key(centerA, classA1)}', JSON.stringify({ startDate: '2026-02-30', endDate: '2026-09-01', weekdays: [2] }))`);
	await reload();
	result.invalidDateFallback = await readForm(classA1);
	await evaluate(`localStorage.setItem('${key(centerA, classA1)}', JSON.stringify({ startDate: '2026-08-12', endDate: '2026-09-01', weekdays: [7] }))`);
	await reload();
	result.invalidWeekdayFallback = await readForm(classA1);

	await populate(classA1, [2, 4, 6]);
	await evaluate(`(() => { const form = ${formExpression(classA1)}; for (const input of form.querySelectorAll('[name="weekdays"]')) { input.checked = false; input.dispatchEvent(new Event('change', { bubbles: true })); } form.requestSubmit(); })()`);
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const error = await evaluate("document.querySelector('.notice.error')?.textContent");
		if (error) { result.validationError = error; break; }
		await pause(100);
	}
	result.failedSubmission = await readForm(classA1);
	result.keyAfterFailedSubmission = await evaluate(`localStorage.getItem('${key(centerA, classA1)}')`);

	await populate(classA1, [2, 4, 6]);
	result.successFormData = await readForm(classA1);
	await evaluate(`localStorage.setItem('${key(centerA, classA2)}', JSON.stringify({ startDate: '2026-10-01', endDate: '2026-10-31', weekdays: [1, 3] }))`);
	result.otherKeyBeforeSuccess = await evaluate(`localStorage.getItem('${key(centerA, classA2)}')`);
	await evaluate(`(${formExpression(classA1)}).requestSubmit()`);
	for (let attempt = 0; attempt < 80; attempt += 1) {
		const success = await evaluate("document.querySelector('.notice.success')?.textContent");
		if (success) { result.successMessage = success; break; }
		await pause(100);
	}
	result.keyAfterSuccess = await evaluate(`localStorage.getItem('${key(centerA, classA1)}')`);
	result.otherKeyAfterSuccess = await evaluate(`localStorage.getItem('${key(centerA, classA2)}')`);
	await reload();
	result.afterSuccessReload = await readForm(classA1);
}

console.log(JSON.stringify(result, null, 2));
socket.close();
