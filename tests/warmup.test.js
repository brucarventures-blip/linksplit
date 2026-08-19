const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(path.join(process.cwd(), "app/api/warmup/route.ts"), "utf8");

test("warmup respeita usuário e projetos permitidos", () => {
  assert.match(source, /await getCurrentUser\(\)/);
  assert.match(source, /auth\.allowedProjectIds/);
  assert.match(source, /from\("campaigns"\)/);
  assert.match(source, /private, no-store/);
  assert.match(source, /return empty\(error \? 503 : 204\)/);
});
