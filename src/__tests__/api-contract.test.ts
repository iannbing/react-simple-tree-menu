// API-contract diff test. Runs the standalone check-api-contract script
// against the built dist/index.d.ts.
//
// At M2 (red phase): legacy's dist still contains `cacheSearch`, so the
// script fails with "STILL PRESENT: TreeMenuProps.cacheSearch" — this test
// uses `.fails` so CI stays green while the red signal is still visible.
//
// At M5 (cutover): new code removes cacheSearch, script passes, vitest
// alerts with "expected to fail but passed" → we remove the `.fails`.
//
// If dist/index.d.ts is missing (no build has run), the test skips — build
// isn't a test prerequisite.

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('API contract diff', () => {
  const dist = resolve('dist/index.d.ts');

  it.skipIf(!existsSync(dist)).fails('dist/index.d.ts matches v1 fixture modulo allowlist', () => {
    // Will throw on non-zero exit; `.fails` inverts so the assertion
    // *passing* here means the script *failed* — which is the expected
    // state during the strangulation window.
    expect(() => {
      execSync('node scripts/check-api-contract.mjs', { stdio: 'pipe' });
    }).not.toThrow();
  });
});
