---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "e2e/**/*"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# テスト規約

## テスト戦略

| テスト種別 | 対象 | ツール |
| ---------- | ---- | ------ |
| ユニットテスト | 純粋関数、ビジネスロジック | Vitest |
| E2E テスト | Content Script、DOM 操作 | Playwright |

## カバレッジ目標

- ユニットテスト: 80% 以上（lib/, hooks/）
- E2E テスト: 主要なユースケースをカバー

## E2E テストのモック方針

外部サイトへの負荷を避けるため、ローカルモック HTML を使用：

- `e2e/mocks/` にモック HTML を配置
- 実サイトにはアクセスしない
- 詳細は `docs/external-site-policy.md` を参照

## ファイル命名規則

- ユニットテスト: `*.test.ts`
- E2E テスト: `*.spec.ts`
- テストは対象ファイルと同じディレクトリに配置

## モック方針

- WXT Storage API: vi.mock でモック化
- DOM 環境: jsdom（Vitest）
- history API: beforeEach/afterEach でオーバーライド管理
