import type { RequestHandler } from '@sveltejs/kit';
import { getAuthenticationTransport } from '../transport.server';

export const POST: RequestHandler = (event) => getAuthenticationTransport().logout(event);
