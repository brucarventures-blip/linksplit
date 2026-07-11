// Deteccao de trafego automatizado (crawlers/bots).
//
// Objetivo no seu caso: quando voce posta o link no Facebook, o robo
// "facebookexternalhit" acessa a URL para gerar o preview. Se ele contasse,
// roubaria uma rotacao e distorceria a divisao (25%/25%/...). Aqui a gente
// identifica esses acessos automaticos para NAO consumir rotacao e manter
// a distribuicao entre humanos exata, alem de deixar as stats limpas.
//
// Importante: isto filtra apenas robos/crawlers. Nao ha nada aqui que mostre
// pagina diferente para pessoas reais.

const BOT_PATTERNS: RegExp[] = [
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /meta-externalagent/i,
  /instagram/i,
  /whatsapp/i,
  /telegrambot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /slackbot/i,
  /discordbot/i,
  /googlebot/i,
  /google-inspectiontool/i,
  /adsbot-google/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /applebot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /ccbot/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /python-requests/i,
  /axios/i,
  /go-http-client/i,
  /curl\//i,
  /wget/i,
  /libwww-perl/i,
  /\bbot\b/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /preview/i,
  /monitor/i,
];

export function isBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  // User-agent vazio -> quase sempre e automacao/checagem, tratamos como bot.
  if (ua.length === 0) return true;
  return BOT_PATTERNS.some((re) => re.test(ua));
}
