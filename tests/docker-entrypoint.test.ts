import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

function makeEntrypointFixture() {
  const root = mkdtempSync(join(process.cwd(), ".next", "portfolio-entrypoint-"));
  const bin = join(root, "test-bin");
  const prismaBin = join(root, "node_modules", ".bin");
  const compiledScripts = join(root, "dist-scripts", "scripts");
  const trace = join(root, "trace.log");
  mkdirSync(bin, { recursive: true });
  mkdirSync(prismaBin, { recursive: true });
  mkdirSync(compiledScripts, { recursive: true });
  copyFileSync(resolve("docker-entrypoint.sh"), join(root, "docker-entrypoint.sh"));
  writeFileSync(join(compiledScripts, "migrate-storage-urls.js"), "");
  writeFileSync(join(compiledScripts, "seed-owner-portfolio.js"), "");

  const nodeStub = join(bin, "node");
  writeFileSync(nodeStub, `#!/bin/sh\nprintf 'node %s\\n' "$*" >> "$ENTRYPOINT_TRACE"\ncase "$*" in *seed-owner-portfolio.js*) if [ "$FAIL_SEED" = true ]; then exit 21; fi;; esac\nexit 0\n`);
  chmodSync(nodeStub, 0o755);

  const prismaStub = join(prismaBin, "prisma");
  writeFileSync(prismaStub, `#!/bin/sh\nprintf 'prisma %s\\n' "$*" >> "$ENTRYPOINT_TRACE"\n`);
  chmodSync(prismaStub, 0o755);

  return { root, bin, trace };
}

function runEntrypoint(root: string, bin: string, trace: string, failSeed = false) {
  return spawnSync("/bin/sh", ["./docker-entrypoint.sh", "/bin/echo", "app-started"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URL: "postgresql://test/db",
      ENTRYPOINT_TRACE: trace,
      FAIL_SEED: String(failSeed),
      PATH: `${bin}:${process.env.PATH || ""}`,
    },
  });
}

test("runs the compiled portfolio seeder after migrations and before the app", () => {
  const fixture = makeEntrypointFixture();
  try {
    const result = runEntrypoint(fixture.root, fixture.bin, fixture.trace);
    const calls = readFileSync(fixture.trace, "utf8");

    assert.equal(result.status, 0, result.stderr);
    assert.ok(calls.indexOf("prisma migrate deploy") < calls.indexOf("node dist-scripts/scripts/migrate-storage-urls.js"));
    assert.ok(calls.indexOf("node dist-scripts/scripts/migrate-storage-urls.js") < calls.indexOf("node dist-scripts/scripts/seed-owner-portfolio.js"));
    assert.match(result.stdout, /app-started/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("does not start the web app if portfolio seeding fails", () => {
  const fixture = makeEntrypointFixture();
  try {
    const result = runEntrypoint(fixture.root, fixture.bin, fixture.trace, true);

    assert.equal(result.status, 21);
    assert.doesNotMatch(result.stdout, /app-started/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("fails closed when the production image has no portfolio seeder", () => {
  const fixture = makeEntrypointFixture();
  try {
    rmSync(join(fixture.root, "dist-scripts", "scripts", "seed-owner-portfolio.js"));
    const result = runEntrypoint(fixture.root, fixture.bin, fixture.trace);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /owner portfolio seeder is missing/);
    assert.doesNotMatch(result.stdout, /app-started/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
