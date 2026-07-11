"use strict";
const test = require("node:test");
const assert = require("node:assert");

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
