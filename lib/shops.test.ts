import { describe, it, expect } from 'vitest';
import { SHOPS, getShop, isValidShopId, getAllShopIds, DEFAULT_SHOP_ID } from './shops';

describe('SHOPS', () => {
  it('hareruyaショップが定義されている', () => {
    expect(SHOPS.hareruya).toBeDefined();
    expect(SHOPS.hareruya.id).toBe('hareruya');
    expect(SHOPS.hareruya.name).toBe('晴れる屋');
    expect(SHOPS.hareruya.nameEn).toBe('Hareruya');
  });

  it('buildUrlが正しいURLを生成する', () => {
    const url = SHOPS.hareruya.buildUrl('Sol Ring');
    expect(url).toBe('https://www.hareruyamtg.com/ja/products/search?product=Sol%20Ring');
  });

  it('buildUrlが特殊文字をエンコードする', () => {
    const url = SHOPS.hareruya.buildUrl("Lim-Dul's Vault");
    expect(url).toBe("https://www.hareruyamtg.com/ja/products/search?product=Lim-Dul's%20Vault");
  });

  it('buildUrlが日本語をエンコードする', () => {
    const url = SHOPS.hareruya.buildUrl('太陽の指輪');
    expect(url).toContain('https://www.hareruyamtg.com/ja/products/search?product=');
    expect(url).toContain('%E5%A4%AA%E9%99%BD');
  });
});

describe('getShop', () => {
  it('hareruyaショップ情報を返す', () => {
    const shop = getShop('hareruya');
    expect(shop.id).toBe('hareruya');
    expect(shop.name).toBe('晴れる屋');
    expect(shop.baseUrl).toBe('https://www.hareruyamtg.com/ja/products/search');
  });

  it('buildUrl関数が正しく動作する', () => {
    const shop = getShop('hareruya');
    const url = shop.buildUrl('Lightning Bolt');
    expect(url).toBe('https://www.hareruyamtg.com/ja/products/search?product=Lightning%20Bolt');
  });
});

describe('isValidShopId', () => {
  it('有効なショップIDでtrueを返す', () => {
    expect(isValidShopId('hareruya')).toBe(true);
  });

  it('無効なショップIDでfalseを返す', () => {
    expect(isValidShopId('invalid')).toBe(false);
    expect(isValidShopId('')).toBe(false);
    expect(isValidShopId('cardkingdom')).toBe(false);
    expect(isValidShopId('tcgplayer')).toBe(false);
  });
});

describe('getAllShopIds', () => {
  it('全ショップIDを配列で返す', () => {
    const ids = getAllShopIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toContain('hareruya');
  });

  it('少なくとも1つのショップが含まれる', () => {
    const ids = getAllShopIds();
    expect(ids.length).toBeGreaterThanOrEqual(1);
  });
});

describe('DEFAULT_SHOP_ID', () => {
  it('有効なショップIDである', () => {
    expect(isValidShopId(DEFAULT_SHOP_ID)).toBe(true);
  });

  it('hareruyaがデフォルトである', () => {
    expect(DEFAULT_SHOP_ID).toBe('hareruya');
  });
});
