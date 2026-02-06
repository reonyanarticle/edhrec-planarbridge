import { describe, it, expect } from 'vitest';
import {
  isCardPage,
  extractSlugFromUrl,
  slugToCardName,
  encodeCardNameForSearch,
  getCardNameFromUrl,
} from './url-utils';

describe('isCardPage', () => {
  it('/cards/ パスを正しく判定する', () => {
    expect(isCardPage('https://edhrec.com/cards/sol-ring')).toBe(true);
    expect(isCardPage('https://edhrec.com/cards/lightning-bolt')).toBe(true);
  });

  it('/commanders/ パスを正しく判定する', () => {
    expect(isCardPage('https://edhrec.com/commanders/korvold-fae-cursed-king')).toBe(true);
    expect(isCardPage('https://edhrec.com/commanders/the-ur-dragon')).toBe(true);
  });

  it('その他のパスはfalseを返す', () => {
    expect(isCardPage('https://edhrec.com/')).toBe(false);
    expect(isCardPage('https://edhrec.com/decks')).toBe(false);
    expect(isCardPage('https://edhrec.com/sets/foundations')).toBe(false);
    expect(isCardPage('https://edhrec.com/tribes/dragon')).toBe(false);
  });

  it('無効なURLでfalseを返す', () => {
    expect(isCardPage('')).toBe(false);
    expect(isCardPage('not-a-url')).toBe(false);
    expect(isCardPage('https://example.com/cards/sol-ring')).toBe(false);
  });

  it('クエリパラメータやフラグメントがあっても正しく判定する', () => {
    expect(isCardPage('https://edhrec.com/cards/sol-ring?utm_source=test')).toBe(true);
    expect(isCardPage('https://edhrec.com/cards/sol-ring#prices')).toBe(true);
  });
});

describe('extractSlugFromUrl', () => {
  it('カードページからslugを抽出する', () => {
    expect(extractSlugFromUrl('https://edhrec.com/cards/sol-ring')).toBe('sol-ring');
    expect(extractSlugFromUrl('https://edhrec.com/cards/lim-duls-vault')).toBe('lim-duls-vault');
  });

  it('統率者ページからslugを抽出する', () => {
    expect(extractSlugFromUrl('https://edhrec.com/commanders/korvold-fae-cursed-king')).toBe(
      'korvold-fae-cursed-king'
    );
    expect(extractSlugFromUrl('https://edhrec.com/commanders/the-ur-dragon')).toBe('the-ur-dragon');
  });

  it('無効なURLでnullを返す', () => {
    expect(extractSlugFromUrl('')).toBe(null);
    expect(extractSlugFromUrl('https://edhrec.com/')).toBe(null);
    expect(extractSlugFromUrl('https://edhrec.com/decks')).toBe(null);
    expect(extractSlugFromUrl('not-a-url')).toBe(null);
  });

  it('クエリパラメータを除いてslugを抽出する', () => {
    expect(extractSlugFromUrl('https://edhrec.com/cards/sol-ring?utm_source=test')).toBe(
      'sol-ring'
    );
  });

  it('両面カードのslugを抽出する', () => {
    expect(
      extractSlugFromUrl(
        'https://edhrec.com/cards/fable-of-the-mirror-breaker-reflection-of-kiki-jiki'
      )
    ).toBe('fable-of-the-mirror-breaker-reflection-of-kiki-jiki');
  });
});

describe('slugToCardName', () => {
  it('ハイフンをスペースに変換する', () => {
    expect(slugToCardName('sol-ring')).toBe('Sol Ring');
    expect(slugToCardName('lightning-bolt')).toBe('Lightning Bolt');
  });

  it('各単語の先頭を大文字にする', () => {
    expect(slugToCardName('the-ur-dragon')).toBe('The Ur Dragon');
    expect(slugToCardName('korvold-fae-cursed-king')).toBe('Korvold Fae Cursed King');
  });

  it('空文字列を処理する', () => {
    expect(slugToCardName('')).toBe('');
  });

  it('単一単語を処理する', () => {
    expect(slugToCardName('brainstorm')).toBe('Brainstorm');
  });

  it('長いslugを処理する', () => {
    expect(slugToCardName('fable-of-the-mirror-breaker-reflection-of-kiki-jiki')).toBe(
      'Fable Of The Mirror Breaker Reflection Of Kiki Jiki'
    );
  });
});

describe('encodeCardNameForSearch', () => {
  it('スペースをエンコードする', () => {
    expect(encodeCardNameForSearch('Sol Ring')).toBe('Sol%20Ring');
  });

  it('特殊文字をエンコードする', () => {
    expect(encodeCardNameForSearch("Lim-Dul's Vault")).toBe("Lim-Dul's%20Vault");
    expect(encodeCardNameForSearch('Fire // Ice')).toBe('Fire%20%2F%2F%20Ice');
  });

  it('日本語をエンコードする', () => {
    const encoded = encodeCardNameForSearch('太陽の指輪');
    expect(encoded).toBe('%E5%A4%AA%E9%99%BD%E3%81%AE%E6%8C%87%E8%BC%AA');
  });
});

describe('getCardNameFromUrl', () => {
  it('カードページURLからカード名を取得する', () => {
    expect(getCardNameFromUrl('https://edhrec.com/cards/sol-ring')).toBe('Sol Ring');
    expect(getCardNameFromUrl('https://edhrec.com/cards/lightning-bolt')).toBe('Lightning Bolt');
  });

  it('統率者ページURLからカード名を取得する', () => {
    expect(getCardNameFromUrl('https://edhrec.com/commanders/the-ur-dragon')).toBe('The Ur Dragon');
    expect(getCardNameFromUrl('https://edhrec.com/commanders/korvold-fae-cursed-king')).toBe(
      'Korvold Fae Cursed King'
    );
  });

  it('無効なURLでnullを返す', () => {
    expect(getCardNameFromUrl('')).toBe(null);
    expect(getCardNameFromUrl('https://edhrec.com/')).toBe(null);
    expect(getCardNameFromUrl('https://edhrec.com/decks')).toBe(null);
    expect(getCardNameFromUrl('not-a-url')).toBe(null);
  });
});
