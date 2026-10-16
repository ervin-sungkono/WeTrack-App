import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseLoginInput,
  parseProfileUpdate,
  parseRegistrationInput,
  isSameOriginMutation,
  projectMembershipDocumentId,
  sanitizeAuthUser,
  toProfileDetails,
  toPublicProfile,
} from '../server/security'

test('registration input is normalized and only validated credentials are returned', () => {
  const result = parseRegistrationInput({
    fullName: '  Ada Lovelace  ',
    email: ' ADA@example.com ',
    password: 'ValidPass123',
    isAdmin: true,
  })

  assert.deepEqual(result, {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'ValidPass123',
  })
  assert.equal(parseRegistrationInput({ fullName: 'Al', email: 'ada@example.com', password: 'weak' }), null)
})

test('login parsing rejects malformed email and never trims the password', () => {
  assert.equal(parseLoginInput({ email: `${'x'.repeat(255)}@example.com`, password: 'Password1' }), null);
  assert.equal(parseLoginInput({ email: 'user@example.com', password: 'x'.repeat(1025) }), null);
  assert.deepEqual(parseLoginInput({ email: ' ADA@example.com ', password: '  Secret123  ' }), {
    email: 'ada@example.com',
    password: '  Secret123  ',
  })
  assert.equal(parseLoginInput({ email: 'not-an-email', password: 'Secret123' }), null)
})

test('profile updates accept only bounded profile fields and exclude submitted email', () => {
  assert.deepEqual(parseProfileUpdate({
    fullName: 'Ada Lovelace',
    description: 'Mathematician',
    jobPosition: 'Engineer',
    location: 'London',
    email: 'attacker@example.com',
    deletedAt: null,
  }), {
    fullName: 'Ada Lovelace',
    description: 'Mathematician',
    jobPosition: 'Engineer',
    location: 'London',
  })
  assert.equal(parseProfileUpdate({ fullName: 'Ada Lovelace', description: 'x'.repeat(257), jobPosition: '', location: '' }), null)
})

test('public profile projection strips private fields and unsafe image URLs', () => {
  const profile = toPublicProfile({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    passwordHash: 'secret',
    deletedAt: { seconds: 100, nanoseconds: 0 },
    description: 'Mathematician',
    profileImage: { attachmentStoragePath: 'https://evil.example/image.png', originalFileName: 'image.png' },
    createdAt: { seconds: 20, nanoseconds: 5 },
  })

  assert.deepEqual(profile, {
    fullName: 'Ada Lovelace',
    profileImage: null,
  })
  assert.deepEqual(toProfileDetails({
    fullName: 'Ada Lovelace',
    description: 'Mathematician',
    jobPosition: 'Engineer',
    location: 'London',
    createdAt: { seconds: 20, nanoseconds: 5 },
  }), {
    fullName: 'Ada Lovelace',
    profileImage: null,
    description: 'Mathematician',
    jobPosition: 'Engineer',
    location: 'London',
    createdAt: { seconds: 20, nanoseconds: 5 },
  })
})

test('session user projection does not retain arbitrary token or credential fields', () => {
  const sessionUser = sanitizeAuthUser({
    uid: 'firebase-uid',
    email: 'ada@example.com',
    fullName: 'Ada Lovelace',
    isVerified: true,
    password: 'secret',
    admin: true,
    profileImage: null,
  })

  assert.deepEqual(sessionUser, {
    uid: 'firebase-uid',
    email: 'ada@example.com',
    fullName: 'Ada Lovelace',
    profileImage: null,
    isVerified: true,
  })
  assert.throws(() => projectMembershipDocumentId('project/invalid', 'user-id'))
  assert.equal(projectMembershipDocumentId('project-id', 'user-id'), 'project-id_user-id')
})

test('mutation origin check rejects cross-origin and sibling-subdomain requests', () => {
  const requestOrigin = 'https://app.example.test'
  const isAllowed = (input: Partial<Parameters<typeof isSameOriginMutation>[0]>) => isSameOriginMutation({
    method: 'POST',
    origin: null,
    secFetchSite: null,
    requestOrigin,
    ...input,
  })

  assert.equal(isAllowed({ origin: requestOrigin }), true)
  assert.equal(isAllowed({ origin: 'https://evil.example.test', secFetchSite: 'same-site' }), false)
  assert.equal(isAllowed({ origin: 'https://attacker.test', secFetchSite: 'cross-site' }), false)
  assert.equal(isAllowed({ origin: null, secFetchSite: 'cross-site' }), false)
  assert.equal(isAllowed({ origin: null, secFetchSite: 'same-origin' }), true)
  assert.equal(isAllowed({ origin: null, secFetchSite: null }), true)
  assert.equal(isSameOriginMutation({ method: 'GET', origin: 'https://attacker.test', secFetchSite: 'cross-site', requestOrigin }), true)
})
