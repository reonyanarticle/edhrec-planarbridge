---
paths:
  - "entrypoints/**/*.ts"
  - "entrypoints/**/*.tsx"
  - "lib/**/*.ts"
  - "hooks/**/*.ts"
  - "stores/**/*.ts"
  - "components/**/*.tsx"
---

# TypeScript/React コードスタイル

## 型アノテーション

- 関数の戻り値は明示的に型指定（推論に頼らない）
- 関数の引数は全て型指定
- `any` 禁止（`unknown` を使用）
- React コンポーネントの props は interface で定義

## 関数の長さ

- 最大 30 行以下
- 複数の責務を持つ場合は分割

## React Hooks

- 依存配列を明示的に記述
- `useCallback` で参照を安定化
- カスタムフックは `use` プレフィックス

## インポート順序

1. React/外部ライブラリ
2. プロジェクト内モジュール（@/〜）
3. 相対パス

## コメント

- JSDoc 形式で関数のドキュメント
- 複雑なロジックには理由を説明するコメント
- TODO コメントには担当者と期限を記載
