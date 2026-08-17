const origin = process.env.TASK034_ORIGIN ?? 'http://127.0.0.1:5175';
const debuggerOrigin = process.env.TASK034_DEBUGGER ?? 'http://127.0.0.1:9222';
const centerId = 'center-task034-verify';
const classId = 'class-task034-verify';
const draftKey = `study-calendar:schedule-draft:${centerId}:${classId}`;

const targets = await (await fetch(`${debuggerOrigin}/json/list`)).json();
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
	if (!message.id) return;
	const reply = replies.get(message.id);
	if (!reply) return;
	replies.delete(message.id);
	reply(message);
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

async function waitForForm() {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		if (
			await evaluate(
				"document.readyState === 'complete' && document.querySelectorAll('.schedule-form').length === 1"
			)
		) return;
		await pause(100);
	}
	throw new Error('Timed out waiting for the schedule form');
}

async function openPage() {
	await cdp('Page.navigate', { url: `${origin}/admin/${centerId}` });
	await waitForForm();
	await pause(150);
}

async function setVisible(field, value) {
	await evaluate(`(() => {
		const input = document.querySelector('[data-schedule-date-field="${field}"]');
		input.focus();
		input.select();
	})()`);
	if (value === '') {
		await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace' });
		await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace' });
	} else {
		await cdp('Input.insertText', { text: value });
	}
	await pause(25);
	return evaluate(`(() => {
		const input = document.querySelector('[data-schedule-date-field="${field}"]');
		const form = input.form;
		const hidden = form.querySelector('input[type="hidden"][name="${field}"]');
		const error = form.querySelector('[data-date-error-for="${field}"]');
		return {
			visible: input.value,
			hiddenIso: hidden.value,
			valid: input.checkValidity(),
			validationMessage: input.validationMessage,
			ariaInvalid: input.getAttribute('aria-invalid'),
			errorHidden: error.hidden,
			formData: Array.from(new FormData(form).entries()),
			stored: localStorage.getItem(${JSON.stringify(draftKey)})
		};
	})()`);
}

await cdp('Network.enable');
await cdp('Emulation.setDeviceMetricsOverride', {
	width: 1280,
	height: 800,
	deviceScaleFactor: 1,
	mobile: false
});
await cdp('Network.setCookie', {
	url: origin,
	name: 'foundation_session',
	value: 'task034-verify-session'
});
await cdp('Storage.clearDataForOrigin', { origin, storageTypes: 'local_storage' });

await openPage();
const result = {
	runtime: {
		origin,
		browser: await evaluate('navigator.userAgent'),
		viewport: await evaluate('({ width: innerWidth, height: innerHeight, devicePixelRatio })')
	},
	initial: await evaluate(`(() => {
		const form = document.querySelector('.schedule-form');
		return {
			visibleFields: Array.from(form.querySelectorAll('[data-schedule-date-field]')).map((input) => ({
				field: input.dataset.scheduleDateField,
				type: input.type,
				name: input.getAttribute('name'),
				placeholder: input.placeholder,
				pattern: input.pattern,
				required: input.required
			})),
			formData: Array.from(new FormData(form).entries()),
			stored: localStorage.getItem(${JSON.stringify(draftKey)})
		};
	})()`),
	validStart: await setVisible('startDate', '29/02/2028'),
	validEnd: await setVisible('endDate', '31/12/2028')
};

result.validCombined = await evaluate(`(() => {
	const form = document.querySelector('.schedule-form');
	const weekday = form.querySelector('[name="weekdays"][value="2"]');
	weekday.checked = true;
	weekday.dispatchEvent(new Event('change', { bubbles: true }));
	return {
		formValid: form.checkValidity(),
		formData: Array.from(new FormData(form).entries()),
		stored: localStorage.getItem(${JSON.stringify(draftKey)}),
		visibleStart: form.querySelector('[data-schedule-date-field="startDate"]').value,
		visibleEnd: form.querySelector('[data-schedule-date-field="endDate"]').value
	};
})()`);

result.malformed = await setVisible('startDate', '2/2/2028');
result.impossible = await setVisible('startDate', '31/02/2028');
result.incomplete = await setVisible('startDate', '12/');
result.emptyRequired = await setVisible('startDate', '');

await evaluate(`localStorage.setItem(${JSON.stringify(draftKey)}, JSON.stringify({
	startDate: '2028-02-29', endDate: '2028-12-31', weekdays: [2]
}))`);
await cdp('Page.reload');
await waitForForm();
await pause(150);
result.restoredIsoDraft = await evaluate(`(() => {
	const form = document.querySelector('.schedule-form');
	return {
		visibleStart: form.querySelector('[data-schedule-date-field="startDate"]').value,
		visibleEnd: form.querySelector('[data-schedule-date-field="endDate"]').value,
		formData: Array.from(new FormData(form).entries()),
		stored: localStorage.getItem(${JSON.stringify(draftKey)})
	};
})()`);

console.log(JSON.stringify(result, null, 2));
socket.close();
