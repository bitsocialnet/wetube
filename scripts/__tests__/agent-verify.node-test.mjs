import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { defaultCommands, runVerification } from '../agent-verify.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-verify-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const lockPath = path.join(root, 'verify.lock');
  const logPath = path.join(root, 'commands.log');
  const script = path.join(root, 'fake-command.mjs');
  writeFileSync(
    script,
    `
import { appendFileSync, existsSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
const [log, label, code, gate] = process.argv.slice(2);
appendFileSync(log, label + ':start\\n');
if (gate) while (!existsSync(gate)) await setTimeout(10);
else await setTimeout(10);
appendFileSync(log, label + ':end\\n');
if (code === 'signal') process.kill(process.pid, 'SIGTERM');
else process.exitCode = Number(code);
`,
  );
  const command = (name, code = 0, gate) => [process.execPath, script, logPath, name, String(code), ...(gate ? [gate] : [])];
  const output = [];
  const options = { cwd: root, lockPath, log: (line) => output.push(line), error: (line) => output.push(line) };
  return { root, lockPath, logPath, command, options, output };
}

async function waitForFile(file) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (existsSync(file)) return;
    await setTimeout(10);
  }
  assert.fail(`Timed out waiting for fixture: ${file}`);
}

function launchVerification(options) {
  const module = new URL('../agent-verify.mjs', import.meta.url).href;
  const child = spawn(process.execPath, [
    '--input-type=module',
    '-e',
    `import { runVerification } from ${JSON.stringify(module)}; process.exitCode = await runVerification(${JSON.stringify(options)});`,
  ]);
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  const completed = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code, signal) => resolve({ code, signal, output }));
  });
  return { child, completed };
}

test('runs checks sequentially and leaves preexisting artifacts untouched', async (t) => {
  const { root, lockPath, logPath, command, options } = fixture(t);
  for (const directory of ['build', 'dist']) {
    mkdirSync(path.join(root, directory));
    writeFileSync(path.join(root, directory, 'contributor.txt'), 'keep me');
  }
  const code = await runVerification({ ...options, commands: ['build', 'lint', 'type-check'].map((name) => command(name)) });
  assert.equal(code, 0);
  assert.equal(readFileSync(logPath, 'utf8'), 'build:start\nbuild:end\nlint:start\nlint:end\ntype-check:start\ntype-check:end\n');
  for (const directory of ['build', 'dist']) assert.equal(readFileSync(path.join(root, directory, 'contributor.txt'), 'utf8'), 'keep me');
  assert.equal(existsSync(lockPath), false);
});

test('preserves the first failure status and reports later failures after running remaining checks', async (t) => {
  const { lockPath, logPath, command, options, output } = fixture(t);
  const code = await runVerification({ ...options, commands: [command('build', 7), command('lint', 3), command('type-check')] });
  assert.equal(code, 7);
  assert.match(output.join('\n'), /build.*exit 7/);
  assert.match(output.join('\n'), /lint.*exit 3/);
  assert.match(output.join('\n'), /2 check\(s\) failed/);
  assert.match(readFileSync(logPath, 'utf8'), /type-check:end/);
  assert.equal(existsSync(lockPath), false);
});

test('advisory failures are reported without changing the exit status', async (t) => {
  const { logPath, command, options, output } = fixture(t);
  const code = await runVerification({ ...options, commands: [command('build'), { command: command('knip', 1), advisory: true }] });
  assert.equal(code, 0);
  assert.match(output.join('\n'), /Advisory: .*knip.*exit 1/);
  assert.doesNotMatch(output.join('\n'), /check\(s\) failed/);
  assert.equal(readFileSync(logPath, 'utf8'), 'build:start\nbuild:end\nknip:start\nknip:end\n');
});

test('default checks add the AI workflow check only when workflow files changed', (t) => {
  const { root } = fixture(t);
  const git = (...args) => {
    const result = spawnSync('git', ['-c', 'user.name=Agent Verify Test', '-c', 'user.email=agent-verify@example.invalid', '-c', 'commit.gpgsign=false', ...args], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
  };
  const labels = () => defaultCommands(root).map((entry) => (Array.isArray(entry) ? entry : entry.command).join(' '));
  // Outside a Git checkout the change set is unknown, so the check must still run.
  assert.ok(labels().includes('corepack yarn ai-workflow:check'));

  git('init', '-q', '-b', 'master');
  writeFileSync(path.join(root, 'app.ts'), 'export {};');
  git('add', 'app.ts');
  git('commit', '-q', '-m', 'initial');
  writeFileSync(path.join(root, 'app.ts'), 'export const value = 1;');
  assert.deepEqual(labels(), [
    'corepack yarn lint',
    'corepack yarn type-check',
    'corepack yarn exec vitest run --maxWorkers=2',
    'corepack yarn build',
    'corepack yarn knip',
  ]);
  assert.equal(defaultCommands(root).at(-1).advisory, true);

  mkdirSync(path.join(root, '.agents/skills/example'), { recursive: true });
  writeFileSync(path.join(root, '.agents/skills/example/SKILL.md'), 'untracked');
  assert.ok(labels().includes('corepack yarn ai-workflow:check'));
  rmSync(path.join(root, '.agents'), { recursive: true });

  git('checkout', '-q', '-b', 'codex/chore/workflow');
  mkdirSync(path.join(root, '.codex'));
  writeFileSync(path.join(root, '.codex/config.toml'), '[agents]\n');
  git('add', '.codex/config.toml');
  git('commit', '-q', '-m', 'workflow');
  assert.ok(labels().includes('corepack yarn ai-workflow:check'));
});

test('missing executables return 127, report the error, and release the lock', async (t) => {
  const { root, lockPath, options, output } = fixture(t);
  const code = await runVerification({ ...options, commands: [[path.join(root, 'missing-command')]] });
  assert.equal(code, 127);
  assert.match(output.join('\n'), /ENOENT/);
  assert.equal(existsSync(lockPath), false);
});

test('reports subprocess signals with a nonzero status', async (t) => {
  const { lockPath, command, options, output } = fixture(t);
  const code = await runVerification({ ...options, commands: [command('build', 'signal')] });
  assert.equal(code, 143);
  assert.match(output.join('\n'), /signal SIGTERM/);
  assert.equal(existsSync(lockPath), false);
});

test('separate processes and worktrees share an atomic slot and busy attempts do no work', async (t) => {
  const { root, lockPath, logPath, command, options, output } = fixture(t);
  const gate = path.join(root, 'release-command');
  const first = launchVerification({ cwd: root, lockPath, commands: [command('build', 0, gate)] });
  t.after(() => first.child.kill('SIGTERM'));
  await waitForFile(logPath);
  const otherWorktree = path.join(root, 'other-worktree');
  mkdirSync(otherWorktree);
  const code = await runVerification({ ...options, cwd: otherWorktree, commands: [command('must-not-run')] });
  assert.equal(code, 75);
  assert.match(output.join('\n'), /slot busy/);
  assert.ok(output.some((line) => line.includes(root) && line.includes(`PID ${first.child.pid}`)));
  assert.equal(readFileSync(logPath, 'utf8'), 'build:start\n');
  assert.equal(existsSync(lockPath), true);
  writeFileSync(gate, 'continue');
  assert.equal((await first.completed).code, 0);
  assert.equal(existsSync(lockPath), false);
});

test('unknown or stale lock metadata is not removed automatically', async (t) => {
  const { lockPath, logPath, command, options } = fixture(t);
  mkdirSync(lockPath);
  writeFileSync(path.join(lockPath, 'owner.json'), '{unreadable');
  assert.equal(await runVerification({ ...options, commands: [command('must-not-run')] }), 75);
  assert.equal(existsSync(logPath), false);
  assert.equal(readFileSync(path.join(lockPath, 'owner.json'), 'utf8'), '{unreadable');
});

test('a replaced lock is preserved and reported as a failure', async (t) => {
  const { root, lockPath, logPath, command, options, output } = fixture(t);
  const gate = path.join(root, 'release-command');
  const completion = runVerification({ ...options, commands: [command('build', 0, gate)] });
  await waitForFile(logPath);
  const ownerPath = path.join(lockPath, 'owner.json');
  const replacement = JSON.stringify({ token: 'another-owner' });
  writeFileSync(ownerPath, replacement);
  writeFileSync(gate, 'continue');
  assert.equal(await completion, 1);
  assert.match(output.join('\n'), /lock ownership changed/);
  assert.equal(readFileSync(ownerPath, 'utf8'), replacement);
});

test('termination forwards to the active command, stops later checks, and releases the lock', async (t) => {
  const { root, lockPath, logPath, command } = fixture(t);
  const run = launchVerification({ cwd: root, lockPath, commands: [command('build', 0, path.join(root, 'never-created')), command('must-not-run')] });
  t.after(() => run.child.kill('SIGTERM'));
  await waitForFile(logPath);
  run.child.kill('SIGTERM');
  const result = await run.completed;
  assert.equal(result.code, 143);
  assert.match(result.output, /signal SIGTERM/);
  assert.equal(readFileSync(logPath, 'utf8'), 'build:start\n');
  assert.equal(existsSync(lockPath), false);
});
