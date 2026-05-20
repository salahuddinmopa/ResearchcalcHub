import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const siteUrl = 'https://researchcalc-hub.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const staticPaths = [
  '/',
  '/calculators',
  '/research-toolkit',
  '/future-tools',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/suggest-calculator',
  '/report-error',
];

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

function extractMatches(content, pattern) {
  return Array.from(content.matchAll(pattern), match => match[1]);
}

const calculatorData = read('src/data/calculators.ts');
const calculatorPaths = extractMatches(calculatorData, /path:\s*['`]([^'`]+)['`]/g)
  .filter(path => path.startsWith('/calculators/') && !path.includes('${'));

const categoryIds = extractMatches(calculatorData, /id:\s*'([^']+)'/g)
  .filter(id => !id.includes('calculator') && !id.includes('sample') && !id.includes('margin'))
  .filter((id, index, ids) => ids.indexOf(id) === index)
  .filter(id => [
    'research-methodology',
    'reliability-validity',
    'statistics',
    'social-science-decision',
    'math',
    'physics',
    'chemistry',
    'biology',
    'finance',
    'cybersecurity',
    'education',
    'everyday',
  ].includes(id))
  .map(id => `/categories/${id}`);

const generatedCalculatorPaths = [
  'src/utils/stemCalculators.ts',
  'src/utils/practicalCalculators.ts',
  'src/utils/cybersecurity.ts',
].flatMap(file => extractMatches(read(file), /id:\s*'([^']+)'/g).map(id => `/calculators/${id}`));

const paths = Array.from(new Set([
  ...staticPaths,
  ...categoryIds,
  ...calculatorPaths,
  ...generatedCalculatorPaths,
])).sort((a, b) => a.localeCompare(b));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path.startsWith('/calculators/') ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

mkdirSync(join(rootDir, 'public'), { recursive: true });
writeFileSync(join(rootDir, 'public/sitemap.xml'), sitemap);
writeFileSync(join(rootDir, 'public/robots.txt'), robots);

console.log(`Generated ${paths.length} sitemap URLs.`);
