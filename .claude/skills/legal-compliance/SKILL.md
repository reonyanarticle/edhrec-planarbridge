---
name: legal-compliance
description: EDHREC・晴れる屋の利用規約および robots.txt に対する拡張機能の法的コンプライアンス分析。新機能やショップ追加時の適合性確認に使用。
user-invocable: false
---

# 法的コンプライアンス分析

## 分析対象サイト

| サイト | 利用規約 URL | robots.txt URL | 最終確認日 |
|--------|-------------|----------------|-----------|
| EDHREC | https://edhrec.com/terms | https://edhrec.com/robots.txt | 2026-02-09 |
| 晴れる屋 | https://www.hareruyamtg.com/en/user_data/rules | https://www.hareruyamtg.com/robots.txt | 2026-02-09 |

---

## EDHREC 利用規約分析

### 関連する禁止事項と適合性評価

#### 1. 自動化ツールの禁止

> "software or automated agents or scripts to produce multiple accounts on the Site, or to generate automated searches, requests, or queries"

**評価: 適合** — 本拡張機能はアカウント作成・自動検索・自動リクエストを一切行わない。ブラウザ上で既に読み込まれた DOM を読み取るのみ。

#### 2. 過度な負荷の禁止

> "interfere with, disrupt, or create an undue burden on servers or networks connected to the Site"

**評価: 適合** — Content Script はクライアントサイドで動作し、EDHREC サーバーへの追加リクエストは発生しない。

#### 3. 派生物作成の禁止

> "derivative works, disassemble, reverse compile or reverse engineer any part of the Site"

**評価: 適合** — 拡張機能は EDHREC のコンテンツを複製・改変せず、既存ページにリンクを追加するのみ。EDHREC の既存アフィリエイトリンク（Card Kingdom, TCGPlayer）は一切変更しない。

---

## 晴れる屋利用規約分析

### 関連する禁止事項と適合性評価

#### 1. コンテンツの無断複製・配布

> "Unauthorized reproduction and distribution of contents in our emails and our website"

**評価: 適合** — 拡張機能は晴れる屋のコンテンツを複製・配布しない。検索 URL へのリンクを生成するのみ。

#### 2. サイト運営の妨害

> "Preventing operation of Hareruya, or damaging our reputation"

**評価: 適合** — 拡張機能は晴れる屋に直接アクセスせず、ユーザーがクリックした場合のみ通常のブラウザナビゲーションで晴れる屋にアクセスする。サーバーへの自動リクエストは発生しない。

#### 3. 有害プログラムの送信

> "Transmitting harmful computer programs such as computer virus"

**評価: 適合** — 拡張機能はマルウェアではなく、ブラウザの拡張機能 API を通じて正規にインストールされるユーティリティ。

---

## robots.txt 適合性

### EDHREC（2026-02-09 確認）

```
User-agent: *
Disallow: /articles/preview/
Disallow: /articles/search/
Disallow: /deckpreview/
```

**評価:**
- 拡張機能がアクセスする `/cards/` および `/commanders/` パスは禁止されていない
- Crawl-delay の指定なし
- 拡張機能はクローラーではなく、DOM を読み取る Content Script であるため robots.txt の直接的な対象外

### 晴れる屋（2026-02-09 確認）

```
User-agent: *
Allow: /
Disallow: /news/
Disallow: /jp/k/
Disallow: /index.php/
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
```

**評価:**
- 拡張機能が生成するリンク `https://www.hareruyamtg.com/ja/products/search?product=カード名` は禁止パターンに該当しない
  - `?*page=*`, `?*sort=*`, `?*order=*` パラメータのみ禁止
  - `?product=` パラメータは禁止されていない
- 拡張機能はクローラーではないため robots.txt の直接的な対象外
- ただし晴れる屋は負荷に敏感（bingbot: 30s, SemrushBot: 120s の Crawl-delay 設定あり）

---

## リスク評価マトリックス

影響度（1-5）× 発生確率（1-5）で評価：

| リスク項目 | 影響度 | 発生確率 | スコア | 評価 |
|-----------|--------|---------|--------|------|
| EDHREC 利用規約違反 | 3 | 1 | 3 | 極低リスク |
| 晴れる屋利用規約違反 | 2 | 1 | 2 | 極低リスク |
| EDHREC robots.txt 違反 | 2 | 1 | 2 | 極低リスク |
| 晴れる屋 robots.txt 違反 | 2 | 1 | 2 | 極低リスク |
| 晴れる屋サーバー過負荷 | 4 | 1 | 4 | 低リスク |
| EDHREC DOM 変更による機能停止 | 2 | 3 | 6 | 中リスク |

**総合評価: 低リスク** — 拡張機能の動作は両サイトの利用規約・robots.txt に適合している。

---

## 技術的安全策

### 1. 最小権限の原則

- Content Script は `edhrec.com` ドメインのみで実行
- 晴れる屋へのネットワークリクエストは発生しない
- `host_permissions` は必要最小限に設定

### 2. サーバー負荷ゼロ

- 拡張機能はクライアントサイドのみで動作
- EDHREC: 既に読み込まれた DOM からカード名を抽出（追加リクエストなし）
- 晴れる屋: リンク URL を文字列として生成するのみ（アクセスはユーザーのクリックに依存）

### 3. データ保護

- ユーザーデータの収集・送信は一切行わない
- 設定はローカルストレージ（`browser.storage.local`）にのみ保存

### 4. 既存サイトの尊重

- EDHREC の既存アフィリエイトリンク（Card Kingdom, TCGPlayer, Cardmarket）は変更・削除しない
- リンクは追加のみで、既存要素の改変は最小限に留める

---

## 今後の注意事項

### 定期確認チェックリスト

- [ ] EDHREC 利用規約の変更確認（半年ごと）
- [ ] 晴れる屋利用規約の変更確認（半年ごと）
- [ ] 両サイトの robots.txt 変更確認（半年ごと）
- [ ] EDHREC DOM 構造の変更確認（拡張機能の動作不良時）

### 新機能追加時の確認事項

- 新しい外部サイトへのリクエストが発生しないか
- EDHREC の既存機能を阻害しないか
- ユーザーデータの新たな収集が発生しないか

### 新ショップ追加時の確認事項

- 対象ショップの利用規約を確認
- 対象ショップの robots.txt を確認
- 生成する検索 URL が robots.txt の禁止パターンに該当しないか確認
- 利用規約で外部サイトからのリンクが禁止されていないか確認

---

## 法的免責事項

本分析は 2026-02-09 時点の情報に基づく技術的評価であり、法的助言ではありません。各サイトの利用規約は予告なく変更される可能性があります。拡張機能の公開・配布にあたっては、最新の利用規約を確認してください。
