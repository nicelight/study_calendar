import type { PageServerLoad } from './$types';
import { getAuthenticationTransport } from '../../auth/transport.server';

export const load: PageServerLoad = (event) => getAuthenticationTransport().invitePage(event);
