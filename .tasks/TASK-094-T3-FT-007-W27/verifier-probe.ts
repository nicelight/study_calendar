import assert from 'node:assert/strict';
import { CenterSchedulingBoundary } from '../../src/lib/server/modules/center-scheduling/public';
import {
	createIdentityAccessPasswordProvisioningWriter,
	createIdentityAccessProvisioningWriter
} from '../../src/lib/server/modules/identity-access/internal';
import { IdentityAccessBoundary as PublicIdentityAccessBoundary } from '../../src/lib/server/modules/identity-access/public';
import { SharedDatabase } from '../../src/lib/server/platform/database';

const registeredAt = '2099-01-02T03:04:05.000Z';
const later = '2100-01-02T03:04:05.000Z';

function snapshot(database: SharedDatabase) {
	const tables = [
		'accounts',
		'account_profiles',
		'password_credentials',
		'invitations',
		'center_memberships',
		'parent_student_links',
		'sessions'
	] as const;
	return tables.reduce<Record<string, unknown[]>>((result, table) => {
		result[table] = database.sqlite.prepare(`SELECT * FROM ${table} ORDER BY 1`).all();
		return result;
	}, {});
}

function createCenterScheduling(database: SharedDatabase, now: () => Date) {
	const identityAccess = new PublicIdentityAccessBoundary(database, { now });
	const provisioningWriter = createIdentityAccessProvisioningWriter(database, now);
	const passwordProvisioningWriter = createIdentityAccessPasswordProvisioningWriter(database, now);
	const centerScheduling = new CenterSchedulingBoundary(database, {
		resolveActor: identityAccess.resolveActor.bind(identityAccess),
		getAccountEmail: identityAccess.getAccountEmail.bind(identityAccess),
		provisionAccount: provisioningWriter,
		provisionPasswordAccount: passwordProvisioningWriter
	});
	database.sqlite.exec(`
		INSERT INTO centers (id, name) VALUES ('center-verifier', 'Verifier Center');
		INSERT INTO accounts (id, role) VALUES ('admin-verifier', 'admin');
		INSERT INTO sessions (token, account_id, revoked_at)
		VALUES ('session-admin-verifier', 'admin-verifier', NULL);
		INSERT INTO center_memberships (center_id, account_id)
		VALUES ('center-verifier', 'admin-verifier');
	`);
	return { identityAccess, centerScheduling };
}

const bootstrapDatabase = new SharedDatabase({ filename: ':memory:' });
let bootstrapClock = registeredAt;
const bootstrap = new PublicIdentityAccessBoundary(bootstrapDatabase, {
	now: () => new Date(bootstrapClock)
});
bootstrap.bootstrapFirstAdmin({
	email: 'admin@verifier.example',
	surname: '  Bootstrap  ',
	givenName: '  Admin  ',
	password: 'verifier-bootstrap-password'
});
const bootstrapAccount = bootstrapDatabase.sqlite
	.prepare('SELECT id FROM accounts')
	.get() as { id: string };
bootstrapDatabase.sqlite
	.prepare('INSERT INTO sessions (token, account_id, revoked_at) VALUES (?, ?, NULL)')
	.run('bootstrap-session', bootstrapAccount.id);
assert.deepEqual(bootstrap.getCurrentActorProfile('bootstrap-session'), {
	accountId: bootstrapAccount.id,
	fullName: 'Bootstrap Admin',
	role: 'admin',
	registeredAt
});
bootstrapClock = later;
assert.equal(bootstrap.getCurrentActorProfile('bootstrap-session')?.registeredAt, registeredAt);
assert.deepEqual(bootstrap.getStatisticsProfiles([bootstrapAccount.id, bootstrapAccount.id, 'missing']), [
	{ accountId: bootstrapAccount.id, fullName: 'Bootstrap Admin', registeredAt }
]);

const database = new SharedDatabase({ filename: ':memory:' });
let clock = registeredAt;
const { identityAccess, centerScheduling } = createCenterScheduling(database, () => new Date(clock));

const beforeInvalidInvitation = snapshot(database);
assert.throws(
	() => centerScheduling.createParticipant({
		sessionToken: 'session-admin-verifier',
		centerId: 'center-verifier',
		accountId: 'invalid-invitation',
		role: 'student',
		surname: 'Only',
		givenName: '   ',
		invitationToken: 'invalid-invitation-token'
	}),
	/invalid-name/
);
assert.deepEqual(snapshot(database), beforeInvalidInvitation);

centerScheduling.createParticipant({
	sessionToken: 'session-admin-verifier',
	centerId: 'center-verifier',
	accountId: 'invited-verifier',
	role: 'student',
	surname: '  Invited  ',
	givenName: '  Participant  ',
	invitationToken: 'invited-verifier-token'
});
assert.deepEqual(
	database.sqlite
		.prepare('SELECT full_name, registered_at FROM account_profiles WHERE account_id = ?')
		.get('invited-verifier'),
	{ full_name: 'Invited Participant', registered_at: registeredAt }
);
assert.deepEqual(
	database.sqlite
		.prepare('SELECT center_id, account_id FROM center_memberships WHERE account_id = ?')
		.get('invited-verifier'),
	{ center_id: 'center-verifier', account_id: 'invited-verifier' }
);

database.sqlite.exec(`
	CREATE TRIGGER fail_invitation_profile
	BEFORE INSERT ON account_profiles
	WHEN NEW.account_id = 'failed-invitation'
	BEGIN
		SELECT RAISE(ABORT, 'verifier-invitation-profile-failure');
	END;
`);
const beforeFailedInvitation = snapshot(database);
assert.throws(
	() => centerScheduling.createParticipant({
		sessionToken: 'session-admin-verifier',
		centerId: 'center-verifier',
		accountId: 'failed-invitation',
		role: 'student',
		surname: 'Failed',
		givenName: 'Invitation',
		invitationToken: 'failed-invitation-token'
	}),
	/verifier-invitation-profile-failure/
);
assert.deepEqual(snapshot(database), beforeFailedInvitation);
database.sqlite.exec('DROP TRIGGER fail_invitation_profile');

centerScheduling.createPasswordParticipant({
	sessionToken: 'session-admin-verifier',
	centerId: 'center-verifier',
	accountId: 'student-verifier',
	role: 'student',
	surname: 'Student',
	givenName: 'Source',
	email: 'student@verifier.example',
	password: 'verifier-student-password'
});
centerScheduling.createPasswordParticipant({
	sessionToken: 'session-admin-verifier',
	centerId: 'center-verifier',
	accountId: 'parent-verifier',
	role: 'parent',
	surname: 'Parent',
	givenName: 'Linked',
	email: 'parent@verifier.example',
	password: 'verifier-parent-password',
	studentAccountId: 'student-verifier'
});
assert.deepEqual(
	database.sqlite
		.prepare('SELECT full_name, registered_at FROM account_profiles WHERE account_id = ?')
		.get('parent-verifier'),
	{ full_name: 'Parent Linked', registered_at: registeredAt }
);
assert.deepEqual(
	database.sqlite
		.prepare('SELECT center_id, parent_account_id, student_account_id FROM parent_student_links')
		.get(),
	{ center_id: 'center-verifier', parent_account_id: 'parent-verifier', student_account_id: 'student-verifier' }
);

database.sqlite.exec(`
	CREATE TRIGGER fail_password_profile
	BEFORE INSERT ON account_profiles
	WHEN NEW.account_id = 'failed-password'
	BEGIN
		SELECT RAISE(ABORT, 'verifier-password-profile-failure');
	END;
`);
const beforeFailedPassword = snapshot(database);
assert.throws(
	() => centerScheduling.createPasswordParticipant({
		sessionToken: 'session-admin-verifier',
		centerId: 'center-verifier',
		accountId: 'failed-password',
		role: 'parent',
		surname: 'Failed',
		givenName: 'Password',
		email: 'failed@verifier.example',
		password: 'verifier-failed-password',
		studentAccountId: 'student-verifier'
	}),
	/verifier-password-profile-failure/
);
assert.deepEqual(snapshot(database), beforeFailedPassword);

const beforeDuplicateEmail = snapshot(database);
assert.throws(
	() => centerScheduling.createPasswordParticipant({
		sessionToken: 'session-admin-verifier',
		centerId: 'center-verifier',
		accountId: 'duplicate-email',
		role: 'teacher',
		surname: 'Duplicate',
		givenName: 'Email',
		email: 'student@verifier.example',
		password: 'verifier-duplicate-password'
	})
);
assert.deepEqual(snapshot(database), beforeDuplicateEmail);

const parentSession = 'parent-session';
database.sqlite
	.prepare('INSERT INTO sessions (token, account_id, revoked_at) VALUES (?, ?, NULL)')
	.run(parentSession, 'parent-verifier');
assert.deepEqual(identityAccess.getCurrentActorProfile(parentSession), {
	accountId: 'parent-verifier',
	fullName: 'Parent Linked',
	role: 'parent',
	registeredAt
});
identityAccess.revokeSession(parentSession);
assert.equal(identityAccess.getCurrentActorProfile(parentSession), null);

database.sqlite.exec(`
	INSERT INTO accounts (id, role) VALUES ('legacy-verifier', 'student');
	INSERT INTO sessions (token, account_id, revoked_at)
	VALUES ('legacy-session', 'legacy-verifier', NULL);
`);
assert.equal(identityAccess.getCurrentActorProfile('legacy-session'), null);
assert.deepEqual(identityAccess.getStatisticsProfiles(['legacy-verifier']), []);

bootstrapDatabase.close();
database.close();
console.log('VERIFIER_PROBE_PASS all-path atomicity/projection/revocation/no-legacy matrix');
