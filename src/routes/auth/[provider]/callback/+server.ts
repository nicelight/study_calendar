import type { RequestHandler } from '@sveltejs/kit';
import { getAuthenticationTransport } from '../../transport.server';

export const GET: RequestHandler = (event) => getAuthenticationTransport().callback(event);
