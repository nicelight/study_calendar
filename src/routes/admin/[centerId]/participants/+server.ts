import type { RequestHandler } from './$types';
import { createAdminPostHandler } from '../../participants-api.server';

export const POST: RequestHandler = (event) => createAdminPostHandler()(event);
