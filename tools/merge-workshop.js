const fs = require('node:fs/promises');
const path = require('node:path');

const INJECT_INDIVIDUAL = process.argv.includes('--inject-individual');

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

function extractGoToValue(lines, index) {
  const line = lines[index];
  const inlineMatch = line.match(/^\*\*Go to:\*\*\s*(.+?)\s*$/);
  if (inlineMatch && inlineMatch[1]) {
    return { value: inlineMatch[1].trim(), insertAfterLine: index };
  }

  if (line.trim() !== '**Go to:**') {
    return null;
  }

  const next = lines[index + 1] || '';
  if (next.trim().startsWith('```')) {
    const urlLine = (lines[index + 2] || '').trim();
    const endFenceIndex = lines.findIndex((l, i) => i > index + 1 && l.trim().startsWith('```'));
    if (urlLine) {
      return {
        value: urlLine,
        insertAfterLine: endFenceIndex > -1 ? endFenceIndex : index + 1,
      };
    }
  }

  const nextNonEmpty = (lines[index + 1] || '').trim();
  if (nextNonEmpty) {
    return { value: nextNonEmpty, insertAfterLine: index + 1 };
  }

  return null;
}

function injectScreenshots(markdown) {
  const lines = markdown.split('\n');
  const inserts = [];

  for (let i = 0; i < lines.length; i += 1) {
    const value = extractGoToValue(lines, i);
    if (!value) continue;

    const slug = slugify(normalizeNavValue(value.value));
    if (!slug) continue;

    inserts.push({
      after: value.insertAfterLine,
      text: `\n![${value.value}](./screenshots/auto/nav-${slug}.png)\n`,
    });
  }

  if (inserts.length === 0) return markdown;

  const byAfter = new Map();
  inserts.forEach((ins) => {
    const current = byAfter.get(ins.after) || [];
    current.push(ins.text);
    byAfter.set(ins.after, current);
  });

  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    out.push(lines[i]);
    const add = byAfter.get(i);
    if (add) {
      add.forEach((t) => out.push(t.trimEnd()));
    }
  }

  return out.join('\n').replace(/\n{4,}/g, '\n\n\n');
}

async function main() {
  const docsDir = path.join(process.cwd(), 'docs');
  const order = [
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

  if (INJECT_INDIVIDUAL) {
    process.stdout.write('Injecting screenshots into individual module files...\n');
    for (const file of order) {
      const filePath = path.join(docsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const withShots = injectScreenshots(content);
      if (withShots !== content) {
        await fs.writeFile(filePath, withShots, 'utf8');
        process.stdout.write(`  Updated: ${file}\n`);
      } else {
        process.stdout.write(`  Skipped (no changes): ${file}\n`);
      }
    }
  }

  const parts = [];
  for (const file of order) {
    const filePath = path.join(docsDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    parts.push(`\n\n---\n\n${content.trim()}\n`);
  }

  const merged = `# Cloudflare Zero Trust Workshop (Modules 00-11)\n\nThis file is auto-generated from individual modules.\n\n${parts.join('')}`;
  const withShots = injectScreenshots(merged);

  const outPath = path.join(docsDir, '00-11-workshop-full.md');
  await fs.writeFile(outPath, `${withShots}\n`, 'utf8');
  process.stdout.write(`Generated: ${outPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exitCode = 1;
});
