import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import express from 'express';
import session from 'express-session';
import NodeID3 from 'node-id3';
import { ZipArchive } from 'archiver';
import downloadRouter from '../routes/download.js';
import settingsRouter from '../routes/settings.js';
import alternateSettingsRouter from '../web-version/routes/settings.js';

const alternateRequire = createRequire(new URL('../web-version/package.json', import.meta.url));
const require = createRequire(import.meta.url);
const AdmZip = alternateRequire('adm-zip');
const audio = Buffer.from('local audio fixture');
const cover = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

async function serve(app, t) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

for (const [name, router] of [['primary', settingsRouter], ['alternate', alternateSettingsRouter]]) {
  test(`${name} settings preserve session state and reset defaults`, async t => {
    const app = express();
    app.use(express.json(), express.urlencoded({ extended: true }));
    app.use(session({ secret: 'local-regression-test', resave: false, saveUninitialized: false }));
    app.use('/settings', router);
    const base = await serve(app, t);
    const initial = await fetch(`${base}/settings`);
    const defaults = await initial.json();
    assert.deepEqual(defaults, {
      name_templates: '{trackno} - {name}', overwrite_files: 'false', embed_images: 'true'
    });
    const cookie = initial.headers.get('set-cookie').split(';')[0];
    const update = await fetch(`${base}/settings`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name_templates: '{name}', embed_images: 'false' })
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).embed_images, 'false');
    const saved = await fetch(`${base}/settings`, { headers: { cookie } });
    assert.equal((await saved.json()).name_templates, '{name}');
    const reset = await fetch(`${base}/settings`, { method: 'DELETE', headers: { cookie } });
    assert.deepEqual(await reset.json(), defaults);
  });
}

test('streamed playlist ZIP preserves filenames, bytes, metadata and progress', async t => {
  const app = express();
  app.use(express.json());
  app.get('/audio', (_req, res) => res.send(audio));
  app.get('/cover', (_req, res) => res.type('jpeg').send(cover));
  app.use('/download', downloadRouter);
  const base = await serve(app, t);
  const progress = [];
  global.downloadTrackers = { regression: { sendProgress: data => progress.push(data) } };
  t.after(() => { delete global.downloadTrackers.regression; });
  const clips = [1, 2].map(no => ({
    id: `clip-${no}`, no, title: `Track ${no}`,
    audio_url: `${base}/audio`, image_url: `${base}/cover`
  }));

  for (const embedImage of ['false', 'true']) {
    progress.length = 0;
    const response = await fetch(`${base}/download/playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlist: { name: 'Local playlist' }, clips, embedImage, sessionId: 'regression' })
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/zip/);
    assert.match(response.headers.get('content-disposition'), /Local%20playlist\.zip/);
    const zip = new AdmZip(Buffer.from(await response.arrayBuffer()));
    assert.deepEqual(zip.getEntries().map(entry => entry.entryName).sort(), ['01 - Track 1.mp3', '02 - Track 2.mp3']);
    for (const clip of clips) {
      const bytes = zip.readFile(`${String(clip.no).padStart(2, '0')} - ${clip.title}.mp3`);
      if (embedImage === 'true') {
        const tags = NodeID3.read(bytes);
        assert.equal(tags.title, clip.title);
        assert.equal(tags.trackNumber, String(clip.no));
        assert.deepEqual(tags.image.imageBuffer, cover);
        assert.deepEqual(NodeID3.removeTagsFromBuffer(bytes), audio);
      } else {
        assert.deepEqual(bytes, audio);
      }
    }
    assert.equal(progress.length, 2);
    assert.equal(progress.at(-1).progress, 100);
    assert.deepEqual(progress.map(item => item.completedItem).sort(), ['clip-1', 'clip-2']);
  }
  const invalid = await fetch(`${base}/download/playlist`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clips: [] })
  });
  assert.equal(invalid.status, 400);
});

test('archiver glob filtering remains compatible with patched minimatch', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'suno-glob-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, 'nested'));
  await writeFile(path.join(directory, 'nested', 'track.mp3'), audio);
  await writeFile(path.join(directory, 'skip.txt'), 'not audio');
  const archive = new ZipArchive();
  const chunks = [];
  archive.on('data', chunk => chunks.push(chunk));
  const ended = once(archive, 'end');
  archive.glob('**/*.mp3', { cwd: directory });
  await archive.finalize();
  await ended;
  const zip = new AdmZip(Buffer.concat(chunks));
  assert.deepEqual(zip.getEntries().map(entry => entry.entryName), ['nested/track.mp3']);
  assert.deepEqual(zip.readFile('nested/track.mp3'), audio);
});

test('alternate ZIP library writes archives that it can read back', () => {
  const zip = new AdmZip();
  zip.addFile('01 - Track.mp3', audio);
  const result = new AdmZip(zip.toBuffer());
  assert.equal(result.getEntries().length, 1);
  assert.deepEqual(result.readFile('01 - Track.mp3'), audio);
});

for (const [name, load] of [['primary', require], ['alternate', alternateRequire]]) {
  test(`${name} nodemon includes watched extensions and excludes ignored directories`, () => {
    const match = load('nodemon/lib/monitor/match.js');
    const result = match(
      ['routes/download.js', 'routes/nested/settings.mjs', 'node_modules/example/index.js', 'README.md'],
      ['**/*', '!**/node_modules/**'],
      'js,mjs'
    );
    assert.deepEqual(result.result.sort(), [
      path.resolve('routes/download.js'), path.resolve('routes/nested/settings.mjs')
    ].sort());
  });
}
