# テスト観点ドキュメント

このドキュメントでは、edhrec-planarbridgeのテスト戦略とテスト観点について説明します。

## テスト戦略

### ユニットテスト vs E2Eテストの使い分け

| テスト種別 | 対象 | ツール | 特徴 |
| ---------- | ---- | ------ | ---- |
| ユニットテスト | 純粋関数、ビジネスロジック | Vitest | 高速、独立、モック可能 |
| E2Eテスト | Content Script全体、DOM操作 | Playwright | 実際のブラウザ環境、拡張機能動作確認 |

### カバレッジ目標

- **ユニットテスト**: 80%以上（lib/, hooks/ ディレクトリ）
- **E2Eテスト**: 主要なユースケースをカバー

### 現在のカバレッジ（2026-02-06）

| ファイル | Stmts | Branch | Funcs | Lines |
| -------- | ----- | ------ | ----- | ----- |
| hooks/useUrlChange.ts | 100% | 100% | 100% | 100% |
| lib/shops.ts | 100% | 100% | 100% | 100% |
| lib/url-utils.ts | 100% | 100% | 100% | 100% |
| **全体** | **100%** | **100%** | **100%** | **100%** |

## テスト対象ファイルと優先度

| 優先度 | ファイル | テスト容易性 | 理由 |
| ------ | -------- | ------------ | ---- |
| 高 | `lib/url-utils.ts` | 容易 | 純粋関数、ビジネスロジック中核 |
| 高 | `lib/shops.ts` | 容易 | 純粋関数、設定管理 |
| 中 | `hooks/useUrlChange.ts` | 中程度 | setupUrlChangeListenerは純粋関数 |
| 低 | `stores/settings.ts` | 困難 | WXT storage API依存 |
| 低 | `entrypoints/content.tsx` | 困難 | DOM依存、E2E推奨 |

## テスト観点一覧

### 1. URL解析ロジック（`lib/url-utils.ts`）

| 関数 | テスト観点 |
| ---- | ---------- |
| `isCardPage` | カードページ/統率者ページの判定、無効なURL |
| `extractSlugFromUrl` | slug抽出、クエリパラメータ除去 |
| `slugToCardName` | ハイフン→スペース変換、大文字化 |
| `getCardNameFromUrl` | カードページからカード名取得 |

### 2. ショップ設定管理（`lib/shops.ts`）

| 関数 | テスト観点 |
| ---- | ---------- |
| `getShop` | ショップ情報取得 |
| `isValidShopId` | ショップID検証 |
| `getAllShopIds` | 全ショップID取得 |
| `buildUrl` | 検索URL生成、特殊文字エンコード |

### 3. SPA対応（`hooks/useUrlChange.ts`）

| 関数 | テスト観点 |
| ---- | ---------- |
| `useUrlChange` (React Hook) | 初回コールバック、popstate監視、pushState/replaceStateオーバーライド、アンマウント時クリーンアップ、コールバック参照更新 |
| `setupUrlChangeListener` | 初回コールバック、popstate監視、pushState/replaceStateオーバーライド、クリーンアップ、複数リスナー管理 |

### 4. DOM操作（E2Eテスト）

| テストケース | 観点 |
| ------------ | ---- |
| カード詳細ページ | 晴れる屋リンク表示、正しいカード名のURL |
| 統率者ページ | 晴れる屋リンク表示 |
| カードリストページ | 複数リンク表示 |
| SPA遷移 | 遷移後のリンク更新、前のカード名が残らない |
| リンククリック | 新しいタブで晴れる屋の検索ページが開く |
| セキュリティ属性 | `target="_blank"` と `rel="noopener noreferrer"` |
| 重複防止 | 同じコンテナに重複リンクなし |

## テスト実行方法

### ユニットテスト

```bash
# 監視モードで実行（開発中）
pnpm test

# 一回だけ実行
pnpm test:run

# カバレッジレポート付きで実行
pnpm test:coverage

# UIモードで実行（ブラウザで確認）
pnpm test:ui
```

### E2Eテスト

```bash
# 拡張機能をビルドしてE2Eテスト実行
pnpm build && pnpm test:e2e

# UIモードで実行
pnpm build && npx playwright test --ui

# 特定のテストファイルのみ実行
pnpm build && npx playwright test e2e/content-script.spec.ts
```

### カバレッジレポートの確認

```bash
# カバレッジレポート生成
pnpm test:coverage

# HTMLレポートを開く
open coverage/index.html
```

## モック方針

### WXT Storage APIのモック

`stores/settings.ts`はWXTの`storage` APIに依存しているため、テストにはモックが必要です：

```typescript
import { vi } from 'vitest';

vi.mock('wxt/utils/storage', () => ({
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));
```

### DOM環境のセットアップ

Vitestではjsdomを使用してDOM環境をシミュレートします：

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

### history APIのモック

`useUrlChange`のテストでは、historyオブジェクトのオーバーライドを適切に管理する必要があります：

```typescript
beforeEach(() => {
  originalPushState = history.pushState;
  originalReplaceState = history.replaceState;
});

afterEach(() => {
  history.pushState = originalPushState;
  history.replaceState = originalReplaceState;
});
```

## ファイル構成

```text
/
├── lib/
│   ├── url-utils.ts
│   ├── url-utils.test.ts    # URL解析テスト
│   ├── shops.ts
│   └── shops.test.ts        # ショップ設定テスト
├── hooks/
│   ├── useUrlChange.ts
│   └── useUrlChange.test.ts # URL変更監視テスト
├── e2e/
│   ├── fixtures.ts           # Playwrightカスタムfixture（拡張機能ロード）
│   └── content-script.spec.ts # E2Eテスト
├── vitest.config.ts          # Vitest設定
└── playwright.config.ts      # Playwright設定
```

## CI/CD統合

GitHub Actionsでのテスト実行例：

```yaml
- name: Run unit tests
  run: pnpm test:run

- name: Run unit tests with coverage
  run: pnpm test:coverage

- name: Build extension
  run: pnpm build

- name: Run E2E tests
  run: pnpm test:e2e
```

## トラブルシューティング

### ユニットテストが失敗する場合

1. 依存関係が正しくインストールされているか確認：`pnpm install`
2. jsdom環境が正しく設定されているか確認：`vitest.config.ts`

### E2Eテストが失敗する場合

1. 拡張機能がビルドされているか確認：`pnpm build`
2. ビルド出力が `output/chrome-mv3` に存在するか確認
3. ブラウザがインストールされているか確認：`npx playwright install chromium`
4. E2Eテストは `headless: false` で実行される（Chrome拡張機能の制約）
5. タイムアウト値を調整する必要があるかもしれません

### Chrome拡張機能のE2Eテストについて

Chrome拡張機能をテストするには、`chromium.launchPersistentContext()` を使用する必要があります。
`e2e/fixtures.ts` でカスタムfixtureを定義し、拡張機能を正しくロードしています。

```typescript
// e2e/fixtures.ts
const pathToExtension = path.join(process.cwd(), 'output/chrome-mv3');
const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
  ],
});
```

### カバレッジが低い場合

1. テストケースを追加する
2. カバレッジレポートを確認して未テストの分岐を特定する
