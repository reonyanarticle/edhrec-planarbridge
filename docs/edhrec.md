# EDHREC DOM構造仕様

## カードページURL形式
- カード: `https://edhrec.com/cards/{slug}`
- 統率者: `https://edhrec.com/commanders/{slug}`

## DOM構造

```
Card_container__xxxxx
├── Card_nameWrapper__xxxxx (カード名)
├── lazyload-wrapper
│   ├── Card_cardButtons__xxxxx
│   ├── CardImage_container__xxxxx (カード画像)
│   └── CardPrices_prices__xxxxx (価格エリア)
│       ├── <a> Cardmarket (€0.59)
│       ├── <a> Card Kingdom ($1.99)
│       └── <a> TCGPlayer ($1.33)
└── CardLabel_container__xxxxx (Rank, decks)
```

## 価格リンクスタイル

```css
/* CardPrices_prices コンテナ */
display: flex;
justify-content: space-around;

/* 各価格リンク */
color: rgb(23, 99, 181);
font-size: 12.8px;
font-weight: 400;
display: flex;
text-decoration: none;
```

## セレクタ
- 価格エリア: `[class*="CardPrices_prices"]`
- カードコンテナ: `[class*="Card_container"]`
- カード名: `[class*="Card_nameWrapper"]`

## 注意点
- クラス名はNext.js CSS Modulesによりハッシュ付き（`__xxxxx`）
- 部分一致セレクタを使用すること
- SPAのためMutationObserverでDOM変化を監視が必要

---

## Playwright調査結果 (2026-02-05)

### カード名取得方法

価格コンテナ内のCardmarketリンクからカード名を取得可能:

```
CardPrices_prices__xxxxx
├── <a href="...cardmarket.com/...?searchString=Sol+Ring...">
│   └── カード名: "Sol Ring"
├── <a href="...cardkingdom.com/...">
└── <a href="...tcgplayer.com/...">
```

**抽出方法**:
```javascript
const url = new URL(cardmarketLink.href);
const cardName = url.searchParams.get('searchString');
// "Sol+Ring" → decodeURIComponent で "Sol Ring"
```

### ページ内の複数価格コンテナ

1ページ内に複数の `CardPrices_prices` コンテナが存在:

| ページタイプ | コンテナ数 |
|-------------|-----------|
| カード詳細 (`/cards/sol-ring`) | 1 (メインカード) + N (関連カード) |
| 統率者詳細 (`/commanders/the-ur-dragon`) | 1 (統率者) + N (推奨カード) |
| 統率者リスト (`/commanders`) | N (ランキング内カード) |

### 推奨実装パターン

```javascript
// ❌ 従来: 最初の1つのみ
document.querySelector('[class*="CardPrices_prices"]');

// ✅ 推奨: 全てのコンテナを処理
document.querySelectorAll('[class*="CardPrices_prices"]').forEach(container => {
  // 各コンテナにリンクを追加
});
```

### マーキング方式

追加済みコンテナを識別するため、data属性を使用:

```javascript
// リンク追加時
link.setAttribute('data-planarbridge', 'true');

// 追加済みチェック
if (container.querySelector('[data-planarbridge]')) {
  return; // スキップ
}
```
