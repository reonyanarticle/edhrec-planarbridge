---
name: shop-api-reference
description: 晴れる屋の検索 API パラメータ、URL フォーマット、注意点を参照します。ショップリンク生成時に使用。
user-invocable: false
---

# 晴れる屋 検索 API リファレンス

## 基本情報

- サイト: https://www.hareruyamtg.com/
- 検索 URL: https://www.hareruyamtg.com/ja/products/search

## 検索パラメータ

| パラメータ | 説明 | 必須 | 例 |
|-----------|------|------|-----|
| `product` | 商品名/キーワード | ○ | `Sol+Ring` |
| `category` | カテゴリ ID | × | (空で全商品) |
| `cardset` | セット ID | × | (空で全セット) |
| `stock` | 在庫フィルタ | × | `0`=全て, `1`=在庫有りのみ |

## 正しい URL 例

```
https://www.hareruyamtg.com/ja/products/search?product=Sol+Ring
https://www.hareruyamtg.com/ja/products/search?product=The%20Ur-Dragon
```

## 注意点

- `cardname` パラメータは**無効**（全商品が表示される）
- 必ず `product` パラメータを使用すること
- スペースは `+` または `%20` でエンコード
- 日本語カード名でも英語名で検索可能

## URL 生成コード

```typescript
const buildUrl = (cardName: string) =>
  `https://www.hareruyamtg.com/ja/products/search?product=${encodeURIComponent(cardName)}`;
```

詳細は `docs/hareruya.md` を参照。
