import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { getCompositionRoot } from '$lib/server/composition-root';
import type {
	AccessibleClassView,
	CenterSchedulingBoundary,
	CenterSchedulingRegistryFacts,
	ClassMode
} from '$lib/server/modules/center-scheduling/public';
import type { ActorContext, Role } from '$lib/server/modules/identity-access/public';

export type DestinationPort = Pick<
	CenterSchedulingBoundary,
	'getRegistryFacts' | 'getAccessibleClassList'
>;

export type CenterDestination = {
	kind: 'center';
	centerId: string;
	centerName: string;
	href: string;
};

export type ClassDestination = {
	kind: 'class';
	centerId: string;
	classId: string;
	className: string;
	mode: ClassMode;
	href: string;
};

export type CalendarDestination = {
	kind: 'calendar';
	centerId: string;
	classId: string;
	className: string;
	mode: ClassMode;
	href: string;
};

export type Destination = CenterDestination | ClassDestination | CalendarDestination;

export type DestinationPageData = {
	role: Role;
	destinations: Destination[];
};

function forbidden(): never {
	throw error(403, 'Forbidden');
}

function calendarHref(classId: string): string {
	return `/calendar?classId=${encodeURIComponent(classId)}`;
}

function registryDestinations(
	actor: ActorContext,
	registry: CenterSchedulingRegistryFacts,
	requestedClassId: string | null
): DestinationPageData {
	if (requestedClassId && !registry.classes.some((classView) => classView.classId === requestedClassId)) {
		return forbidden();
	}

	if (actor.role === 'admin') {
		return {
			role: actor.role,
			destinations: [
				{
					kind: 'center',
					centerId: registry.institution.centerId,
					centerName: registry.institution.name,
					href: `/admin/${encodeURIComponent(registry.institution.centerId)}`
				}
			]
		};
	}

	return {
		role: actor.role,
		destinations: registry.classes.map((classView) => ({
			kind: 'calendar' as const,
			centerId: classView.centerId,
			classId: classView.classId,
			className: classView.name,
			mode: classView.mode,
			href: calendarHref(classView.classId)
		}))
	};
}

function calendarDestinations(
	actor: ActorContext,
	accessibleClasses: AccessibleClassView[],
	requestedClassId: string | null
): DestinationPageData {
	if (requestedClassId && !accessibleClasses.some((classView) => classView.classId === requestedClassId)) {
		return forbidden();
	}

	const destinations = requestedClassId
		? accessibleClasses.filter((classView) => classView.classId === requestedClassId)
		: accessibleClasses;

	return {
		role: actor.role,
		destinations: destinations.map((classView) => ({
			kind: 'calendar' as const,
			centerId: classView.centerId,
			classId: classView.classId,
			className: classView.name,
			mode: classView.mode,
			href: calendarHref(classView.classId)
		}))
	};
}

export function createDestinationPageLoad(
	centerScheduling: DestinationPort = getCompositionRoot().centerScheduling
): (event: RequestEvent) => DestinationPageData {
	return (event) => {
		const actor = event.locals.actor;
		if (!actor) {
			throw redirect(303, '/login');
		}

		const requestedClassId = event.url.searchParams.get('classId');
		if (actor.role === 'student' || actor.role === 'parent') {
			const accessibleClasses = centerScheduling.getAccessibleClassList({ actor });
			if (!accessibleClasses) {
				return forbidden();
			}
			return calendarDestinations(actor, accessibleClasses, requestedClassId);
		}

		const registry = centerScheduling.getRegistryFacts({ actor });
		if (!registry || registry.centerId !== registry.institution.centerId) {
			return forbidden();
		}
		return registryDestinations(actor, registry, requestedClassId);
	};
}
