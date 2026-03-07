/**
 * Prerender blog posts — generates static HTML for SEO
 * Runs after `vite build`, creates /blog/{slug}/index.html files
 * Nginx serves them directly to bots and users (faster than SPA)
 */

const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.vibecoding.by/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '69aa2114000211b48e63';
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'vibecoding';

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

async function fetchPosts() {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/blog_posts/documents?queries[]=${encodeURIComponent('equal("is_published", [true])')}&queries[]=${encodeURIComponent('limit(50)')}`;
  const res = await fetch(url, {
    headers: { 'X-Appwrite-Project': PROJECT_ID }
  });
  const data = await res.json();
  return data.documents || [];
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function generateHtml(post) {
  const title = post.meta_title || `${post.title} — Блог Vibecoding`;
  const description = post.meta_description || post.excerpt || stripHtml(post.content).substring(0, 160);
  const keywords = post.meta_keywords || '';
  const image = post.image_url || 'https://vibecoding.by/og-image.jpg';
  const url = `https://vibecoding.by/blog/${post.slug}`;
  const contentPreview = stripHtml(post.content).substring(0, 500);

  // Inject SEO meta tags and content preview into index.html
  let html = INDEX_HTML;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Add meta tags before </head>
  const metaTags = `
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${url}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title.replace(/"/g, '\\"')}",
      "description": "${description.replace(/"/g, '\\"')}",
      "image": "${image}",
      "url": "${url}",
      "publisher": {
        "@type": "Organization",
        "name": "Vibecoding",
        "url": "https://vibecoding.by"
      }
    }
    </script>
  `;
  html = html.replace('</head>', `${metaTags}\n</head>`);

  // Add hidden content for SEO (visible to bots, replaced by React on hydration)
  const seoContent = `
    <noscript>
      <article>
        <h1>${post.title}</h1>
        <p>${description}</p>
        <div>${contentPreview}...</div>
      </article>
    </noscript>
  `;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${seoContent}`);

  return html;
}

async function main() {
  console.log('🔍 Fetching blog posts from Appwrite...');
  const posts = await fetchPosts();
  console.log(`📝 Found ${posts.length} published posts`);

  let count = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    
    const dir = path.join(DIST_DIR, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    
    const html = generateHtml(post);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    count++;
    console.log(`  ✅ /blog/${post.slug}`);
  }

  // Also generate for /blog listing
  const blogDir = path.join(DIST_DIR, 'blog');
  if (!fs.existsSync(path.join(blogDir, 'index.html'))) {
    fs.mkdirSync(blogDir, { recursive: true });
    let blogHtml = INDEX_HTML;
    blogHtml = blogHtml.replace(/<title>[^<]*<\/title>/, '<title>Блог о вайбкодинге — Vibecoding</title>');
    blogHtml = blogHtml.replace('</head>', '<meta name="description" content="Блог о вайб-кодинге: Cursor AI, Bolt.new, AI-разработка, уроки и гайды" />\n</head>');
    fs.writeFileSync(path.join(blogDir, 'index.html'), blogHtml);
    console.log(`  ✅ /blog`);
  }

  // Generate for main pages
  const pages = [
    { path: 'courses', title: 'Курсы вайбкодинга — Vibecoding', desc: 'Онлайн курсы по вайб-кодингу с Cursor AI и Bolt.new' },
    { path: 'faq', title: 'Часто задаваемые вопросы — Vibecoding', desc: 'Ответы на частые вопросы о курсах вайбкодинга' },
  ];
  for (const page of pages) {
    const pageDir = path.join(DIST_DIR, page.path);
    if (!fs.existsSync(path.join(pageDir, 'index.html'))) {
      fs.mkdirSync(pageDir, { recursive: true });
      let pageHtml = INDEX_HTML;
      pageHtml = pageHtml.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
      pageHtml = pageHtml.replace('</head>', `<meta name="description" content="${page.desc}" />\n</head>`);
      fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      console.log(`  ✅ /${page.path}`);
    }
  }

  console.log(`\n🎉 Prerendered ${count} blog posts + main pages`);
}

main().catch(e => { console.error('Prerender failed:', e.message); process.exit(0); }); // exit 0 to not fail build
