# CLAUDE.md - edhrec-planarbridge

このリポジトリは、EDHRECのカードページに日本のMTGショップへのリンクを追加するブラウザ拡張機能です。


## プロジェクト概要

- **目的**: EDHRECでカードを閲覧中に、日本のショップで同じカードを検索できるリンクを追加
- **対応ブラウザ**: Chrome / Firefox / Safari (iOS含む)
- **フレームワーク**: WXT + React + TypeScript

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | WXT (https://wxt.dev) |
| UI | React 19 + Tailwind CSS |
| 言語 | TypeScript |
| 状態管理 | Zustand |
| ビルド | Vite (WXT内蔵) |
| パッケージマネージャ | pnpm |

## ディレクトリ構成

```
/
├── entrypoints/           # WXTエントリポイント
│   ├── content.tsx        # Content Script（EDHRECページに注入）
│   ├── popup/             # 設定画面
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   └── background.ts      # Service Worker（必要に応じて）
│
├── components/            # Reactコンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ関数
├── stores/                # Zustand ストア
├── assets/                # アイコン等の静的ファイル
│
├── wxt.config.ts          # WXT設定
├── tailwind.config.js     # Tailwind設定
└── tsconfig.json          # TypeScript設定
```

## 開発コマンド

```bash
# 開発サーバー起動（HMR対応）
pnpm dev

# 特定ブラウザ向け開発
pnpm dev:firefox
pnpm dev:safari

# ビルド
pnpm build                    # Chrome (デフォルト)
pnpm build --browser firefox
pnpm build --browser safari

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

## コア設計

### カード名抽出ロジック（DOMベース）

価格コンテナ内のCardmarketリンクからカード名を抽出し、ショップの検索URLを生成する：

```
CardPrices_prices コンテナ
├── <a href="...cardmarket.com/...?searchString=Sol+Ring...">
│                                              ~~~~~~~~~
│                                              このパラメータを抽出
│                                                   ↓
│                              cardName: "Sol Ring"
│                                                   ↓
│              Shop URL: https://www.hareruyamtg.com/ja/products/search?product=Sol%20Ring
├── <a href="...cardkingdom.com/...">
└── <a href="...tcgplayer.com/...">
```

**利点**:
- URLのslugからの変換よりも正確（アポストロフィ、コンマ等が保持される）
- 複数カードが表示されるページ（リスト、統率者ページ）でも各カードに対応可能

### 主要ファイルの責務

| ファイル | 責務 |
|----------|------|
| `entrypoints/content.tsx` | DOM監視、カード名抽出、リンク注入 |
| `lib/shops.ts` | ショップ設定、URL生成 |
| `stores/settings.ts` | ユーザー設定（有効/無効、ショップ選択等） |
| `lib/url-utils.ts` | URL解析ユーティリティ（レガシー） |
| `hooks/useUrlChange.ts` | URL変更監視（レガシー） |

## 実装時の注意点

### 1. SPA対応

EDHRECはSPAのため、`MutationObserver` でDOM変化を監視：

```typescript
const observer = new MutationObserver(() => {
  // デバウンス（300ms）で連続したDOM変更をまとめて処理
  debounceTimer = setTimeout(() => {
    injectShopLinksToAllContainers();
  }, 300);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

### 2. 重複防止

`data-planarbridge` 属性でリンク追加済みのコンテナをマーキング：

```typescript
// リンク追加時
link.setAttribute('data-planarbridge', 'true');

// 追加済みチェック
if (container.querySelector('[data-planarbridge]')) {
  return; // スキップ
}
```

### 3. 既存サイトへの配慮

EDHRECのアフィリエイトリンク（Card Kingdom, TCGPlayer）は置換せず、
新しいリンクを**追加**する形で実装する。

### 4. Content Scriptのスタイル分離

Tailwindのスタイルがホストページに影響しないよう、
Shadow DOM または CSS スコープを検討する。

## ショップ設定

将来的に複数ショップ対応を想定した設計：

```typescript
// lib/shops.ts
export const SHOPS = {
  hareruya: {
    name: '晴れる屋',
    baseUrl: 'https://www.hareruyamtg.com/ja/products/search',
    buildUrl: (cardName: string) => `${baseUrl}?cardname=${encodeURIComponent(cardName)}`,
  },
  // 将来的に追加可能
  // cardshopSerra: { ... },
  // bigmagic: { ... },
} as const;
```

## テスト用URL

開発中に動作確認で使用：

- カードページ: `https://edhrec.com/cards/sol-ring`
- 統率者ページ: `https://edhrec.com/commanders/korvold-fae-cursed-king`
- 両面カード: `https://edhrec.com/cards/fable-of-the-mirror-breaker-reflection-of-kiki-jiki`

## EDHREC DOM構造（Playwright調査結果 2026-02-05）

### カードページの主要構造

```text
DIV.Panels_row__GFZm_
└── DIV.Panels_rowGroup__0xwUE
    └── DIV.CardPanel_container__xP8qy
        └── DIV.Card_container__Ng56K
            └── DIV.lazyload-wrapper
                ├── DIV.Card_cardButtons___z_OI    ← カードボタン
                ├── DIV.CardImage_container__4_PKo ← カード画像
                └── DIV.CardPrices_prices__ziHc_   ← 価格エリア（TCGPlayer, Card Kingdom）
```

### OutboundBar（外部リンクエリア）

```text
DIV.BottomPanel_containerInner__X_CRo
└── DIV.OutboundBar_container__yeSwo
    └── DIV.OutboundBar_button__72Z9u × 6
        ├── Cardsphere
        ├── Archidekt
        ├── Commander Spellbook
        ├── Moxfield
        ├── Scryfall
        └── MTGStocks
```

### 主要セレクタ

| 要素 | セレクタ | 用途 |
| ---- | -------- | ---- |
| カード画像 | `[class*="CardImage_container"]` | 画像表示エリア |
| 価格エリア | `[class*="CardPrices_prices"]` | TCGPlayer/CK価格 |
| 外部リンク | `[class*="OutboundBar_container"]` | Scryfall等のリンク |
| TCGPlayerリンク | `a[href*="tcgplayer"]` | アフィリエイトリンク |
| Card Kingdomリンク | `a[href*="cardkingdom"]` | アフィリエイトリンク |
| Scryfallリンク | `a[href*="scryfall"]` | カード情報リンク |

### 推奨挿入位置

**第1候補: `CardPrices_prices` の後**

- 価格エリアの直後に配置
- ユーザーが価格を見る流れで自然に目に入る
- セレクタ: `[class*="CardPrices_prices"]`

**第2候補: `OutboundBar_container` の後**

- 外部リンクエリアの末尾に追加
- 他のショップリンクと同じ文脈
- セレクタ: `[class*="OutboundBar_container"]`

### 注意点

- クラス名はNext.jsのCSS Modulesによりハッシュ付き（`__xxxxx`）
- 部分一致セレクタ `[class*="..."]` を使用する必要あり
- SPAのためDOM変化を `MutationObserver` で監視が必要

## Safari対応

WXTでビルド後、Xcodeでプロジェクト生成：

```bash
pnpm build --browser safari
xcrun safari-web-extension-converter .output/safari-mv3
```

iOS対応にはApple Developer アカウントが必要（無料アカウントでTestFlight配布は可能）。

## Playwrightテスト

### テスト方法

Claude Code の Playwright MCP を使用してEDHRECのDOM構造と実装ロジックを検証する。

### カード名抽出ロジックのテスト

以下のJavaScriptをページ上で実行して、カード名抽出が正しく動作するか確認：

```javascript
(() => {
  const priceContainers = document.querySelectorAll('[class*="CardPrices_prices"]');
  const results = [];

  priceContainers.forEach((container, index) => {
    const cardmarketLink = container.querySelector('a[href*="cardmarket.com"]');
    let cardName = null;

    if (cardmarketLink) {
      const href = cardmarketLink.getAttribute('href');
      try {
        const url = new URL(href);
        const searchString = url.searchParams.get('searchString');
        if (searchString) {
          cardName = decodeURIComponent(searchString.replace(/\+/g, ' '));
        }
      } catch (e) {}
    }

    results.push({ index, cardName, hasCardmarketLink: !!cardmarketLink });
  });

  return { totalContainers: priceContainers.length, results };
})();
```

### テスト結果（2026-02-05）

| ページ | URL | 価格コンテナ数 | 抽出結果 |
| ------ | --- | -------------- | -------- |
| カード詳細 | `/cards/sol-ring` | 1 | ✅ "Sol Ring" |
| 統率者詳細 | `/commanders/the-ur-dragon` | 1 | ✅ "The Ur-Dragon" |
| 統率者リスト | `/commanders` | 3 | ✅ "The Ur-Dragon", "Edgar Markov", "Atraxa, Praetors' Voice" |

### SPA遷移テスト

`/commanders` → `/commanders/the-ur-dragon` へのクリック遷移後も、正しく新しいページのカード名（"The Ur-Dragon"）が検出されることを確認。

### テストで確認すべき項目

1. **カード詳細ページ**: メインカードの価格エリアに晴れる屋リンクが表示される
2. **統率者ページ**: 統率者カードの価格エリアに晴れる屋リンクが表示される
3. **カードリストページ**: 各カードの価格エリアに晴れる屋リンクが表示される
4. **SPA遷移**: ページ遷移後に正しいカード名でリンクが更新される
5. **重複防止**: 同じコンテナに複数のリンクが追加されない（`data-planarbridge`属性でマーキング）

## 参考リンク

- [WXT Documentation](https://wxt.dev)
- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
