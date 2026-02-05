# 晴れる屋 検索API仕様

## 基本情報
- サイト: https://www.hareruyamtg.com/
- 検索URL: https://www.hareruyamtg.com/ja/products/search

## 検索パラメータ

| パラメータ | 説明 | 必須 | 例 |
|-----------|------|------|-----|
| `product` | 商品名/キーワード | ○ | `Sol+Ring` |
| `category` | カテゴリID | × | (空で全商品) |
| `cardset` | セットID | × | (空で全セット) |
| `colorsType` | カラー検索タイプ | × | `0` |
| `cardtypesType` | カードタイプ検索 | × | `0` |
| `stock` | 在庫フィルタ | × | `0`=全て, `1`=在庫有りのみ |

## 正しいURL例
```
https://www.hareruyamtg.com/ja/products/search?product=Sol+Ring
```

## 注意点
- `cardname` パラメータは**無効**（全商品が表示される）
- `product` パラメータを使用すること
- スペースは `+` または `%20` でエンコード
