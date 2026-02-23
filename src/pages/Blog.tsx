import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getReadingTime } from '../lib/markdown';
import GeometricBackground from '../components/GeometricBackground';
import type { BlogPost } from '../types';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Блог вайбкодинга | Статьи о Cursor AI и AI-разработке - Vibecoding';

    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', 'Блог о вайбкодинге: туториалы Cursor AI, гайды по созданию сайтов с ИИ. Бесплатные статьи о вайбкодинге для начинающих. Учись создавать приложения с нейросетями - новые материалы каждую неделю!');
    updateMeta('keywords', 'блог вайбкодинг, статьи о вайбкодинге, Cursor AI туториалы, AI-разработка гайды, вайбкодинг для начинающих, создание сайтов с ИИ статьи');
    updateMeta('og:title', 'Блог вайбкодинга | Статьи Cursor AI и AI-разработка - Vibecoding', true);
    updateMeta('og:description', 'Бесплатные статьи о вайбкодинге: туториалы Cursor AI, гайды AI-разработки. Создавай сайты с ИИ!', true);
    updateMeta('og:type', 'website', true);

    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) existingSchema.remove();

    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error loading blog posts:', error);
    }

    if (data) {
      setPosts(data);
      injectBlogListSchema(data);
    }
    setLoading(false);
  };

  const injectBlogListSchema = (blogPosts: BlogPost[]) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Vibecoding Blog',
      description: 'Статьи о вайб-кодинге, Cursor AI и Bolt.new',
      url: window.location.href,
      blogPost: blogPosts.map(post => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.published_at,
        url: `${window.location.origin}/blog/${post.slug}`,
        image: post.image_url
      }))
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="blog-page">
      <GeometricBackground variant="default" colorScheme="mixed" />
      <header className="blog-header">
        <nav className="blog-breadcrumb">
          <Link to="/">Главная</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Блог</span>
        </nav>

        <h1 className="blog-title">Блог</h1>
        <p className="blog-subtitle">
          Статьи о <strong>вайб-кодинге</strong>, <strong>Cursor AI</strong>, <strong>Bolt.new</strong> и создании веб-приложений с помощью искусственного интеллекта
        </p>
      </header>

      {loading ? (
        <div className="blog-loading">
          <div className="loading-spinner" />
          <span>Загрузка статей...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty cyber-card">
          <h2>Скоро здесь появятся статьи</h2>
          <p>Мы готовим интересные материалы для вас</p>
        </div>
      ) : (
        <>
          {posts.length > 0 && (
            <article className="featured-post">
              <Link to={`/blog/${posts[0].slug}`} className="featured-post-link">
                <div className="featured-post-image">
                  {posts[0].image_url ? (
                    <img
                      src={posts[0].image_url}
                      alt={posts[0].title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="featured-post-placeholder" />
                  )}
                  <span className="featured-badge">Новое</span>
                </div>
                <div className="featured-post-content">
                  <div className="featured-post-meta">
                    <time>{formatDate(posts[0].published_at)}</time>
                    <span className="meta-sep">|</span>
                    <span>{getReadingTime(posts[0].content)} мин. чтения</span>
                  </div>
                  <h2 className="featured-post-title">{posts[0].title}</h2>
                  <p className="featured-post-excerpt">{posts[0].excerpt}</p>
                  <span className="featured-post-cta">
                    Читать статью <span className="arrow">-&gt;</span>
                  </span>
                </div>
              </Link>
            </article>
          )}

          {posts.length > 1 && (
            <section className="posts-grid-section">
              <h2 className="section-title">Все статьи</h2>
              <div className="posts-grid">
                {posts.slice(1).map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="post-card"
                  >
                    <article>
                      <div className="post-card-image">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="post-card-placeholder" />
                        )}
                      </div>
                      <div className="post-card-content">
                        <div className="post-card-meta">
                          <time>{formatDate(post.published_at)}</time>
                          <span>{getReadingTime(post.content)} мин.</span>
                        </div>
                        <h3 className="post-card-title">{post.title}</h3>
                        <p className="post-card-excerpt">{post.excerpt}</p>
                        <span className="post-card-cta">
                          Читать <span className="arrow">-&gt;</span>
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <style>{`
        .blog-page {
          min-height: 100vh;
          padding: 100px 20px 60px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 50px;
          padding: 40px;
          background: rgba(10, 15, 25, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(0, 255, 249, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .blog-breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 30px;
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

        .blog-title {
          font-size: clamp(40px, 8vw, 64px);
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 20px;
          background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan), var(--neon-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .blog-subtitle {
          font-size: 18px;
          opacity: 0.85;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .blog-subtitle strong {
          color: var(--neon-cyan);
        }

        .blog-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
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

        .blog-empty {
          text-align: center;
          padding: 80px 30px;
        }

        .blog-empty h2 {
          color: var(--neon-cyan);
          margin-bottom: 15px;
        }

        .blog-empty p {
          opacity: 0.7;
        }

        .featured-post {
          margin-bottom: 60px;
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

        .featured-post-link {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          text-decoration: none;
          color: inherit;
          background: rgba(10, 15, 25, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 249, 0.15);
          border-radius: 20px;
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .featured-post-link:hover {
          border-color: var(--neon-cyan);
          box-shadow: 0 25px 70px rgba(0, 255, 249, 0.2);
          transform: translateY(-5px);
        }

        .featured-post-image {
          min-height: 350px;
          position: relative;
          overflow: hidden;
        }

        .featured-post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }

        .featured-post-placeholder {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(135deg, rgba(0, 255, 249, 0.4), rgba(57, 255, 20, 0.4));
        }

        .featured-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 8px 16px;
          background: var(--neon-green);
          color: #000;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 4px;
        }

        .featured-post-content {
          padding: 40px 40px 40px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .featured-post-meta {
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

        .featured-post-title {
          font-size: 32px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 20px;
          color: #fff;
          transition: color 0.3s;
        }

        .featured-post-link:hover .featured-post-title {
          color: var(--neon-cyan);
        }

        .featured-post-excerpt {
          font-size: 17px;
          line-height: 1.7;
          opacity: 0.85;
          margin-bottom: 25px;
        }

        .featured-post-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--neon-cyan);
          font-weight: 600;
          font-size: 15px;
        }

        .featured-post-cta .arrow {
          transition: transform 0.3s;
        }

        .featured-post-link:hover .featured-post-cta .arrow {
          transform: translateX(5px);
        }

        .posts-grid-section {
          margin-top: 40px;
        }

        .section-title {
          font-size: 24px;
          font-family: 'Orbitron', sans-serif;
          color: var(--neon-cyan);
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0, 255, 249, 0.2);
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 30px;
        }

        .post-card {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .post-card article {
          height: 100%;
          background: rgba(10, 15, 25, 0.8);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(0, 255, 249, 0.12);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .post-card:hover article {
          transform: translateY(-10px);
          border-color: var(--neon-cyan);
          box-shadow: 0 20px 60px rgba(0, 255, 249, 0.15);
        }

        .post-card-image {
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        .post-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-card-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 255, 249, 0.3), rgba(57, 255, 20, 0.3));
        }

        .post-card-content {
          padding: 25px;
        }

        .post-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--neon-green);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
          opacity: 0.8;
        }

        .post-card-title {
          font-size: 20px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 12px;
          color: #fff;
          transition: color 0.3s;
        }

        .post-card:hover .post-card-title {
          color: var(--neon-cyan);
        }

        .post-card-excerpt {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.8;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--neon-cyan);
          font-size: 14px;
          font-weight: 600;
        }

        .post-card-cta .arrow {
          transition: transform 0.3s;
        }

        .post-card:hover .post-card-cta .arrow {
          transform: translateX(4px);
        }

        @media (max-width: 900px) {
          .featured-post-link {
            grid-template-columns: 1fr;
          }

          .featured-post-image {
            min-height: 250px;
          }

          .featured-post-content {
            padding: 30px;
          }

          .featured-post-title {
            font-size: 26px;
          }
        }

        @media (max-width: 768px) {
          .blog-page {
            padding: 90px 16px 40px;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }

          .blog-subtitle {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
