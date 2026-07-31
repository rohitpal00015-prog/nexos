export interface SearchResultItem {
  title: string;
  snippet: string;
  link: string;
}

export class SerpApiService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.SERPAPI_KEY;
    if (this.apiKey && this.apiKey !== 'your_serpapi_key_here') {
      console.log('[SerpApiService] Live Google Search grounding initialized via SerpAPI.');
    }
  }

  async searchGoogle(query: string): Promise<SearchResultItem[]> {
    if (!this.apiKey || this.apiKey === 'your_serpapi_key_here') {
      return [];
    }

    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      if (data.error) {
        // Handle unverified SerpAPI account gracefully
        return [];
      }

      const results: SearchResultItem[] = [];
      if (data.organic_results && Array.isArray(data.organic_results)) {
        for (const item of data.organic_results.slice(0, 4)) {
          results.push({
            title: item.title || '',
            snippet: item.snippet || '',
            link: item.link || ''
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
