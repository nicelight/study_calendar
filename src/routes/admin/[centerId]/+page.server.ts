import type { Actions, PageServerLoad } from './$types';
import {
	createAdminDashboardActions,
	createAdminDashboardPageLoad
} from '../center-dashboard.server';

export const load: PageServerLoad = (event) => createAdminDashboardPageLoad()(event);

export const actions: Actions = createAdminDashboardActions();
