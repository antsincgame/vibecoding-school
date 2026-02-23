import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { renderMarkdown, getReadingTime } from '../lib/markdown';
import type { BlogPost } from '../types';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', postSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      console.error('Error loading blog post:', error);
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (data) {
      setPost(data);
      updateSEO(data);
      loadRelatedPosts(data.id);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const updateSEO = (postData: BlogPost) => {
    document.title = postData.meta_title || `${postData.title} - Блог Vibecoding`;

    const updateMeta = (name: string, content: string | null, property?: boolean) => {
      if (!content) return;
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', postData.meta_description || postData.excerpt);
    updateMeta('keywords', postData.meta_keywords);
    updateMeta('og:title', postData.meta_title || postData.title, true);
    updateMeta('og:description', postData.meta_description || postData.excerpt, true);
    updateMeta('og:type', 'article', true);
    updateMeta('og:url', window.location.href, true);
    if (postData.image_url) {
      updateMeta('og:image', postData.image_url, true);
    }
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', postData.meta_title || postData.title);
    updateMeta('twitter:description', postData.meta_description || postData.excerpt);
    if (postData.image_url) {
      updateMeta('twitter:image', postData.image_url);
    }
    updateMeta('article:published_time', postData.published_at, true);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) existingSchema.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postData.title,
      description: postData.meta_description || postData.excerpt,
      image: postData.image_url,
      datePublished: postData.published_at,
      author: {
        '@type': 'Organization',
        name: 'Vibecoding'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vibecoding',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/favicon.svg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      }
    };
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
  };

  const loadRelatedPosts = async (currentId: string) => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, image_url, published_at')
      .eq('is_published', true)
      .neq('id', currentId)
      .order('published_at', { ascending: false })
      .limit(3);

    if (data) setRelatedPosts(data);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="loading-spinner" />
        <span>Загрузка статьи...</span>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="blog-post-not-found">
        <div className="not-found-content">
          <h1>404</h1>
          <p>Статья не найдена или была удалена</p>
          <Link to="/blog" className="cyber-button">
            Вернуться в блог
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTime(post.content);

  return (
    <div className="blog-post-page">
      <article className="blog-post-article" itemScope itemType="https://schema.org/BlogPosting">
        <header className="blog-post-header">
          <nav className="blog-breadcrumb">
            <Link to="/">Главная</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/blog">Блог</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{post.title}</span>
          </nav>

          <div className="blog-post-meta">
            <time dateTime={post.published_at || ''} itemProp="datePublished">
              {formatDate(post.published_at)}
            </time>
            <span className="meta-sep">|</span>
            <span className="reading-time">{readingTime} мин. чтения</span>
          </div>

          <h1 className="blog-post-title" itemProp="headline">{post.title}</h1>

          {post.excerpt && (
            <p className="blog-post-excerpt" itemProp="description">{post.excerpt}</p>
          )}
        </header>

        {post.image_url && (
          <figure className="blog-post-hero">
            <img
              src={post.image_url}
              alt={post.title}
              itemProp="image"
              loading="eager"
            />
          </figure>
        )}

        <div
          className="blog-post-content"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <footer className="blog-post-footer">
          <div className="post-tags">
            {post.meta_keywords?.split(',').slice(0, 5).map((tag, i) => (
              <span key={i} className="post-tag">{tag.trim()}</span>
            ))}
          </div>

          <div className="post-share">
            <span>Поделиться:</span>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn share-telegram"
              aria-label="Share on Telegram"
            >
              TG
            </a>
            <a
              href={`https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn share-vk"
              aria-label="Share on VK"
            >
              VK
            </a>
          </div>
        </footer>
      </article>

      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Читайте также</h2>
          <div className="related-posts-grid">
            {relatedPosts.map(related => (
              <Link key={related.id} to={`/blog/${related.slug}`} className="related-post-card">
                <div
                  className="related-post-image"
                  style={{
                    backgroundImage: related.image_url
                      ? `url(${related.image_url})`
                      : 'linear-gradient(135deg, rgba(0, 255, 249, 0.3), rgba(57, 255, 20, 0.3))'
                  }}
                />
                <div className="related-post-info">
                  <h3>{related.title}</h3>
                  <span className="related-post-date">{formatDate(related.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="blog-nav-bottom">
        <Link to="/blog" className="cyber-button">
          Все статьи блога
        </Link>
      </nav>

      <style>{`
        .blog-post-page {
          min-height: 100vh;
          padding: 100px 20px 60px;
          max-width: 900px;
          margin: 0 auto;
        }

        .blog-post-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 255, 249, 0.2);
          border-top-color: var(--neon-cyan);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .blog-post-not-found {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .not-found-content {
          text-align: center;
        }

        .not-found-content h1 {
          font-size: 120px;
          font-family: 'Orbitron', sans-serif;
          background: linear-gradient(90deg, var(--neon-pink), var(--neon-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .not-found-content p {
          font-size: 18px;
          opacity: 0.8;
          margin-bottom: 30px;
        }

        .blog-post-article {
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .blog-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .blog-breadcrumb a {
          color: var(--neon-cyan);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .blog-breadcrumb a:hover {
          opacity: 0.8;
        }

        .breadcrumb-sep {
          opacity: 0.4;
        }

        .breadcrumb-current {
          opacity: 0.6;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .blog-post-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--neon-green);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .meta-sep {
          opacity: 0.4;
        }

        .reading-time {
          opacity: 0.8;
        }

        .blog-post-title {
          font-size: clamp(32px, 6vw, 48px);
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #fff 0%, var(--neon-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .blog-post-excerpt {
          font-size: 20px;
          line-height: 1.6;
          opacity: 0.85;
          margin-bottom: 30px;
          font-style: italic;
          border-left: 3px solid var(--neon-cyan);
          padding-left: 20px;
        }

        .blog-post-hero {
          width: calc(100% + 40px);
          margin: 0 -20px 40px;
          border-radius: 0;
          overflow: hidden;
          position: relative;
        }

        @media (min-width: 960px) {
          .blog-post-hero {
            width: calc(100% + 100px);
            margin: 0 -50px 40px;
            border-radius: 12px;
          }
        }

        .blog-post-hero img {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: cover;
          display: block;
        }

        .blog-post-content {
          font-size: 18px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.92);
        }

        .blog-post-content .md-h1 {
          font-size: 36px;
          color: var(--neon-pink);
          margin: 50px 0 25px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
        }

        .blog-post-content .md-h2 {
          font-size: 28px;
          color: var(--neon-cyan);
          margin: 45px 0 20px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 255, 249, 0.2);
        }

        .blog-post-content .md-h3 {
          font-size: 22px;
          color: var(--neon-green);
          margin: 35px 0 15px;
          font-weight: 600;
        }

        .blog-post-content .md-h4 {
          font-size: 18px;
          color: #fff;
          margin: 25px 0 12px;
          font-weight: 600;
        }

        .blog-post-content .md-p {
          margin-bottom: 20px;
        }

        .blog-post-content .md-spacer {
          height: 10px;
        }

        .blog-post-content .md-strong {
          color: var(--neon-cyan);
          font-weight: 600;
        }

        .blog-post-content .md-em {
          font-style: italic;
          opacity: 0.9;
        }

        .blog-post-content .md-link {
          color: var(--neon-cyan);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s, opacity 0.2s;
        }

        .blog-post-content .md-link:hover {
          border-bottom-color: var(--neon-cyan);
        }

        .blog-post-content .md-external-link::after {
          content: ' \\2197';
          font-size: 0.8em;
          opacity: 0.7;
        }

        .blog-post-content .md-list {
          margin: 20px 0;
          padding-left: 0;
          list-style: none;
        }

        .blog-post-content .md-ul .md-li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 12px;
        }

        .blog-post-content .md-ul .md-li::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 10px;
          width: 8px;
          height: 8px;
          background: var(--neon-green);
          border-radius: 2px;
          transform: rotate(45deg);
        }

        .blog-post-content .md-ol {
          counter-reset: list-counter;
        }

        .blog-post-content .md-ol .md-li {
          position: relative;
          padding-left: 40px;
          margin-bottom: 12px;
          counter-increment: list-counter;
        }

        .blog-post-content .md-ol .md-li::before {
          content: counter(list-counter);
          position: absolute;
          left: 0;
          top: 0;
          width: 28px;
          height: 28px;
          background: rgba(0, 255, 249, 0.15);
          border: 1px solid var(--neon-cyan);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--neon-cyan);
        }

        .blog-post-content .md-blockquote {
          margin: 30px 0;
          padding: 20px 25px;
          background: rgba(0, 255, 249, 0.05);
          border-left: 4px solid var(--neon-cyan);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
        }

        .blog-post-content .code-block {
          margin: 25px 0;
          padding: 20px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 255, 249, 0.2);
          border-radius: 8px;
          overflow-x: auto;
          position: relative;
        }

        .blog-post-content .code-block::before {
          content: attr(data-lang);
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--neon-green);
          opacity: 0.6;
        }

        .blog-post-content .code-block code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #e0e0e0;
        }

        .blog-post-content .inline-code {
          background: rgba(0, 255, 249, 0.12);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9em;
          color: var(--neon-cyan);
        }

        .blog-post-content .md-hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
          margin: 40px 0;
        }

        .blog-post-content .md-figure {
          margin: 30px 0;
          text-align: center;
        }

        .blog-post-content .md-image {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .blog-post-content .md-figcaption {
          margin-top: 12px;
          font-size: 14px;
          opacity: 0.6;
          font-style: italic;
        }

        .blog-post-footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid rgba(0, 255, 249, 0.2);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .post-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .post-tag {
          padding: 6px 14px;
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.3);
          border-radius: 20px;
          font-size: 12px;
          color: var(--neon-green);
          text-transform: lowercase;
        }

        .post-share {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          opacity: 0.8;
        }

        .share-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .share-btn:hover {
          transform: scale(1.1);
        }

        .share-telegram {
          background: #0088cc;
          color: #fff;
        }

        .share-vk {
          background: #4a76a8;
          color: #fff;
        }

        .related-posts {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(0, 255, 249, 0.15);
        }

        .related-posts h2 {
          font-size: 24px;
          font-family: 'Orbitron', sans-serif;
          color: var(--neon-cyan);
          margin-bottom: 25px;
        }

        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .related-post-card {
          display: block;
          text-decoration: none;
          color: inherit;
          background: rgba(0, 20, 40, 0.5);
          border: 1px solid rgba(0, 255, 249, 0.15);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s, border-color 0.3s;
        }

        .related-post-card:hover {
          transform: translateY(-5px);
          border-color: var(--neon-cyan);
        }

        .related-post-image {
          height: 120px;
          background-size: cover;
          background-position: center;
        }

        .related-post-info {
          padding: 15px;
        }

        .related-post-info h3 {
          font-size: 16px;
          line-height: 1.4;
          margin-bottom: 8px;
          color: #fff;
        }

        .related-post-date {
          font-size: 12px;
          color: var(--neon-green);
          opacity: 0.7;
        }

        .blog-nav-bottom {
          margin-top: 50px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .blog-post-page {
            padding: 90px 16px 40px;
          }

          .blog-post-title {
            font-size: 28px;
          }

          .blog-post-excerpt {
            font-size: 17px;
          }

          .blog-post-content {
            font-size: 16px;
          }

          .blog-post-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
