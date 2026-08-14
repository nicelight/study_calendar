import type { Actions, PageServerLoad } from './$types';
import { createAdminCenterActions, createAdminCenterPageLoad } from './center-page.server';

export const load: PageServerLoad = (event) => createAdminCenterPageLoad()(event);

export const actions: Actions = createAdminCenterActions();
