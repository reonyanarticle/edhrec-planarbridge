---
name: dom-structure-reference
description: EDHREC のカード価格コンテナ、セレクタ、DOM マーキング方式を参照します。DOM 操作の実装時に使用。
user-invocable: false
---

# EDHREC DOM 構造リファレンス

## カードページ URL 形式

- カード: `https://edhrec.com/cards/{slug}`
- 統率者: `https://edhrec.com/commanders/{slug}`

## カード価格コンテナ

セレクタ: `[class*="CardPrices_prices"]`

```text
CardPrices_prices__xxxxx
├── <a href="...cardmarket.com/?searchString=Sol+Ring">Cardmarket</a>
├── <a href="...cardkingdom.com/...">Card Kingdom</a>
└── <a href="...tcgplayer.com/...">TCGPlayer</a>
```

## カード名抽出方法

Cardmarket リンクの `searchString` パラメータからカード名を抽出：

```javascript
const url = new URL(cardmarketLink.href);
const cardName = url.searchParams.get('searchString');
// "Sol+Ring" → decodeURIComponent で "Sol Ring"
```

## ページ内の複数価格コンテナ

| ページタイプ | コンテナ数 |
|-------------|-----------|
| カード詳細 (`/cards/sol-ring`) | 1 (メイン) + N (関連カード) |
| 統率者詳細 (`/commanders/the-ur-dragon`) | 1 (統率者) + N (推奨カード) |
| 統率者リスト (`/commanders`) | N (ランキング内カード) |

## 重複防止マーキング

```javascript
// リンク追加時
link.setAttribute('data-planarbridge', 'true');

// 追加済みチェック
if (container.querySelector('[data-planarbridge]')) {
  return; // スキップ
}
```

## 主要セレクタ一覧

| 要素 | セレクタ |
| ---- | -------- |
| 価格エリア | `[class*="CardPrices_prices"]` |
| カードコンテナ | `[class*="Card_container"]` |
| カード画像 | `[class*="CardImage_container"]` |
| 外部リンク | `[class*="OutboundBar_container"]` |

## 注意点

- クラス名は Next.js CSS Modules によりハッシュ付き（`__xxxxx`）
- 部分一致セレクタ `[class*="..."]` を使用すること
- SPA のため MutationObserver で DOM 変化を監視が必要

詳細は `docs/edhrec.md` を参照。
