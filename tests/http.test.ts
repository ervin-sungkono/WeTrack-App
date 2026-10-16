import assert from 'node:assert/strict';
import test from 'node:test';
import { readJsonObject, RequestValidationError, genericErrorMessage, genericErrorStatus } from '../server/http';
import { QuotaExceededError } from '../server/quota-policy';

function request(body: string) {
  return new Request('https://wetrack.test/api/project', { method: 'POST', body });
}

function statusIs(status: number) {
  return (error: unknown) => error instanceof RequestValidationError && error.status === status;
}

test('JSON reader measures UTF-8 bytes rather than JavaScript characters', async () => {
  const body = JSON.stringify({ name: '雪雪' });
  const byteLength = new TextEncoder().encode(body).byteLength;
  assert.deepEqual(await readJsonObject(request(body), byteLength), { name: '雪雪' });
  await assert.rejects(readJsonObject(request(body), byteLength - 1), statusIs(413));
});

test('JSON reader caps streamed requests without relying on Content-Length', async () => {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('{"name":"'));
      controller.enqueue(encoder.encode('x'.repeat(50)));
      controller.enqueue(encoder.encode('"}'));
      controller.close();
    },
  });
  const streamed = new Request('https://wetrack.test/api/project', {
    method: 'POST', body, duplex: 'half',
  } as RequestInit);
  await assert.rejects(readJsonObject(streamed, 20), statusIs(413));
});

test('JSON reader rejects empty, malformed, null and array bodies as client errors', async () => {
  for (const body of ['', '{', 'null', '[]', '"string"']) {
    await assert.rejects(readJsonObject(request(body)), statusIs(400));
  }
});

test('unexpected provider errors never expose internal messages to the client', () => {
  const providerError = new Error('credential path /private/project/secret.json was rejected');
  assert.equal(genericErrorStatus(providerError), 500);
  assert.equal(genericErrorMessage(providerError), 'Internal server error');
});

test('only deliberate validation errors retain their client-facing details', () => {
  const error = new RequestValidationError(400, 'Invalid project name');
  assert.equal(genericErrorStatus(error), 400);
  assert.equal(genericErrorMessage(error), 'Invalid project name');
  assert.equal(genericErrorMessage(Object.assign(new Error('private account details'), { status: 403 })), 'Forbidden');
});

test('quota failures expose a generic retryable response', () => {
  const error = new QuotaExceededError(23);
  assert.equal(genericErrorStatus(error), 429);
  assert.equal(genericErrorMessage(error), 'Too many requests');
  assert.equal(error.retryAfter, 23);
});
