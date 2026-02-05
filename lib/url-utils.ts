/**
 * EDHRECのカードページからカード名を抽出し、ショップURLを生成するユーティリティ
 */

// /cards/ と /commanders/ の両方に対応
const CARD_PAGE_PATTERN = /^https:\/\/edhrec\.com\/(cards|commanders)\/([^/?#]+)/;

/**
 * URLがカードページかどうかを判定
 */
export function isCardPage(url: string): boolean {
  return CARD_PAGE_PATTERN.test(url);
}

/**
 * URLからカードのslugを抽出
 * @example extractSlugFromUrl('https://edhrec.com/cards/sol-ring') // 'sol-ring'
 */
export function extractSlugFromUrl(url: string): string | null {
  const match = url.match(CARD_PAGE_PATTERN);
  return match ? match[2] : null; // match[2] はslug（match[1]は "cards" または "commanders"）
}

/**
 * slugをカード名に変換
 * 注意: アポストロフィやコンマ等の特殊文字は復元できない
 * @example slugToCardName('sol-ring') // 'Sol Ring'
 * @example slugToCardName('lim-duls-vault') // 'Lim Duls Vault'
 */
export function slugToCardName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * カード名を検索URL用にエンコード
 */
export function encodeCardNameForSearch(name: string): string {
  return encodeURIComponent(name);
}

/**
 * URLからカード名を取得するヘルパー関数
 */
export function getCardNameFromUrl(url: string): string | null {
  const slug = extractSlugFromUrl(url);
  if (!slug) return null;
  return slugToCardName(slug);
}
