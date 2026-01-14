#!/usr/bin/env bun
import { type FileRouteTypes } from '@/routeTree.gen';
import plugin from 'bun-plugin-tailwind';
import { prettify } from 'htmlfy';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import path from 'path';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🏗️  Bun Build Script

Usage: bun run build.ts [options]

Common Options:
  --outdir <path>          Output directory (default: "dist")
  --minify                 Enable minification (or --minify.whitespace, --minify.syntax, etc)
  --sourcemap <type>      Sourcemap type: none|linked|inline|external
  --target <target>        Build target: browser|bun|node
  --format <format>        Output format: esm|cjs|iife
  --splitting              Enable code splitting
  --packages <type>        Package handling: bundle|external
  --public-path <path>     Public path for assets
  --env <mode>             Environment handling: inline|disable|prefix*
  --conditions <list>      Package.json export conditions (comma separated)
  --external <list>        External packages (comma separated)
  --banner <text>          Add banner text to output
  --footer <text>          Add footer text to output
  --define <obj>           Define global constants (e.g. --define.VERSION=1.0.0)
  --help, -h               Show this help message

Example:
  bun run build.ts --outdir=dist --minify --sourcemap=linked --external=react,react-dom
`);
  process.exit(0);
}

const toCamelCase = (str: string): string => str.replace(/-([a-z])/g, g => (g[1] ?? '').toUpperCase());

const parseValue = (value: string): any => {
  if (value === 'true') return true;
  if (value === 'false') return false;

  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

  if (value.includes(',')) return value.split(',').map(v => v.trim());

  return value;
};

function parseArgs(): Partial<Bun.BuildConfig> {
  const config: Record<string, any> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (!arg.startsWith('--')) continue;

    if (arg.startsWith('--no-')) {
      const key = toCamelCase(arg.slice(5));
      config[key] = false;
      continue;
    }

    if (!arg.includes('=') && (i === args.length - 1 || args[i + 1]?.startsWith('--'))) {
      const key = toCamelCase(arg.slice(2));
      config[key] = true;
      continue;
    }

    let key: string;
    let value: string;

    if (arg.includes('=')) {
      [key, value] = arg.slice(2).split('=', 2) as [string, string];
    } else {
      key = arg.slice(2);
      value = args[++i] ?? '';
    }

    key = toCamelCase(key);

    if (key.includes('.')) {
      const [parentKey = '', childKey = ''] = key.split('.');
      config[parentKey] = config[parentKey] || {};
      config[parentKey][childKey] = parseValue(value);
    } else {
      config[key] = parseValue(value);
    }
  }

  return config;
}

const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

console.log('\n🚀 Starting build process...\n');

const cliConfig = parseArgs();
const outdir = cliConfig.outdir || path.join(process.cwd(), 'dist');

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

const entrypoints = [...new Bun.Glob('**.html').scanSync('src')]
  .map(a => path.resolve('src', a))
  .filter(dir => !dir.includes('node_modules'));
console.log(`📄 Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? 'file' : 'files'} to process\n`);

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [plugin],
  minify: true,
  target: 'browser',
  sourcemap: 'linked',
  env: 'BUN_PUBLIC_*',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  ...cliConfig,
});

interface PageInfo {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  og?: {
    title?: string;
    description?: string;
    type?: string;
    locale?: string;
    siteName?: string;
    url?: string;
  };
  sitemap?: {
    priority: string;
  };
}

const SITE_URL = 'https://skaiciuoklems.lt';

const routes: Record<FileRouteTypes['fullPaths'] | '/404', PageInfo> = {
  '/': {
    sitemap: {
      priority: '1.0',
    },
  },
  '/404': {
    title: 'Skaičiuoklės | 404 Puslapis nerastas',
    description: 'Puslapis kurio ieškote nerastas.',
  },
  '/mokesciai': {
    title: 'Mokesčių skaičiuoklė 2026 | GPM, Sodra, PSD, VSD | Lietuvos mokesčiai',
    description:
      'Nemokama Lietuvos mokesčių skaičiuoklė 2026 metams. Apskaičiuokite GPM, Sodros įmokas (PSD, VSD), darbo užmokestį „ant popieriaus&quot; ir „į rankas&quot;, individualios veiklos bei mažosios bendrijos mokesčius.',
    keywords:
      'mokesčių skaičiuoklė, GPM skaičiuoklė, Sodra skaičiuoklė, PSD, VSD, darbo užmokestis, atlyginimo skaičiuoklė, neto bruto, individualios veiklos mokesčiai, MB mokesčiai, Lietuvos mokesčiai, VMI, 2026, algos skaičiuoklė, mokesčiai Lietuvoje',
    canonical: `${SITE_URL}/mokesciai`,
    og: {
      title: 'Mokesčių skaičiuoklė 2026 | Lietuvos mokesčių apskaičiavimas',
      description:
        'Apskaičiuokite savo mokesčius Lietuvoje: GPM, Sodros įmokas, atlyginimą neto ir bruto. Tinka darbuotojams, individualios veiklos vykdytojams ir MB.',
      type: 'website',
      locale: 'lt_LT',
      siteName: 'Skaičiuoklės',
      url: `${SITE_URL}/mokesciai`,
    },
    sitemap: {
      priority: '1.0',
    },
  },
};

const html = await Bun.file('dist/index.html').text();
await Promise.all(
  Object.entries(routes).map(async ([route, value]) => {
    const page = route.replace(/^\//, '') || 'index';
    let newHtml = html;
    if (value.title && value.description) {
      console.log(`Copying index.html to ${page}.html`);

      const metaTags: string[] = ['', `<meta name="description" content="${value.description}">`];

      if (value.keywords) {
        metaTags.push(`<meta name="keywords" content="${value.keywords}">`);
      }

      if (value.canonical) {
        metaTags.push(`<link rel="canonical" href="${value.canonical}">`);
      }

      if (value.og) {
        if (value.og.title) metaTags.push(`<meta property="og:title" content="${value.og.title}">`);
        if (value.og.description) metaTags.push(`<meta property="og:description" content="${value.og.description}">`);
        if (value.og.type) metaTags.push(`<meta property="og:type" content="${value.og.type}">`);
        if (value.og.locale) metaTags.push(`<meta property="og:locale" content="${value.og.locale}">`);
        if (value.og.siteName) metaTags.push(`<meta property="og:site_name" content="${value.og.siteName}">`);
        if (value.og.url) metaTags.push(`<meta property="og:url" content="${value.og.url}">`);
      }

      metaTags.push('</head>');

      newHtml = newHtml
        .replace(/<title>.*<\/title>/, `<title>${value.title}</title>`)
        .replace('</head>', metaTags.join('\n'));
    } else {
      console.log(`Skipping ${page}.html`);
    }
    return Bun.write(`dist/${page}.html`, prettify(newHtml));
  }),
);

// Generate sitemap.xml
const sitemapRoutes = Object.entries(routes)
  .map(([route, value]) =>
    value.sitemap
      ? {
          url: `${SITE_URL}${route === '/' ? '' : route}`,
          priority: value.sitemap.priority,
        }
      : null,
  )
  .filter(Boolean);

const today = new Date().toISOString().split('T')[0];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes
  .map(
    route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await Bun.write('dist/sitemap.xml', sitemap);
console.log(`📍 Generated sitemap.xml with ${sitemapRoutes.length} URLs`);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await Bun.write('dist/robots.txt', robotsTxt);
console.log(`🤖 Generated robots.txt\n`);

const end = performance.now();

const outputTable = result.outputs.map(output => ({
  File: path.relative(process.cwd(), output.path),
  Type: output.kind,
  Size: formatFileSize(output.size),
}));

console.table(outputTable);
const buildTime = (end - start).toFixed(2);

console.log(`\n✅ Build completed in ${buildTime}ms\n`);
