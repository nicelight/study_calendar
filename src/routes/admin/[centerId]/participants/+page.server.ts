import type { Actions, PageServerLoad } from './$types';
import {
	createAdminActions,
	createAdminPageLoad
} from '../../participants-page.server';

export const load: PageServerLoad = (event) => createAdminPageLoad()(event);

export const actions: Actions = createAdminActions();
