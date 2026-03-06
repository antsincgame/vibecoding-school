import DOMPurify from 'dompurify';

export function stripMarkdown(text: string): string {
  if (!text) return '';

  return text
    .replace(/^#+\s+(.+)$/gm, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/^[\-\*]\s+(.+)$/gm, '$1')
    .replace(/^\d+\.\s+(.+)$/gm, '$1')
    .replace(/^>\s*(.+)$/gm, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^---$/gm, '')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.includes('<script') ||
      lower.includes('onerror=') ||
      lower.includes('onload=')) {
    return '';
  }

  if (trimmed.startsWith('/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:')) {
    return escapeHtml(trimmed);
  }

  return escapeHtml(trimmed);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\sа-яёa-z0-9-]/gi, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseMarkdownTable(block: string): string {
  const rows = block.trim().split('\n');
  if (rows.length < 2) return block;

  const parseRow = (row: string): string[] =>
    row.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length);

  const headerCells = parseRow(rows[0]);
  if (headerCells.length === 0) return block;

  const separatorMatch = rows[1].match(/^\|?[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)*\|?$/);
  if (!separatorMatch) return block;

  let tableHtml = '<div class="md-table-wrap"><table class="md-table"><thead><tr>';
  for (const cell of headerCells) {
    tableHtml += `<th>${cell}</th>`;
  }
  tableHtml += '</tr></thead><tbody>';

  for (let i = 2; i < rows.length; i++) {
    const cells = parseRow(rows[i]);
    if (cells.length === 0) continue;
    tableHtml += '<tr>';
    for (let j = 0; j < headerCells.length; j++) {
      tableHtml += `<td>${cells[j] ?? ''}</td>`;
    }
    tableHtml += '</tr>';
  }

  tableHtml += '</tbody></table></div>';
  return tableHtml;
}

export function renderMarkdown(text: string): string {
  if (!text) return '';

  const codeBlocks: string[] = [];
  let html = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="code-block" data-lang="${lang || 'text'}"><code>${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${idx}__`;
  });

  const inlineCode: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCode.length;
    inlineCode.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${idx}__`;
  });

  const tables: string[] = [];
  html = html.replace(/((?:^\|.+\|[ \t]*\n){2,})/gm, (tableBlock) => {
    const idx = tables.length;
    tables.push(parseMarkdownTable(tableBlock));
    return `__TABLE_BLOCK_${idx}__`;
  });

  html = html.replace(/^#### (.+)$/gm, (_, heading) => {
    const id = slugify(heading);
    return `<h4 class="md-h4" id="${id}">${heading}</h4>`;
  });
  html = html.replace(/^### (.+)$/gm, (_, heading) => {
    const id = slugify(heading);
    return `<h3 class="md-h3" id="${id}">${heading}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, heading) => {
    const id = slugify(heading);
    return `<h2 class="md-h2" id="${id}">${heading}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_, heading) => {
    const id = slugify(heading);
    return `<h1 class="md-h1" id="${id}">${heading}</h1>`;
  });

  html = html.replace(/^---$/gm, '<hr class="md-hr">');

  html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');
  html = html.replace(/<\/blockquote>\n<blockquote class="md-blockquote">/g, '\n');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="md-strong">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>');

  html = html.replace(/\[(.+?)\]\(\/([^)]+)\)/g, (_, text, path) => {
    const safeUrl = sanitizeUrl('/' + path);
    return safeUrl ? `<a href="${safeUrl}" class="md-link md-internal-link">${escapeHtml(text)}</a>` : escapeHtml(text);
  });
  html = html.replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, (_, text, url) => {
    const safeUrl = sanitizeUrl(url);
    return safeUrl ? `<a href="${safeUrl}" class="md-link md-external-link" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>` : escapeHtml(text);
  });
  html = html.replace(/\[(.+?)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeUrl = sanitizeUrl(url);
    return safeUrl ? `<a href="${safeUrl}" class="md-link">${escapeHtml(text)}</a>` : escapeHtml(text);
  });

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    const safeAlt = escapeHtml(alt);
    return safeUrl ? `<figure class="md-figure"><img src="${safeUrl}" alt="${safeAlt}" class="md-image" loading="lazy"><figcaption class="md-figcaption">${safeAlt}</figcaption></figure>` : '';
  });

  const lines = html.split('\n');
  const result: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      result.push(`<${inList} class="md-list md-${inList}">`);
      listItems.forEach(item => result.push(item));
      result.push(`</${inList}>`);
      listItems = [];
      inList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.match(/^[\-\*]\s+(.+)/)) {
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
      }
      const content = trimmed.replace(/^[\-\*]\s+(.+)/, '$1');
      listItems.push(`<li class="md-li">${content}</li>`);
    } else if (trimmed.match(/^\d+\.\s+(.+)/)) {
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
      }
      const content = trimmed.replace(/^\d+\.\s+(.+)/, '$1');
      listItems.push(`<li class="md-li">${content}</li>`);
    } else {
      flushList();

      if (trimmed === '') {
        if (result.length > 0 && !result[result.length - 1].match(/<\/(h[1-4]|ul|ol|pre|blockquote|hr|figure)>/)) {
          result.push('<div class="md-spacer"></div>');
        }
      } else if (!trimmed.startsWith('<h') && !trimmed.startsWith('<blockquote') && !trimmed.startsWith('<hr') && !trimmed.startsWith('<figure') && !trimmed.startsWith('__CODE_BLOCK')) {
        result.push(`<p class="md-p">${trimmed}</p>`);
      } else {
        result.push(line);
      }
    }
  }

  flushList();

  html = result.join('\n');

  codeBlocks.forEach((block, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  inlineCode.forEach((code, idx) => {
    html = html.replace(`__INLINE_CODE_${idx}__`, code);
  });

  tables.forEach((table, idx) => {
    html = html.replace(`<p class="md-p">__TABLE_BLOCK_${idx}__</p>`, table);
    html = html.replace(`__TABLE_BLOCK_${idx}__`, table);
  });

  html = html.replace(/<p class="md-p">(<pre|<h[1-4]|<ul|<ol|<blockquote|<hr|<figure|<div)/g, '$1');
  html = html.replace(/(<\/pre>|<\/h[1-4]>|<\/ul>|<\/ol>|<\/blockquote>|<\/figure>|<\/div>)<\/p>/g, '$1');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption', 'hr', 'div', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'data-lang', 'loading', 'id'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel']
  });
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = stripMarkdown(text).split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function generateExcerpt(text: string, maxLength: number = 160): string {
  const stripped = stripMarkdown(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
