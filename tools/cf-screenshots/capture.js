const fs = require('node:fs/promises');
const path = require('node:path');

const { chromium } = require('playwright');

const AUTH_DIR = path.join(process.cwd(), '.auth');
const STORAGE_STATE_PATH = path.join(AUTH_DIR, 'storageState.json');

const OUTPUT_DIR = path.join(process.cwd(), 'docs', 'screenshots', 'auto');

const DEFAULT_ZERO_TRUST_HOME =
  'https://one.dash.cloudflare.com/aa8ab6fe5b7f906df426a972033e922a/home';

const DEFAULT_DOC_FILES = [
  '00-quick-start.md',
  '01-prerequisites.md',
  '01a-rule-expressions.md',
  '02-dns-filtering.md',
  '03-secure-web-gateway.md',
  '04-antivirus-scanning.md',
  '05-device-posture.md',
  '06-ztna.md',
  '07-browser-isolation.md',
  '08-logs-analytics.md',
  '09-workshop-summary.md',
  '10-dlp-optional.md',
  '11-casb-optional.md',
];

const NAV_LABEL_ALIASES = {
  'Traffic policies': ['Traffic policies', 'Gateway'],
  'Firewall policies': ['Firewall policies', 'Policies'],
  'Traffic settings': ['Traffic settings', 'Settings'],
  'Access controls': ['Access controls', 'Access'],
  'Team & Resources': ['Team & Resources', 'Settings'],
  'Administrators': ['Administrators', 'Admins', 'Members', 'Account members'],
  'Reusable components': ['Reusable components', 'Reusable'],
  'Networks': ['Networks', 'Network'],
  'Connectors': ['Connectors', 'Tunnels', 'Cloudflare Tunnel'],
  'Resolvers & Proxies': ['Resolvers & Proxies', 'Resolver', 'DNS'],
  'DNS Locations': ['DNS Locations', 'Locations'],
  'Device profiles': ['Device profiles', 'Profiles'],
  'Device enrollment': ['Device enrollment', 'Enrollment'],
  'Data loss prevention': ['Data loss prevention', 'DLP'],
  'Integrations': ['Integrations'],
  'Identity providers': ['Identity providers', 'Identity Providers'],
  'Cloud & SaaS': ['Cloud & SaaS', 'Cloud and SaaS'],
  'Cloud & SaaS findings': ['Cloud & SaaS findings', 'Findings', 'Cloud & SaaS'],
  'Insights': ['Insights', 'Analytics'],
  'Logs': ['Logs', 'Log Explorer'],
  'Dashboards': ['Dashboards', 'Dashboard'],
  'Notifications': ['Notifications', 'Notifications and alerts', 'Alerts', 'Alerting'],
};

function withAlias(label) {
  return NAV_LABEL_ALIASES[label] || [label];
}

function labelOptionsToText(options) {
  if (Array.isArray(options)) {
    return String(options[0] || '').trim();
  }
  return String(options || '').trim();
}

function slugify(raw) {
  return raw
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeNavValue(raw) {
  return raw
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*>\s*/g, ' > ')
    .replace(/>\s*Your Tunnel\s*$/i, '')
    .replace(/\s*>\s*Add new identity provider\s*$/i, '')
    .trim()
    .replace(/\s*>\s*$/g, '');
}

function extractGoToValue(lines, index) {
  const line = lines[index];
  const inlineMatch = line.match(/^\*\*Go to:\*\*\s*(.+?)\s*$/);
  if (inlineMatch && inlineMatch[1]) {
    return { value: inlineMatch[1].trim() };
  }

  if (line.trim() !== '**Go to:**') {
    return null;
  }

  const next = lines[index + 1] || '';
  if (next.trim().startsWith('```')) {
    const urlLine = (lines[index + 2] || '').trim();
    if (urlLine) {
      return { value: urlLine };
    }
  }

  const nextNonEmpty = (lines[index + 1] || '').trim();
  if (nextNonEmpty) {
    return { value: nextNonEmpty };
  }

  return null;
}

async function collectGoToValuesFromDocs(docsDir, docFiles) {
  const resolvedDocsDir = docsDir || path.join(process.cwd(), 'docs');
  const files = Array.isArray(docFiles) && docFiles.length ? docFiles : DEFAULT_DOC_FILES;
  const values = new Set();

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = path.join(resolvedDocsDir, file);
    // eslint-disable-next-line no-await-in-loop
    let content;
    try {
      // eslint-disable-next-line no-await-in-loop
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      process.stdout.write(`[WARN] Docs file not found/readable: ${filePath}\n`);
      // eslint-disable-next-line no-continue
      continue;
    }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const found = extractGoToValue(lines, i);
      if (!found) continue;
      const normalized = normalizeNavValue(found.value);
      if (normalized) values.add(normalized);
    }
  }

  return [...values];
}

function buildNavTasksFromGoToValues(values) {
  return values
    .map((value) => {
      const slug = slugify(value);
      if (!slug) return null;
      const name = `nav-${slug}`;

      if (/^https?:\/\//i.test(value)) {
        return { name, type: 'url', value };
      }

      if (value.startsWith('Cloud & SaaS findings')) {
        return {
          name,
          type: 'sidebar',
          value,
          labels: [
            withAlias('Integrations'),
            withAlias('Cloud & SaaS'),
            withAlias('Findings'),
            withAlias('Posture Findings'),
          ],
        };
      }

      if (value.includes(' > ')) {
        const labels = value
          .split(' > ')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => withAlias(s));
        return { name, type: 'sidebar', value, labels };
      }

      return { name, type: 'sidebar', value, labels: [withAlias(value)] };
    })
    .filter(Boolean);
}

function parseArgs(argv) {
  const args = {
    headed: false,
    timeoutMs: 15000,
    fromDocs: false,
    settleMs: 2500,
    zeroTrustHome: process.env.ZERO_TRUST_HOME || DEFAULT_ZERO_TRUST_HOME,
    force: false,
    only: null,
    docsDir: path.join(process.cwd(), 'docs'),
    docFiles: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--headed') {
      args.headed = true;
    }

    if (token === '--timeout-ms') {
      const raw = argv[i + 1];
      if (raw) {
        args.timeoutMs = Number(raw);
        i += 1;
      }
    }

    if (token === '--settle-ms') {
      const raw = argv[i + 1];
      if (raw) {
        args.settleMs = Number(raw);
        i += 1;
      }
    }

    if (token === '--from-docs') {
      args.fromDocs = true;
    }

    if (token === '--docs-dir') {
      const raw = argv[i + 1];
      if (raw) {
        args.docsDir = raw;
        i += 1;
      }
    }

    if (token === '--doc-files') {
      const raw = argv[i + 1];
      if (raw) {
        args.docFiles = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        i += 1;
      }
    }

    if (token === '--zero-trust-home') {
      const raw = argv[i + 1];
      if (raw) {
        args.zeroTrustHome = raw;
        i += 1;
      }
    }

    if (token === '--force') {
      args.force = true;
    }

    if (token === '--only') {
      const raw = argv[i + 1];
      if (raw) {
        args.only = raw;
        i += 1;
      }
    }

    if (token === '--skip-assert') {
      args.skipAssert = true;
    }
  }

  return args;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function clickByBestEffort(page, label, timeoutMs) {
  // Updated selectors for current Cloudflare Zero Trust dashboard (Dec 2024)
  // The sidebar uses a different structure - try multiple approaches
  const sidebar = page.locator('[data-testid="sidebar"], nav, [role="navigation"], aside, .sidebar').first();

  const candidates = [
    // Try clicking by exact text match first (most reliable)
    page.locator(`text="${label}"`).first(),
    page.locator(`text=${label}`).first(),
    // Sidebar-specific selectors
    sidebar.getByRole('link', { name: label, exact: false }),
    sidebar.getByRole('button', { name: label, exact: false }),
    sidebar.getByRole('tab', { name: label, exact: false }),
    sidebar.getByText(label, { exact: false }),
    sidebar.locator(`a:has-text("${label}")`).first(),
    sidebar.locator(`button:has-text("${label}")`).first(),
    // Page-wide selectors as fallback
    page.getByRole('link', { name: label, exact: false }),
    page.getByRole('button', { name: label, exact: false }),
    page.getByRole('menuitem', { name: label, exact: false }),
    page.getByText(label, { exact: false }),
    // Try data-testid patterns
    page.locator(`[data-testid*="${label.toLowerCase().replace(/\s+/g, '-')}"]`).first(),
    // Try aria-label
    page.locator(`[aria-label*="${label}"]`).first(),
  ];

  if (/notifications?/i.test(label)) {
    candidates.push(page.locator('a[href*="notifications"], a[href*="notification"]').first());
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const locator of candidates) {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: Math.min(timeoutMs, 3000) });
      await locator.first().scrollIntoViewIfNeeded();
      await locator.first().click({ timeout: Math.min(timeoutMs, 3000) });
      await page.waitForTimeout(500);
      try {
        await page.waitForLoadState('domcontentloaded', { timeout: Math.min(timeoutMs, 3000) });
      } catch {
        // Some dashboard views never reach domcontentloaded; ignore.
      }
      return;
    } catch {
      // try next locator
    }
  }

  throw new Error(`Could not find/click UI element: ${label}`);
}

async function tryQuickSearchAndClick(page, query, timeoutMs) {
  const sidebar = page.locator('nav, [role="navigation"], aside').first();

  const openers = [
    sidebar.getByText('Quick search', { exact: false }),
    page.getByText('Quick search', { exact: false }),
    page.getByRole('button', { name: 'Quick search', exact: false }),
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const opener of openers) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await opener.first().waitFor({ state: 'visible', timeout: 1500 });
      // eslint-disable-next-line no-await-in-loop
      await opener.first().click({ timeout: timeoutMs });
      break;
    } catch {
      // try next
    }
  }

  // Some dashboard versions rely on a command palette / global search.
  try {
    await page.keyboard.press('Meta+K');
  } catch {
    // ignore
  }
  try {
    await page.keyboard.press('Control+K');
  } catch {
    // ignore
  }
  try {
    await page.keyboard.press('/');
  } catch {
    // ignore
  }

  const inputs = [
    page.getByPlaceholder('Quick search', { exact: false }),
    page.getByPlaceholder('Search', { exact: false }),
    page.locator('input[type="search"]').first(),
    page.getByRole('textbox').first(),
  ];

  let filled = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const input of inputs) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await input.first().waitFor({ state: 'visible', timeout: 1500 });
      // eslint-disable-next-line no-await-in-loop
      await input.first().fill(query, { timeout: timeoutMs });
      filled = true;
      break;
    } catch {
      // try next
    }
  }

  if (!filled) return false;

  await page.waitForTimeout(500);

  const resultCandidates = [
    page.getByRole('link', { name: query, exact: false }),
    page.getByRole('button', { name: query, exact: false }),
    page.getByText(query, { exact: false }),
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const r of resultCandidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await r.first().waitFor({ state: 'visible', timeout: 2000 });
      // eslint-disable-next-line no-await-in-loop
      await r.first().click({ timeout: timeoutMs });
      await page.waitForTimeout(750);
      return true;
    } catch {
      // try next
    }
  }

  return false;
}

async function tryDirectNotificationsUrls(page, timeoutMs, zeroTrustHome) {
  const base = zeroTrustHome || process.env.ZERO_TRUST_HOME || DEFAULT_ZERO_TRUST_HOME;
  let url;
  try {
    const u = new URL(base);
    url = `${u.origin}${u.pathname.replace(/\/home\/?$/, '')}`;
  } catch {
    return false;
  }

  const candidates = [
    `${url}/settings/notifications`,
    `${url}/settings/notification`,
    `${url}/settings/alerts`,
    `${url}/settings/alerting`,
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const c of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await page.goto(c, { waitUntil: 'domcontentloaded' });
      try {
        // eslint-disable-next-line no-await-in-loop
        await page.waitForLoadState('networkidle', { timeout: timeoutMs });
      } catch {
        // ignore
      }

      const urlNow = page.url();
      if (urlNow && urlNow.includes('one.dash.cloudflare.com')) {
        return true;
      }
    } catch {
      // try next
    }
  }

  return false;
}

async function clickAnyLabel(page, labels, timeoutMs) {
  // eslint-disable-next-line no-restricted-syntax
  for (const label of labels) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await clickByBestEffort(page, label, timeoutMs);
      return;
    } catch {
      // try next label
    }
  }

  throw new Error(`Could not find/click any label in: ${labels.join(', ')}`);
}

async function ensureZeroTrustHome(page, timeoutMs, zeroTrustHome) {
  const expectedHome = zeroTrustHome || process.env.ZERO_TRUST_HOME || DEFAULT_ZERO_TRUST_HOME;
  const expectedOrigin = new URL(expectedHome).origin;
  const current = page.url();
  if (current && current.startsWith(expectedOrigin)) {
    return;
  }

  await page.goto(expectedHome, {
    waitUntil: 'domcontentloaded',
  });
  try {
    await page.waitForLoadState('networkidle', { timeout: timeoutMs });
  } catch {
    // ignore
  }
}

async function maybeSelectOrganization(page, timeoutMs) {
  const orgPickerSignals = [
    page.getByText('Select an account', { exact: false }),
    page.getByText('Choose an account', { exact: false }),
    page.getByText('Select your account', { exact: false }),
    page.getByText('Select your organization', { exact: false }),
  ];

  const sidebarSignals = [
    page.locator('nav, [role="navigation"], aside').first(),
    page.getByText('Traffic policies', { exact: false }),
    page.getByText('Gateway', { exact: false }),
  ];

  // If sidebar already exists, we’re good.
  // eslint-disable-next-line no-restricted-syntax
  for (const s of sidebarSignals) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await s.first().waitFor({ state: 'visible', timeout: 2000 });
      return;
    } catch {
      // keep checking
    }
  }

  // If we are on an account/org picker, try selecting the first visible option.
  // eslint-disable-next-line no-restricted-syntax
  for (const s of orgPickerSignals) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await s.first().waitFor({ state: 'visible', timeout: 2000 });

      const firstChoice = page.getByRole('link').first();
      try {
        // eslint-disable-next-line no-await-in-loop
        await firstChoice.waitFor({ state: 'visible', timeout: timeoutMs });
        // eslint-disable-next-line no-await-in-loop
        await firstChoice.click({ timeout: timeoutMs });
        // eslint-disable-next-line no-await-in-loop
        await page.waitForTimeout(1000);
      } catch {
        // ignore
      }
      return;
    } catch {
      // keep checking
    }
  }
}

async function getVisibleHeadingText(page, timeoutMs) {
  const candidates = [
    page.getByRole('heading', { level: 1 }),
    page.locator('h1'),
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const c of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await c.first().waitFor({ state: 'visible', timeout: Math.min(timeoutMs, 2500) });
      // eslint-disable-next-line no-await-in-loop
      const text = await c.first().innerText();
      const normalized = String(text || '').replace(/\s+/g, ' ').trim();
      if (normalized) return normalized;
    } catch {
      // try next
    }
  }

  return '';
}

async function getActiveNavLabel(page, timeoutMs) {
  const sidebar = page.locator('nav, [role="navigation"], aside').first();
  try {
    await sidebar.waitFor({ state: 'visible', timeout: Math.min(timeoutMs, 2500) });
  } catch {
    return '';
  }

  const candidates = [
    sidebar.locator('[aria-current="page"]'),
    sidebar.locator('[aria-current="true"]'),
    sidebar.locator('[data-active="true"]'),
    sidebar.locator('a.active, button.active'),
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const c of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const count = await c.count();
      if (!count) continue;
      // eslint-disable-next-line no-await-in-loop
      const text = await c.first().innerText();
      const normalized = String(text || '').replace(/\s+/g, ' ').trim();
      if (normalized) return normalized;
    } catch {
      // try next
    }
  }

  return '';
}

function normalizeCompareText(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeExpected(current, expectedOptions) {
  const currentNorm = normalizeCompareText(current);
  if (!currentNorm) return false;
  return expectedOptions.some((opt) => {
    const exp = normalizeCompareText(opt);
    return exp && (currentNorm.includes(exp) || exp.includes(currentNorm));
  });
}

async function assertNavigationArrived(page, task, timeoutMs) {
  if (task.type === 'url') {
    const expected = task.value;
    const currentUrl = page.url();
    if (!currentUrl) {
      throw new Error(`Navigation assertion failed for ${task.name}: missing current URL`);
    }

    if (currentUrl.startsWith(expected)) return;

    let expectedOrigin;
    let expectedToPath = '';
    try {
      const expectedUrl = new URL(expected);
      expectedOrigin = expectedUrl.origin;
      expectedToPath = expectedUrl.searchParams.get('to') || '';
    } catch {
      expectedOrigin = null;
    }

    // Many Cloudflare dashboard URLs use a client-side router via `?to=...`.
    // After `goto()`, the browser may briefly sit on the origin before routing.
    if (expectedOrigin && currentUrl.startsWith(expectedOrigin) && expectedToPath) {
      const wanted = normalizeCompareText(expectedToPath);
      try {
        await page.waitForURL(
          (u) => normalizeCompareText(String(u)).includes(wanted),
          { timeout: Math.min(timeoutMs, 8000) }
        );
        return;
      } catch {
        // fall through
      }

      // Fallback: accept if we at least landed on the right origin and the destination looks plausible.
      const urlNow = page.url();
      const membersHint = /\/members\b/i.test(expectedToPath) && /members\b/i.test(urlNow);
      if (membersHint) return;
    }

    throw new Error(
      `Navigation assertion failed for ${task.name}: expected ${expected}, got ${currentUrl}`
    );
  }

  if (task.type !== 'sidebar' || !Array.isArray(task.labels) || task.labels.length === 0) return;

  const lastStep = task.labels[task.labels.length - 1];
  const expectedOptions = Array.isArray(lastStep)
    ? lastStep.map((v) => String(v))
    : [String(lastStep)];

  const activeNav = await getActiveNavLabel(page, timeoutMs);
  if (looksLikeExpected(activeNav, expectedOptions)) return;

  const heading = await getVisibleHeadingText(page, timeoutMs);
  if (looksLikeExpected(heading, expectedOptions)) return;

  const urlNow = page.url();
  const urlOk = expectedOptions.some((opt) => {
    const slug = slugify(opt);
    return slug && urlNow && normalizeCompareText(urlNow).includes(slug.replace(/-/g, ''));
  });
  if (urlOk) return;

  throw new Error(
    `Navigation assertion failed for ${task.name}: expected one of [${expectedOptions.join(
      ' | '
    )}], got heading="${heading}" activeNav="${activeNav}" url="${urlNow}"`
  );
}

async function assertNavigationArrivedWithRetry(page, task, timeoutMs) {
  try {
    await assertNavigationArrived(page, task, timeoutMs);
    return;
  } catch (err) {
    if (task.type !== 'sidebar' || !Array.isArray(task.labels) || task.labels.length === 0) {
      throw err;
    }

    const lastStep = task.labels[task.labels.length - 1];
    const query = labelOptionsToText(lastStep);
    if (!query) throw err;

    const ok = await tryQuickSearchAndClick(page, query, timeoutMs);
    if (!ok) throw err;

    await assertNavigationArrived(page, task, timeoutMs);
  }
}

async function navigateViaSidebar(page, labels, timeoutMs, zeroTrustHome) {
  // eslint-disable-next-line no-restricted-syntax
  for (const label of labels) {
    // Each step can be either a single label string or an array of label synonyms.
    const options = Array.isArray(label) ? label : [label];
    try {
      // eslint-disable-next-line no-await-in-loop
      await clickAnyLabel(page, options, timeoutMs);
    } catch (err) {
      const joined = options.map((s) => String(s)).join(' | ');
      if (/notifications?|alerts?|alerting/i.test(joined)) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await tryQuickSearchAndClick(page, 'Notifications', timeoutMs);
        if (ok) continue;

        // eslint-disable-next-line no-await-in-loop
        const okUrl = await tryDirectNotificationsUrls(page, timeoutMs, zeroTrustHome);
        if (okUrl) continue;
      }

      // Generic fallback: if the sidebar item is nested/hidden, try dashboard quick search.
      // eslint-disable-next-line no-await-in-loop
      const fallbackQuery = labelOptionsToText(options);
      if (fallbackQuery) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await tryQuickSearchAndClick(page, fallbackQuery, timeoutMs);
        if (ok) continue;
      }
      throw err;
    }
  }
}

async function captureScreenshot(page, name, settleMs) {
  if (settleMs && Number.isFinite(settleMs)) {
    await page.waitForTimeout(settleMs);
  }
  const fileName = `${name}.png`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  await page.screenshot({ path: outputPath, fullPage: true });
  return { fileName, outputPath };
}

async function captureFailureScreenshot(page, name, settleMs) {
  try {
    if (settleMs && Number.isFinite(settleMs)) {
      await page.waitForTimeout(settleMs);
    }
  } catch {
    // ignore (page/browser may already be closed)
  }
  const fileName = `_failed-${name}.png`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  try {
    await page.screenshot({ path: outputPath, fullPage: true });
    return { fileName, outputPath };
  } catch {
    return null;
  }
}

async function dumpSidebarCandidates(page) {
  const sidebar = page.locator('nav, [role="navigation"], aside').first();
  try {
    await sidebar.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    process.stdout.write('[Info] Sidebar container not detected yet.\n');
    return;
  }

  const items = await sidebar
    .locator('a, button, [role="link"], [role="button"]')
    .evaluateAll((els) =>
      els
        .map((el) => {
          const ariaLabel = el.getAttribute('aria-label');
          const title = el.getAttribute('title');
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
          return ariaLabel || title || text;
        })
        .filter((v) => Boolean(v))
    );

  const unique = [...new Set(items)].slice(0, 200);
  process.stdout.write(`\n[Info] Sidebar items detected (${unique.length}):\n`);
  unique.forEach((v) => {
    process.stdout.write(`- ${v}\n`);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!(await fileExists(STORAGE_STATE_PATH))) {
    throw new Error(
      `Missing auth session at ${STORAGE_STATE_PATH}. Run: npm run screenshots:auth`
    );
  }

  await ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(args.timeoutMs);
  page.setDefaultNavigationTimeout(args.timeoutMs);

  process.stdout.write('\nOpening Cloudflare Zero Trust dashboard...\n');
  await page.goto(args.zeroTrustHome, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForLoadState('networkidle', { timeout: args.timeoutMs });
  } catch {
    // ignore
  }
  await maybeSelectOrganization(page, args.timeoutMs);
  await dumpSidebarCandidates(page);

  let tasks;

  if (args.fromDocs) {
    process.stdout.write('\nCollecting **Go to:** navigation paths from docs/...\n');
    const goToValues = await collectGoToValuesFromDocs(args.docsDir, args.docFiles);
    process.stdout.write(`Found ${goToValues.length} unique navigation paths.\n`);
    tasks = buildNavTasksFromGoToValues(goToValues);
  } else {
    tasks = [
      {
        name: 'dashboard-home',
        type: 'noop',
      },
      {
        name: 'insights-logs',
        type: 'sidebar',
        labels: [['Insights', 'Analytics'], ['Logs', 'Log Explorer']],
      },
      {
        name: 'traffic-settings-certificates',
        type: 'sidebar',
        labels: [
          ['Traffic policies', 'Gateway'],
          ['Traffic settings', 'Settings'],
          ['Certificates', 'Certificate'],
        ],
      },
    ];
  }

  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const task of tasks) {
    if (args.only && !task.name.includes(args.only) && task.value !== args.only) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const startedAt = Date.now();
    process.stdout.write(
      `\n[Start] ${task.name}${task.value ? ` -> ${task.value}` : ''}${
        task.labels ? `\n       ${task.labels.join(' > ')}` : ''
      }\n`
    );
    try {
      const expectedPath = path.join(OUTPUT_DIR, `${task.name}.png`);
      if (!args.force && (await fileExists(expectedPath))) {
        process.stdout.write(`[SKIP] ${task.name} already exists\n`);
        results.push({ name: task.name, ok: true, ms: 0, fileName: `${task.name}.png`, outputPath: expectedPath, skipped: true });
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await maybeSelectOrganization(page, args.timeoutMs);
      // eslint-disable-next-line no-await-in-loop
      if (task.type === 'url') {
        // eslint-disable-next-line no-await-in-loop
        await page.goto(task.value, { waitUntil: 'domcontentloaded' });
        try {
          // eslint-disable-next-line no-await-in-loop
          await page.waitForLoadState('networkidle', { timeout: args.timeoutMs });
        } catch {
          // ignore
        }
      } else if (task.type === 'sidebar') {
        // eslint-disable-next-line no-await-in-loop
        await ensureZeroTrustHome(page, args.timeoutMs, args.zeroTrustHome);
        // eslint-disable-next-line no-await-in-loop
        await maybeSelectOrganization(page, args.timeoutMs);
        // eslint-disable-next-line no-await-in-loop
        await navigateViaSidebar(page, task.labels, args.timeoutMs, args.zeroTrustHome);
      }

      // eslint-disable-next-line no-await-in-loop
      if (!args.skipAssert) {
        await assertNavigationArrivedWithRetry(page, task, args.timeoutMs);
      }
      // eslint-disable-next-line no-await-in-loop
      const screenshot = await captureScreenshot(page, task.name, args.settleMs);
      process.stdout.write(`[OK] ${task.name} saved: ${screenshot.fileName}\n`);
      results.push({
        name: task.name,
        ok: true,
        ms: Date.now() - startedAt,
        ...screenshot,
      });
      // eslint-disable-next-line no-await-in-loop

      if (task.type === 'url') {
        // eslint-disable-next-line no-await-in-loop
        await ensureZeroTrustHome(page, args.timeoutMs, args.zeroTrustHome);
      }
      await page.waitForTimeout(300);
    } catch (err) {
      process.stdout.write(`[FAIL] ${task.name}: ${String(err && (err.message || err))}\n`);
      // eslint-disable-next-line no-await-in-loop
      const failureShot = await captureFailureScreenshot(page, task.name, args.settleMs);
      results.push({
        name: task.name,
        ok: false,
        ms: Date.now() - startedAt,
        failureScreenshot: failureShot ? failureShot.fileName : null,
        error: String(err && (err.stack || err.message || err)),
      });
    }
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, '_manifest.json'),
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      results,
    }, null, 2)}\n`,
    'utf8'
  );

  await context.close();
  await browser.close();

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;

  process.stdout.write(`\nScreenshots saved to: ${OUTPUT_DIR}\n`);
  process.stdout.write(`Success: ${okCount} | Failed: ${failCount}\n`);

  if (failCount > 0) {
    process.stdout.write('\nFailed tasks (re-run with --headed to debug):\n');
    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        process.stdout.write(`- ${r.name}: ${r.error}\n`);
      });
  }
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exitCode = 1;
});
