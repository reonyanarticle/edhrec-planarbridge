---
name: testing-guide
description: このプロジェクトのテスト戦略、テスト対象ファイル、カバレッジ目標を参照します。テスト作成・実行時に使用。
user-invocable: false
---

# テストガイド

## テスト実行コマンド

```bash
# ユニットテスト
pnpm test           # 監視モード
pnpm test:run       # 一回実行
pnpm test:coverage  # カバレッジ付き

# E2E テスト
pnpm build && pnpm test:e2e
```

## テスト対象ファイルと優先度

| 優先度 | ファイル | テスト容易性 |
| ------ | -------- | ------------ |
| 高 | `lib/url-utils.ts` | 容易（純粋関数） |
| 高 | `lib/shops.ts` | 容易（純粋関数） |
| 中 | `hooks/useUrlChange.ts` | 中程度 |
| 低 | `stores/settings.ts` | 困難（WXT 依存） |
| 低 | `entrypoints/content.tsx` | E2E 推奨 |

## E2E テスト観点

| テストケース | 観点 |
| ------------ | ---- |
| カード詳細ページ | 晴れる屋リンク表示、正しい URL |
| 統率者ページ | 晴れる屋リンク表示 |
| カードリストページ | 複数リンク表示 |
| SPA 遷移 | 遷移後のリンク更新 |
| セキュリティ属性 | `target="_blank"` と `rel="noopener noreferrer"` |
| 重複防止 | 同じコンテナに重複リンクなし |

## モック方針

E2E テストは外部サイトにアクセスせず、ローカルモック HTML を使用：

- `e2e/mocks/card-page.html` - カード詳細ページ
- `e2e/mocks/commander-page.html` - 統率者ページ
- `e2e/mocks/card-list-page.html` - カードリストページ

## カバレッジ目標

- ユニットテスト: 80% 以上
- 現在のカバレッジ: 100%

詳細は `docs/testing.md` を参照。
