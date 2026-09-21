import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server?.close();
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body };
}

test("health endpoint reports ok", async () => {
  const { status, body } = await request("/api/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("tasks start empty", async () => {
  const { status, body } = await request("/api/tasks");
  assert.equal(status, 200);
  assert.deepEqual(body, []);
});

test("create, toggle, and delete a task", async () => {
  const created = await request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "Write tests" }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, "Write tests");
  assert.equal(created.body.done, false);

  const id = created.body.id;

  const toggled = await request(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ done: true }),
  });
  assert.equal(toggled.status, 200);
  assert.equal(toggled.body.done, true);

  const deleted = await request(`/api/tasks/${id}`, { method: "DELETE" });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.id, id);
});

test("rejects a task without a title", async () => {
  const { status, body } = await request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(status, 400);
  assert.equal(body.error, "title is required");
});

test("returns 404 for a missing task", async () => {
  const { status } = await request("/api/tasks/99999", {
    method: "PATCH",
    body: JSON.stringify({ done: true }),
  });
  assert.equal(status, 404);
});
