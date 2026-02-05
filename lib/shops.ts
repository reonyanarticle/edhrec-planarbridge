/**
 * サポートするショップの設定
 */

export interface Shop {
  id: string;
  name: string;
  nameEn: string;
  baseUrl: string;
  buildUrl: (cardName: string) => string;
}

export const SHOPS: Record<string, Shop> = {
  hareruya: {
    id: 'hareruya',
    name: '晴れる屋',
    nameEn: 'Hareruya',
    baseUrl: 'https://www.hareruyamtg.com/ja/products/search',
    buildUrl: (cardName: string) =>
      `https://www.hareruyamtg.com/ja/products/search?product=${encodeURIComponent(cardName)}`,
  },
} as const;

export type ShopId = keyof typeof SHOPS;

export const DEFAULT_SHOP_ID: ShopId = 'hareruya';

/**
 * ショップIDからショップ情報を取得
 */
export function getShop(shopId: ShopId): Shop {
  return SHOPS[shopId];
}

/**
 * 有効なショップIDかどうかを判定
 */
export function isValidShopId(id: string): id is ShopId {
  return id in SHOPS;
}

/**
 * すべてのショップIDを取得
 */
export function getAllShopIds(): ShopId[] {
  return Object.keys(SHOPS) as ShopId[];
}
