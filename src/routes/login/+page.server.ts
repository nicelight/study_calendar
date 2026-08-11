import type { PageServerLoad } from './$types';
import { getAuthenticationTransport } from '../auth/transport.server';

export const load: PageServerLoad = () => getAuthenticationTransport().loginPage();
