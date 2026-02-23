import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /student-auth
Disallow: /student-dashboard
Disallow: /reset-password
Disallow: /forgot-password
Disallow: /verify-email
Disallow: /auth/callback

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Yandex
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

Host: https://vibecoding.by
Sitemap: https://vibecoding.by/sitemap.xml
`;

Deno.serve(async (req: Request) => {
  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
});
