export class YouTubeAdapter {
  static isYouTubePage(): boolean {
    return window.location.hostname.includes('youtube.com');
  }

  static getActiveVideoTitle(): string | null {
    if (!this.isYouTubePage()) return null;
    const titleEl = document.querySelector('h1.ytd-watch-metadata, #title h1');
    return titleEl?.textContent?.trim() || null;
  }
}
