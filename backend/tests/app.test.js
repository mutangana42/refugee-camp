process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const { pool } = require('../config/database');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await pool.end();
});

test('GET /health returns API status', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.ok(body.timestamp);
});

test('protected routes reject requests without a bearer token', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/me`);
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.equal(body.error.message, 'Authentication required');
});

test('unknown routes return the standard error shape', async () => {
  const response = await fetch(`${baseUrl}/missing`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.match(body.error.message, /not found/);
});
