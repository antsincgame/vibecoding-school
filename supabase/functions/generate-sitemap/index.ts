import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE_URL = 'https://vibecoding.by';

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface Course {
  slug: string;
  updated_at: string;
}

function formatDate(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = formatDate(new Date().toISOString());

    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    const { data: courses } = await supabase
      .from('courses')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('order_index');

    const staticPages = [
      { loc: '/', lastmod: today, changefreq: 'daily', priority: '1.0' },
      { loc: '/courses', lastmod: today, changefreq: 'weekly', priority: '0.9' },
      { loc: '/trial', lastmod: today, changefreq: 'weekly', priority: '0.9' },
      { loc: '/about', lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: '/blog', lastmod: today, changefreq: 'daily', priority: '0.9' },
      { loc: '/works', lastmod: today, changefreq: 'weekly', priority: '0.7' },
      { loc: '/q-a', lastmod: today, changefreq: 'monthly', priority: '0.6' },
      { loc: '/history', lastmod: today, changefreq: 'monthly', priority: '0.5' },
      { loc: '/privacy', lastmod: today, changefreq: 'yearly', priority: '0.3' },
      { loc: '/offer', lastmod: today, changefreq: 'yearly', priority: '0.3' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    if (courses && courses.length > 0) {
      for (const course of courses as Course[]) {
        if (course.slug) {
          xml += `
  <url>
    <loc>${SITE_URL}/course/${escapeXml(course.slug)}</loc>
    <lastmod>${formatDate(course.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
        }
      }
    }

    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts as BlogPost[]) {
        if (post.slug) {
          xml += `
  <url>
    <loc>${SITE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Failed to generate sitemap</error>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
});
