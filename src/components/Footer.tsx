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
                {contacts.telegramUrl && (
                  <div className="vc-footer-contact-row" style={{ marginTop: '5px' }}>
                    <a href={contacts.telegramUrl} target="_blank" rel="noopener noreferrer" className="vc-footer-link vc-footer-tg">
                      <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.325.016.093.036.305.02.47z" />
                      </svg>
                      <span>{contacts.telegramLabel || 'Telegram'}</span>
                    </a>
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
