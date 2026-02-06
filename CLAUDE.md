# CLAUDE.md - edhrec-planarbridge

WXT + React + TypeScript を使った EDHREC ブラウザ拡張機能。
EDHRECのカードページに日本のMTGショップ（晴れる屋）へのリンクを追加する。

## 開発コマンド

```bash
pnpm dev              # 開発サーバー（Chrome）
pnpm build            # ビルド（Chrome）
pnpm test             # ユニットテスト（監視モード）
pnpm test:run         # ユニットテスト（一回実行）
pnpm build && pnpm test:e2e  # E2Eテスト
pnpm typecheck        # 型チェック
pnpm lint             # ESLint
```

## 技術スタック

- **フレームワーク**: WXT (https://wxt.dev)
- **UI**: React 19 + Tailwind CSS
- **言語**: TypeScript
- **テスト**: Vitest + Playwright

## コア設計

### カード名抽出

価格コンテナ内の Cardmarket リンクから `searchString` パラメータを抽出：

```
CardPrices_prices → a[href*="cardmarket.com"] → searchString=Sol+Ring → "Sol Ring"
```

### 主要ファイル

| ファイル | 責務 |
|----------|------|
| `entrypoints/content.tsx` | DOM監視、カード名抽出、リンク注入 |
| `lib/shops.ts` | ショップ設定、URL生成 |
| `stores/settings.ts` | ユーザー設定 |

## 実装のポイント

1. **SPA対応**: `MutationObserver` でDOM変化を監視（デバウンス300ms）
2. **重複防止**: `data-planarbridge` 属性でマーキング
3. **既存サイト配慮**: アフィリエイトリンクは置換せず追加

## テスト用URL

- カード: `https://edhrec.com/cards/sol-ring`
- 統率者: `https://edhrec.com/commanders/the-ur-dragon`

## 詳細ドキュメント

- `.claude/rules/` - コーディング規約、実装パターン、テスト規約
- `.claude/skills/` - DOM構造、API仕様、テストガイド（参照用）
- `docs/` - 詳細な技術仕様書
