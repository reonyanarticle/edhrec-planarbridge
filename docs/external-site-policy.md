# 外部サイトアクセスポリシー

このドキュメントでは、テスト実行時の外部サイトへのアクセス方針を定義します。

## robots.txt 調査結果（2026-02-09）

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

**利用規約:** https://edhrec.com/terms

### 晴れる屋 (`https://www.hareruyamtg.com/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /news/
Disallow: /jp/k/
Disallow: /index.php/
Disallow: /a/*
Disallow: /ja/forward/
Disallow: /en/forward/
Disallow: /ja/purchase/forward/
Disallow: /en/purchase/forward/
Disallow: /ja/events/*/*/
Disallow: /purchase/g/*
Disallow: /*.csv$
Disallow: /en/deck/download/*
Disallow: /ja/deck/download/*
Disallow: /ja/deck/bulk/*
Disallow: /en/deck/bulk/*
Disallow: /ja/deck/result?*
Disallow: /en/deck/result?*
Disallow: /ja/events/list?*page=*
Disallow: /en/events/list?*page=*
Disallow: /ja/products/search?*page=*
Disallow: /ja/products/search?*sort=*
Disallow: /ja/products/search?*order=*
Disallow: /en/products/search?*page=*
Disallow: /en/products/search?*sort=*
Disallow: /en/products/search?*order=*
Disallow: /ja/purchase/search?*page=*
Disallow: /ja/purchase/search?*sort=*
Disallow: /ja/purchase/search?*order=*
Disallow: /en/purchase/search?*page=*
Disallow: /en/purchase/search?*sort=*
Disallow: /en/purchase/search?*order=*

User-agent: bingbot
Crawl-Delay: 30

User-agent: msnbot
Crawl-Delay: 30

User-agent: AhrefsBot
Crawl-Delay: 60

User-agent: SemrushBot
Crawl-Delay: 120
```

**評価:**
- 検索ページのページネーション・ソート・並び順パラメータが明示的に禁止: `?*page=*`, `?*sort=*`, `?*order=*`
- 拡張機能が生成する `?product=カード名` パラメータは禁止パターンに該当しない
- 複数のボットに対して Crawl-delay を設定（30〜120秒）→ サイトは負荷に敏感
- `/ja/products/search?product=...` は明示的に禁止されていない

**利用規約:** https://www.hareruyamtg.com/en/user_data/rules

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
