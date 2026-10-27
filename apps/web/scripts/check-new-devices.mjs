#!/usr/bin/env node
// Scans Apple and Samsung newsroom feeds for phone model names that are not yet in
// src/lib/device-catalog.ts and prints them as JSON. A GitHub Actions workflow turns
// each candidate into an issue so the store owner can decide whether to list it.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const FEEDS = [
  'https://www.apple.com/newsroom/rss-feed.rss',
  'https://news.samsung.com/global/feed',
  'https://news.samsung.com/kr/feed',
];

const CATALOG_PATH = fileURLToPath(new URL('../src/lib/device-catalog.ts', import.meta.url));

const KOREAN_TERMS = [
  ['갤럭시', 'Galaxy'],
  ['트라이폴드', 'TriFold'],
  ['폴드', 'Fold'],
  ['플립', 'Flip'],
  ['울트라', 'Ultra'],
  ['엣지', 'Edge'],
  ['퀀텀', 'Quantum'],
  ['점프', 'Jump'],
  ['버디', 'Buddy'],
  ['아이폰', 'iPhone'],
  ['프로 맥스', 'Pro Max'],
  ['프로', 'Pro'],
  ['플러스', 'Plus'],
  ['에어', 'Air'],
  ['듀오', 'Duo'],
];

const IPHONE_PATTERN = /\biPhone\s+(?:\d{2}e?(?:\s+(?:Pro\s+Max|Pro|Plus))?|Air|Duo|Fold)\b/g;
const GALAXY_PATTERN =
  /\bGalaxy\s+(?:S\d{2}(?:\s*(?:Ultra|FE|Edge)|\+)?|Z\s+(?:Fold|Flip)\s*\d+(?:\s+(?:Ultra|FE))?|Z\s+TriFold|A\d{2}|Quantum\s*\d+|Jump\s*\d+|Buddy\s*\d+)/g;

export function translateKorean(text) {
  return KOREAN_TERMS.reduce((acc, [ko, en]) => acc.replaceAll(ko, en), text);
}

export function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '');
}

function tidyName(name) {
  return name
    .replace(/\s+/g, ' ')
    .replace(/(Fold|Flip|Quantum|Jump|Buddy)\s+(\d)/g, '$1$2')
    .replace(/\s+\+/g, '+')
    .trim();
}

export function extractModelNames(text) {
  const translated = translateKorean(text);
  const found = [...translated.matchAll(IPHONE_PATTERN), ...translated.matchAll(GALAXY_PATTERN)];
  return [...new Set(found.map((match) => tidyName(match[0])))];
}

export function parseFeedEntries(xml) {
  const blocks = xml.match(/<(entry|item)\b[\s\S]*?<\/\1>/g) ?? [];
  return blocks.map((block) => {
    const title = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/.exec(block)?.[1]?.trim() ?? '';
    const link =
      /<link[^>]*href="([^"]+)"(?![^>]*rel="enclosure")/.exec(block)?.[1] ??
      /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/.exec(block)?.[1]?.trim() ??
      '';
    return { title, link };
  });
}

export function readCatalogNames(source) {
  return [...source.matchAll(/name:\s*'([^']+)'/g)].map((match) => match[1]);
}

export function findCandidates(entries, catalogNames) {
  const known = new Set(catalogNames.map(normalizeName));
  const candidates = new Map();

  for (const entry of entries) {
    for (const name of extractModelNames(entry.title)) {
      const key = normalizeName(name);
      if (known.has(key) || candidates.has(key)) {
        continue;
      }
      candidates.set(key, { name, title: entry.title, link: entry.link });
    }
  }

  return [...candidates.values()];
}

async function main() {
  const catalogNames = readCatalogNames(await readFile(CATALOG_PATH, 'utf8'));
  const entries = [];

  for (const url of FEEDS) {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (device-catalog-check)' } });
    if (!response.ok) {
      console.error(`Skipping ${url}: HTTP ${response.status}`);
      continue;
    }
    entries.push(...parseFeedEntries(await response.text()));
  }

  console.log(JSON.stringify(findCandidates(entries, catalogNames), null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
