import { renderMarkdown } from '../lib/markdown';

export default function CourseDescription({ description }: { description: string }) {
  const sections = description.split('---').map(s => s.trim()).filter(s => s);
  const intro = sections[0] || '';
  const mainContent = sections.slice(1, -1).join('\n\n');
  const conclusion = sections.length > 2 ? sections[sections.length - 1] : (sections.length === 2 ? sections[1] : '');

  return (
    <div className="course-description-container">
      {intro && (
        <section className="course-intro">
          <div className="intro-glow" />
          <div
            className="course-markdown"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(intro) }}
          />
        </section>
      )}

      {mainContent && (
        <section className="course-main">
          <div
            className="course-markdown"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(mainContent) }}
          />
        </section>
      )}

      {conclusion && (
        <section className="course-conclusion">
          <div className="conclusion-icon">&#8594;</div>
          <div
            className="course-markdown"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(conclusion) }}
          />
        </section>
      )}

      <style>{`
        .course-description-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .course-intro {
          background: linear-gradient(135deg, rgba(0, 255, 249, 0.06) 0%, rgba(57, 255, 20, 0.04) 100%);
          padding: 35px 40px;
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 249, 0.2);
          position: relative;
          overflow: hidden;
        }

        .intro-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          height: 3px;
          background: linear-gradient(90deg, var(--neon-cyan), var(--neon-green), var(--neon-cyan));
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .course-main {
          background: rgba(0, 20, 40, 0.4);
          padding: 35px 40px;
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 249, 0.12);
        }

        .course-conclusion {
          background: linear-gradient(135deg, rgba(0, 255, 249, 0.08) 0%, rgba(57, 255, 20, 0.06) 100%);
          padding: 30px 35px 30px 70px;
          border-radius: 12px;
          border: 1px solid rgba(57, 255, 20, 0.3);
          position: relative;
        }

        .conclusion-icon {
          position: absolute;
          left: 25px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
          color: var(--neon-green);
          opacity: 0.7;
        }

        .course-markdown {
          font-size: 17px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.92);
        }

        .course-markdown .md-h1 {
          font-size: 32px;
          color: var(--neon-pink);
          margin: 40px 0 20px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
        }

        .course-markdown .md-h2 {
          font-size: 26px;
          color: var(--neon-cyan);
          margin: 35px 0 18px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 255, 249, 0.15);
        }

        .course-markdown .md-h3 {
          font-size: 20px;
          color: var(--neon-green);
          margin: 25px 0 12px;
          font-weight: 600;
        }

        .course-markdown .md-p {
          margin-bottom: 16px;
        }

        .course-intro .course-markdown .md-p:first-child {
          font-size: 19px;
          line-height: 1.7;
        }

        .course-markdown .md-spacer {
          height: 8px;
        }

        .course-markdown .md-strong {
          color: var(--neon-cyan);
          font-weight: 600;
        }

        .course-markdown .md-em {
          font-style: italic;
          opacity: 0.9;
        }

        .course-markdown .md-link {
          color: var(--neon-cyan);
          text-decoration: none;
          border-bottom: 1px dashed rgba(0, 255, 249, 0.4);
          transition: border-color 0.2s, color 0.2s;
        }

        .course-markdown .md-link:hover {
          border-bottom-color: var(--neon-cyan);
          color: var(--neon-green);
        }

        .course-markdown .md-list {
          margin: 18px 0;
          padding-left: 0;
          list-style: none;
        }

        .course-markdown .md-ul .md-li {
          position: relative;
          padding-left: 30px;
          margin-bottom: 14px;
          line-height: 1.7;
        }

        .course-markdown .md-ul .md-li::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 9px;
          width: 10px;
          height: 10px;
          background: var(--neon-green);
          border-radius: 2px;
          transform: rotate(45deg);
          box-shadow: 0 0 8px var(--neon-green);
        }

        .course-markdown .md-ol {
          counter-reset: list-counter;
        }

        .course-markdown .md-ol .md-li {
          position: relative;
          padding-left: 45px;
          margin-bottom: 14px;
          counter-increment: list-counter;
        }

        .course-markdown .md-ol .md-li::before {
          content: counter(list-counter);
          position: absolute;
          left: 0;
          top: 0;
          width: 30px;
          height: 30px;
          background: rgba(0, 255, 249, 0.12);
          border: 1px solid var(--neon-cyan);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--neon-cyan);
        }

        .course-markdown .md-blockquote {
          margin: 25px 0;
          padding: 18px 22px;
          background: rgba(0, 255, 249, 0.04);
          border-left: 4px solid var(--neon-cyan);
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .course-markdown .inline-code {
          background: rgba(0, 255, 249, 0.1);
          padding: 2px 7px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9em;
          color: var(--neon-cyan);
        }

        .course-markdown .md-hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
          margin: 30px 0;
        }

        @media (max-width: 768px) {
          .course-intro,
          .course-main {
            padding: 25px 20px;
          }

          .course-conclusion {
            padding: 25px 20px 25px 55px;
          }

          .conclusion-icon {
            left: 18px;
          }

          .course-markdown {
            font-size: 16px;
          }

          .course-markdown .md-h2 {
            font-size: 22px;
          }

          .course-markdown .md-ul .md-li,
          .course-markdown .md-ol .md-li {
            padding-left: 25px;
          }
        }
      `}</style>
    </div>
  );
}
