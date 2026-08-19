"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { readFileSync } = require("node:fs");

// ---- Espelha a rotacao round-robin de supabase/schema.sql (pick_link) ----
// index = (counter - 1) % n  ; counter comeca em 1 e incrementa a cada humano.
function roundRobinIndex(counter, n) {
  return (counter - 1) % n;
}

// ---- Espelha lib/bots.ts (mesmos padroes essenciais) ----
const BOT_PATTERNS = [
  /facebookexternalhit/i, /meta-externalagent/i, /whatsapp/i, /telegrambot/i,
  /googlebot/i, /bingbot/i, /headlesschrome/i, /python-requests/i, /curl\//i,
  /\bbot\b/i, /crawler/i, /spider/i,
];
function isBot(ua) {
  const s = (ua ?? "").trim();
  if (s.length === 0) return true;
  return BOT_PATTERNS.some((re) => re.test(s));
}

test("distribuicao EXATA com 4 links (25% cada)", () => {
  const n = 4, visits = 4000;
  const counts = Array(n).fill(0);
  for (let c = 1; c <= visits; c++) counts[roundRobinIndex(c, n)]++;
  for (const x of counts) assert.strictEqual(x, visits / n); // 1000 cada
});

test("distribuicao EXATA com 5 links (20% cada)", () => {
  const n = 5, visits = 5000;
  const counts = Array(n).fill(0);
  for (let c = 1; c <= visits; c++) counts[roundRobinIndex(c, n)]++;
  for (const x of counts) assert.strictEqual(x, visits / n); // 1000 cada
});

test("diferenca maxima <= 1 mesmo com total nao divisivel", () => {
  const n = 3, visits = 1000; // 1000 nao divide por 3
  const counts = Array(n).fill(0);
  for (let c = 1; c <= visits; c++) counts[roundRobinIndex(c, n)]++;
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
});

test("bots reconhecidos (nao gastam rotacao)", () => {
  assert.ok(isBot("facebookexternalhit/1.1 (+http://www.facebook.com/...)"));
  assert.ok(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"));
  assert.ok(isBot("curl/8.4.0"));
  assert.ok(isBot("python-requests/2.31.0"));
  assert.ok(isBot("")); // UA vazio
});

test("humano real NAO e tratado como bot", () => {
  const chrome =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 " +
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const android =
    "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/126.0 Mobile Safari/537.36";
  assert.ok(!isBot(chrome));
  assert.ok(!isBot(android));
});

test("health check do Painel e publico e nao consulta o Supabase", () => {
  const proxy = readFileSync("proxy.ts", "utf8");
  const health = readFileSync("app/api/health/route.ts", "utf8");

  assert.match(proxy, /pathname === "\/api\/health"/);
  assert.match(proxy, /return NextResponse\.next\(\)/);
  assert.match(health, /export function HEAD/);
  assert.match(health, /status: 204/);
});

test("Brucar Material Shell preserva identidade, versao e retorno ao Painel", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const layout = readFileSync("app/layout.tsx", "utf8");
  const icon = readFileSync("app/icon.svg", "utf8");
  const version = readFileSync("lib/version.ts", "utf8");

  assert.match(css, /--bg: #15120f/);
  assert.match(css, /--accent: #c4512f/);
  assert.match(css, /--signal: #d2ad5c/);
  assert.match(css, /"Avenir Next"/);
  assert.doesNotMatch(css, /--accent: #2f80ff/);
  assert.match(layout, /themeColor: "#15120f"/);
  assert.match(layout, /https:\/\/painel\.brucarventures\.com/);
  assert.match(layout, /favicon\.ico/);
  assert.match(layout, /apple-icon\.png/);
  assert.match(version, /VERSION = "1\.0\.9"/);
  assert.match(layout, /avatarUrl=\{auth\.profile\?\.avatar_url\}/);
  assert.match(readFileSync("app/Logout.tsx", "utf8"), /bruno-avatar\.jpg/);
  assert.ok(readFileSync("public/bruno-avatar.jpg").byteLength > 0);
  assert.match(icon, /stroke="#c4512f"/);
  assert.match(icon, /fill="#d2ad5c"/);
});
