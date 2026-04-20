#!/usr/bin/env node
// Verifies that `dist/index.d.ts` exposes the v1 public API surface modulo
// the documented removals in `test-fixtures/api-v2-removals.json`.
//
// Exit 0 on success, 1 on any unexpected API divergence. Designed to run in
// CI after `npm run build`.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve('dist/index.d.ts');
const FIXTURE = resolve('test-fixtures/api-v1.d.ts');
const ALLOWLIST = resolve('test-fixtures/api-v2-removals.json');

if (!existsSync(DIST)) {
  console.error(`FAIL: ${DIST} does not exist. Run "npm run build" first.`);
  process.exit(1);
}

const distText = readFileSync(DIST, 'utf8');
const fixtureText = readFileSync(FIXTURE, 'utf8');
const allowlist = JSON.parse(readFileSync(ALLOWLIST, 'utf8'));

const errors = [];

// Extract the body of a `type Foo = {...}` or `interface Foo {...}` block,
// correctly handling nested braces (the `data` prop in TreeMenuProps nests).
function extractBlock(text, name) {
  const re = new RegExp(`(?:type|interface)\\s+${name}\\s*(?:=\\s*)?\\{`);
  const match = text.match(re);
  if (!match) return null;
  const openBraceIdx = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = openBraceIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(openBraceIdx + 1, i);
    }
  }
  return null;
}

// Extract top-level prop names from a type/interface body, ignoring
// nested-object prop types.
function extractTopLevelProps(body) {
  if (!body) return null;
  const names = [];
  let depth = 0;
  let lineStart = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '\n') lineStart = i + 1;
    else if (c === ':' && depth === 0) {
      // Walk back from the colon to find the prop name.
      const head = body.slice(lineStart, i);
      const m = head.match(/(\w+)\??\s*$/);
      if (m) names.push(m[1]);
    }
  }
  return new Set(names);
}

// --- 1. Check that every expected named export is present in dist.
const expectedExports = [
  'default',
  'ItemComponent',
  'defaultChildren',
  'KeyDown',
  'TreeMenuProps',
  'TreeMenuItem',
  'TreeMenuChildren',
  'TreeNode',
  'TreeNodeObject',
  'TreeNodeInArray',
  'LocaleFunction',
  'MatchSearchFunction',
  'Item',
  // v2 additions — mirrored in api-v2-removals.json `addedExports`.
  'unflatten',
  'UnflattenResult',
  'collectBranchKeys',
];

for (const name of expectedExports) {
  // Match patterns like:
  //   export { TreeMenu as default, ...}
  //   TreeMenu as default
  //   type TreeMenuProps
  //   declare const ItemComponent
  const patterns = [
    new RegExp(`\\b(?:type\\s+)?${name}\\b(?=\\s*[,}])`),
    new RegExp(`\\b(?:type\\s+)?${name}\\s+as\\s+\\w+`),
    new RegExp(`\\w+\\s+as\\s+${name}\\b`),
    new RegExp(`\\b(?:declare\\s+const|interface|type|class|function)\\s+${name}\\b`),
  ];
  const found = patterns.some((re) => re.test(distText));
  if (!found) {
    errors.push(`MISSING EXPORT: "${name}" not found in dist/index.d.ts`);
  }
}

// --- 2. Check that removed props are actually absent from dist.
for (const [iface, removals] of Object.entries(allowlist.removedProps ?? {})) {
  const body = extractBlock(distText, iface);
  if (body === null) {
    errors.push(
      `MISSING TYPE: expected "${iface}" declaration in dist/index.d.ts`
    );
    continue;
  }
  const props = extractTopLevelProps(body);
  for (const removal of removals) {
    if (props?.has(removal.name)) {
      errors.push(
        `STILL PRESENT: "${iface}.${removal.name}" should be removed per allowlist. ` +
          `Reason: ${removal.reason}`
      );
    }
  }
}

// --- 3. Flag unexpected additions / removals on TreeMenuProps vs fixture.
const distProps = extractTopLevelProps(extractBlock(distText, 'TreeMenuProps'));
const fixtureProps = extractTopLevelProps(
  extractBlock(fixtureText, 'TreeMenuProps')
);
if (distProps && fixtureProps) {
  const allowedAdditions = new Set(
    Object.keys(allowlist.addedProps?.TreeMenuProps ?? {})
  );
  const removedFromFixture = new Set(
    (allowlist.removedProps?.TreeMenuProps ?? []).map((r) => r.name)
  );
  for (const p of distProps) {
    if (!fixtureProps.has(p) && !allowedAdditions.has(p)) {
      errors.push(
        `UNEXPECTED ADDITION: TreeMenuProps.${p} is new in dist and not on allowlist`
      );
    }
  }
  for (const p of fixtureProps) {
    if (!distProps.has(p) && !removedFromFixture.has(p)) {
      errors.push(
        `UNEXPECTED REMOVAL: TreeMenuProps.${p} is in v1 fixture but missing from dist (not on allowlist)`
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`API contract check FAILED (${errors.length} issue(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('API contract check PASSED. dist/index.d.ts matches v1 fixture modulo allowlist.');
process.exit(0);
