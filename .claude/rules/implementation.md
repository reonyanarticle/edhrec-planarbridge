---
paths:
  - "entrypoints/content.tsx"
  - "entrypoints/**/*.ts"
---

# Content Script 実装パターン

## SPA 対応

EDHREC は SPA のため、`MutationObserver` で DOM 変化を監視：

```typescript
const observer = new MutationObserver(() => {
  // デバウンス（300ms）で連続したDOM変更をまとめて処理
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    injectShopLinksToAllContainers();
  }, 300);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
```

## 重複防止

`data-planarbridge` 属性でリンク追加済みのコンテナをマーキング：

```typescript
// リンク追加時
link.setAttribute('data-planarbridge', 'true');

// 追加済みチェック
if (container.querySelector('[data-planarbridge]')) {
  return; // スキップ
}
```

## 既存サイトへの配慮

- EDHREC のアフィリエイトリンク（Card Kingdom, TCGPlayer）は置換しない
- 新しいリンクを**追加**する形で実装
- 既存のスタイルに合わせたデザイン

## セレクタの注意点

- クラス名は Next.js CSS Modules によりハッシュ付き（`__xxxxx`）
- 部分一致セレクタ `[class*="..."]` を使用
