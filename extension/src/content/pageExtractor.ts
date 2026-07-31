import { PageContext } from '../shared/types';

export class PageExtractor {
  static extract(): PageContext {
    const title = document.title || 'Active Webpage';
    const url = window.location.href || '';
    const domain = window.location.hostname || '';

    const selectedText = window.getSelection()?.toString().trim() || '';

    // Extract Headings (h1, h2, h3)
    const headings: string[] = [];
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      const txt = h.textContent?.trim();
      if (txt && txt.length > 3 && txt.length < 100 && headings.length < 5) {
        headings.push(txt);
      }
    });

    // Extract Paragraphs
    const paragraphs: string[] = [];
    document.querySelectorAll('p, article, section').forEach(p => {
      const txt = p.textContent?.replace(/\s+/g, ' ').trim();
      if (txt && txt.length > 40 && paragraphs.length < 6) {
        paragraphs.push(txt);
      }
    });

    const mainText = paragraphs.join('\n\n') || document.body?.innerText?.slice(0, 3000) || '';

    return {
      title,
      url,
      domain,
      selectedText,
      mainText: mainText.slice(0, 4000),
      headings,
      metadata: {
        extractedAt: Date.now(),
        paragraphCount: paragraphs.length
      }
    };
  }
}
