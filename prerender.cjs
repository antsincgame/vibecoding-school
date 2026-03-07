/**
 * Prerender blog posts — generates static HTML for SEO
 * Uses blog-data.json (generated from Appwrite) to create /blog/{slug}/index.html
 */
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST_DIR)) {
  console.log('dist/ not found, skipping prerender');
  process.exit(0);
}

const INDEX_HTML = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

// Load blog data from local JSON
const BLOG_DATA_PATH = path.join(__dirname, 'blog-data.json');
if (!fs.existsSync(BLOG_DATA_PATH)) {
  console.log('blog-data.json not found, skipping prerender');
  process.exit(0);
}

const posts = JSON.parse(fs.readFileSync(BLOG_DATA_PATH, 'utf-8'));
console.log(`📝 Prerendering ${posts.length} blog posts...`);

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

let count = 0;
for (const post of posts) {
  if (!post.slug) continue;

  const title = post.meta_title || `${post.title} — Блог Vibecoding`;
  const description = post.meta_description || post.excerpt || stripHtml(post.content).substring(0, 160);
  const keywords = post.meta_keywords || '';
  const image = post.image_url || 'https://vibecoding.by/og-image.jpg';
  const url = `https://vibecoding.by/blog/${post.slug}`;
  const contentPreview = stripHtml(post.content).substring(0, 500);

  let html = INDEX_HTML;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${description.replace(/"/g, '&quot;')}"`
  );

  // Replace OG tags
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = html.replace(/<meta property="og:type" content="[^"]*"/, `<meta property="og:type" content="article"`);

  // Add canonical + article structured data before </head>
  const extraHead = `
    <link rel="canonical" href="${url}" />
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"BlogPosting","headline":"${title.replace(/"/g, '\\"')}","description":"${description.replace(/"/g, '\\"')}","image":"${image}","url":"${url}","publisher":{"@type":"Organization","name":"Vibecoding","url":"https://vibecoding.by"}}
    </script>
  `;
  html = html.replace('</head>', `${extraHead}</head>`);

  // Add noscript content for bots
  const noscript = `<noscript><article><h1>${post.title}</h1><p>${description}</p><div>${contentPreview}...</div></article></noscript>`;
  html = html.replace('</body>', `${noscript}</body>`);

  // Write file
  const dir = path.join(DIST_DIR, 'blog', post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  count++;
  console.log(`  ✅ /blog/${post.slug}`);
}

console.log(`\n🎉 Prerendered ${count} blog posts`);
