import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '@vibecoding/shared';

/* ── Types ── */

export interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

export interface FooterSection {
  title: string;
  titleColor?: string;
  links: FooterLink[];
}

export interface FooterContact {
  address?: string;
  addressUrl?: string;
  phone?: string;
  email?: string;
  telegramUrl?: string;
  telegramLabel?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
}

export interface FooterConfig {
  brandName: string;
  brandDescription: string;
  sections?: FooterSection[];
  contacts?: FooterContact;
  showBlogArticles?: boolean;
  copyrightText?: string;
  copyrightLinks?: FooterLink[];
  legalText?: string;
  loginPath?: string;
  portals?: { label: string; url: string; description?: string }[];
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
}

/* ── Component ── */

export default function Footer({
  brandName,
  brandDescription,
  sections,
  contacts,
  showBlogArticles = false,
  copyrightText = `© ${new Date().getFullYear()} Vibecoding. Все права защищены.`,
  copyrightLinks,
  legalText,
  loginPath = '/login',
  portals,
}: FooterConfig) {
  const [isMobile, setIsMobile] = useState(false);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!showBlogArticles) return;
    const supabase = getSupabase();

    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        setSettings(data.reduce((a, i) => ({ ...a, [i.key]: i.value }), {} as Record<string, string>));
      }
    });

    supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setArticles(data); });
  }, [showBlogArticles]);

  const name = settings.school_name || brandName;
  const desc = settings.about_text || brandDescription;

  return (
    <footer className="vc-footer">
      <div className="vc-footer-inner">
        <div className="vc-footer-grid">
          {/* Brand column */}
          <div className="vc-footer-brand">
            <h3 className="vc-footer-brand-name">{name}</h3>
            <p className="vc-footer-brand-desc">{desc}</p>

            {/* Portal links */}
            {portals && portals.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 className="vc-footer-section-title" style={{ color: 'var(--neon-cyan, #00fff9)', fontSize: '13px', marginBottom: '10px' }}>
                  Наши порталы
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {portals.map((portal) => (
                    <a
                      key={portal.url}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vc-footer-link"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span style={{ color: 'var(--neon-cyan)', fontSize: '14px' }}>🌐</span>
                      <span>{portal.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog articles (school) */}
          {showBlogArticles && articles.length > 0 && (
            <div>
              <h4 className="vc-footer-section-title" style={{ color: 'var(--neon-green, #00ff88)' }}>
                Полезные статьи
              </h4>
              <div className="vc-footer-articles">
                {articles.map((a) => (
                  <Link key={a.id} to={`/blog/${a.slug}`} className="vc-footer-article-link">
                    <span className="vc-footer-arrow">→</span>
                    <span>{a.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Custom sections */}
          {sections?.map((section) => (
            <div key={section.title}>
              <h4
                className="vc-footer-section-title"
                style={section.titleColor ? { color: section.titleColor } : undefined}
              >
                {section.title}
              </h4>
              <ul className="vc-footer-links">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="vc-footer-link">{link.label}</Link>
                    ) : link.href ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="vc-footer-link">{link.label}</a>
                    ) : (
                      <span className="vc-footer-link">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacts */}
          {contacts && (
            <div>
              <h4 className="vc-footer-section-title" style={{ color: 'var(--neon-pink, #ff006e)' }}>
                Контакты
              </h4>
              <div className="vc-footer-contacts">
                {contacts.address && (
                  <div className="vc-footer-contact-row">
                    <span>📍</span>
                    {contacts.addressUrl ? (
                      <a href={contacts.addressUrl} target="_blank" rel="noopener noreferrer" className="vc-footer-link">
                        {settings.address || contacts.address}
                      </a>
                    ) : (
                      <span>{settings.address || contacts.address}</span>
                    )}
                  </div>
                )}
                {contacts.phone && (
                  <div className="vc-footer-contact-row">
                    <span>📞</span>
                    <a href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`} className="vc-footer-link">
                      {settings.phone || contacts.phone}
                    </a>
                  </div>
                )}
                {contacts.email && (
                  <div className="vc-footer-contact-row">
                    <span>✉️</span>
                    <a href={`mailto:${contacts.email}`} className="vc-footer-link">{contacts.email}</a>
                  </div>
                )}
                {(contacts.telegramUrl || contacts.youtubeUrl || contacts.instagramUrl) && (
                <div className="vc-footer-contact-row" style={{ marginTop: '5px', gap: '16px', flexWrap: 'wrap' }}>
                  {contacts.telegramUrl && (
                    <a href={contacts.telegramUrl} target="_blank" rel="noopener noreferrer" className="vc-footer-link vc-footer-tg">
                      <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.325.016.093.036.305.02.47z" />
                      </svg>
                      <span>{contacts.telegramLabel || 'Telegram'}</span>
                    </a>
                  )}
                  {contacts.youtubeUrl && (
                    <a href={contacts.youtubeUrl} target="_blank" rel="noopener noreferrer" className="vc-footer-link vc-footer-tg" title="YouTube">
                      <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span>YouTube</span>
                    </a>
                  )}
                  {contacts.instagramUrl && (
                    <a href={contacts.instagramUrl} target="_blank" rel="noopener noreferrer" className="vc-footer-link vc-footer-tg" title="Instagram">
                      <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.549.07 3.052.148 4.771 1.691 4.919 4.919.058.965.07 1.345.07 4.549s-.012 3.584-.07 4.549c-.149 3.025-1.664 4.771-4.919 4.919-.965.058-1.345.07-4.549.07s-3.584-.012-4.549-.07c-3.026-.149-4.771-1.664-4.919-4.919-.058-.965-.07-1.345-.07-4.549s.012-3.584.07-4.549c.149-3.026 1.664-4.771 4.919-4.919.965-.058 1.345-.07 4.549-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.072 1.689-.072 4.948s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.072-1.689.072-4.948s-.015-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
                      </svg>
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="vc-footer-bottom">
          <div className="vc-footer-copyright">
            <span
              onClick={() => { if (loginPath) window.location.href = loginPath; }}
              className="vc-footer-copyright-text"
            >
              {copyrightText}
            </span>
            {copyrightLinks?.map((link, i) => (
              <span key={link.label}>
                <span className="vc-footer-sep">|</span>
                {link.to ? (
                  <Link to={link.to} className="vc-footer-copyright-link">{link.label}</Link>
                ) : (
                  <span className="vc-footer-copyright-link">{link.label}</span>
                )}
              </span>
            ))}
          </div>
          {legalText && <div className="vc-footer-legal">{legalText}</div>}
        </div>
      </div>
    </footer>
  );
}
