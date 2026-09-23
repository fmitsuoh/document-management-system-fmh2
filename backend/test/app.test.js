const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

// Teste de fumaça do seed: garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

let server;
let baseUrl;
const STORAGE_DIR = path.join(__dirname, '..', 'storage');

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  for (const entry of fs.readdirSync(STORAGE_DIR)) {
    if (entry !== '.gitkeep') {
      fs.rmSync(path.join(STORAGE_DIR, entry), { force: true });
    }
  }
});

beforeEach(() => {
  documentRepository.reset();
});

async function uploadFixture(owner = 'user-001') {
  const formData = new FormData();
  formData.append('file', new Blob(['conteúdo de teste']), 'arquivo-teste.txt');
  formData.append('owner', owner);

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
  const body = await response.json();
  return { response, body };
}

test('POST /upload cria documento e retorna metadados sem expor caminho no filesystem', async () => {
  const { response, body } = await uploadFixture();

  assert.strictEqual(response.status, 201);
  assert.ok(body.id.startsWith('doc_'));
  assert.strictEqual(body.originalName, 'arquivo-teste.txt');
  assert.strictEqual(body.owner, 'user-001');
  assert.strictEqual(body.storagePath, undefined, 'a resposta não deve expor o caminho interno do arquivo');
  assert.strictEqual(body.storedName, undefined, 'a resposta não deve expor o nome interno do arquivo');
});

test('POST /upload sem arquivo retorna 400 MISSING_FILE', async () => {
  const formData = new FormData();
  formData.append('owner', 'user-001');

  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.code, 'MISSING_FILE');
});

test('GET /documents sem header X-User-Id retorna 400 OWNER_REQUIRED', async () => {
  const response = await fetch(`${baseUrl}/documents`);
  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.code, 'OWNER_REQUIRED');
});

test('GET /documents lista apenas os documentos do owner informado', async () => {
  await uploadFixture('user-001');
  await uploadFixture('user-002');

  const response = await fetch(`${baseUrl}/documents`, { headers: { 'X-User-Id': 'user-001' } });
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.length, 1);
  assert.strictEqual(body[0].owner, 'user-001');
});

test('GET /documents/:id/download baixa o arquivo do dono correto', async () => {
  const { body: document } = await uploadFixture('user-001');

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'user-001' },
  });
  const text = await response.text();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(text, 'conteúdo de teste');
});

test('GET /documents/:id/download nega acesso a documento de outro dono com 404', async () => {
  const { body: document } = await uploadFixture('user-001');

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'user-002' },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 404);
  assert.strictEqual(body.code, 'DOCUMENT_NOT_FOUND');
});

test('GET /documents/:id/download com id inexistente retorna 404', async () => {
  const response = await fetch(`${baseUrl}/documents/doc_inexistente/download`, {
    headers: { 'X-User-Id': 'user-001' },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 404);
  assert.strictEqual(body.code, 'DOCUMENT_NOT_FOUND');
});
