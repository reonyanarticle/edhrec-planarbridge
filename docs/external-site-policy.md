# 外部サイトアクセスポリシー

このドキュメントでは、テスト実行時の外部サイトへのアクセス方針を定義します。

## robots.txt 調査結果（2026-02-06）

### EDHREC (`https://edhrec.com/robots.txt`)

```
User-agent: *
Disallow: /articles/preview/
Disallow: /articles/search/
Disallow: /deckpreview/
```

**評価:**
- `/cards/` と `/commanders/` は禁止されていない
- Crawl-delay の指定なし
- ただし、これはクローラー向けの設定であり、テスト自動化を明示的に許可しているわけではない

### 晴れる屋 (`https://www.hareruyamtg.com/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /news/
Disallow: /en/
Disallow: /zh-cn/
Disallow: /search_result.html
Disallow: /download/
Disallow: /*.csv

User-agent: bingbot
Crawl-delay: 30

User-agent: SemrushBot
Crawl-delay: 120
```

**評価:**
- `/search_result.html` は禁止されているが、E2E テストでアクセスする `/ja/products/search` は異なるパス
- Bingbot には 30 秒の Crawl-delay → サイトは負荷に敏感な可能性
- `/ja/products/search` は明示的に禁止されていない

---

## テスト方針

### ユニットテスト（Vitest）

**外部サイトへの負荷: なし**

- jsdom 環境で完全にローカル実行
- ネットワークアクセスは一切発生しない
- 何度実行しても問題なし

### E2E テスト（Playwright）

**外部サイトへの負荷: なし（モック化済み）**

E2E テストは以下の理由からローカルモック HTML を使用します：

1. **外部サイトへの負荷回避** - 実サイトにアクセスしないため、負荷をかけない
2. **テストの安定性** - サイト側の変更や一時的な障害の影響を受けない
3. **オフライン実行可能** - ネットワーク接続なしでテスト可能
4. **高速実行** - ネットワーク待機時間がない
5. **CI/CD 対応** - 自動テストを安全に実行可能

### モック HTML の構造

`e2e/mocks/` ディレクトリに以下のモック HTML を用意：

| ファイル | 用途 |
|---------|------|
| `card-page.html` | カード詳細ページ（Sol Ring） |
| `commander-page.html` | 統率者ページ（The Ur-Dragon） |
| `card-list-page.html` | カードリストページ（複数カード） |

各モック HTML には以下の要素が含まれます：

```html
<!-- 価格コンテナ（セレクタ: [class*="CardPrices_prices"]） -->
<div class="CardPrices_prices__mock">
  <!-- Cardmarket リンク（カード名抽出用） -->
  <a href="https://www.cardmarket.com/...?searchString=Card+Name">Cardmarket</a>
</div>
```

---

## 注意事項

### 実サイトでのテストが必要な場合

実サイトの DOM 構造変更を検知するため、定期的に手動で実サイトにアクセスして確認することを推奨します。

実サイトテストを行う場合の注意点：
- 1 日数回程度の実行に留める
- CI/CD での自動実行は避ける
- アクセス間隔を適切に設ける

### モック HTML のメンテナンス

EDHREC の DOM 構造が変更された場合、モック HTML も更新が必要です。
実サイトの変更を検知した場合は、`e2e/mocks/` 内のファイルを更新してください。
