import type { ActorContext } from '$lib/server/modules/identity-access/public';

declare global {
	namespace App {
		interface Locals {
			actor: ActorContext | null;
		}
	}
}

export {};
