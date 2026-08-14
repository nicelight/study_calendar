import type { Actions, PageServerLoad } from './$types';
import { getAuthenticationTransport } from '../auth/transport.server';
import { createPasswordLoginActions } from './password-login.server';

export const load: PageServerLoad = () => getAuthenticationTransport().loginPage();

export const actions: Actions = createPasswordLoginActions();
