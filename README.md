# edhrec-planarbridge

EDHRECのカードページに日本のMTGショップ（晴れる屋）へのリンクを追加するブラウザ拡張機能です。

## 機能

- EDHRECのカード価格エリアに「晴れる屋」への検索リンクを追加
- カード詳細ページ、統率者ページ、カードリストページに対応
- SPAナビゲーションに対応（ページ遷移しても正しく動作）

## 対応ブラウザ

- Chrome
- Firefox
- Edge
- Safari（iOS含む）

## ダウンロード & インストール

[GitHub Releases](https://github.com/reonyanarticle/edhrec-planarbridge/releases) から対応ブラウザの zip ファイルをダウンロードしてインストールします。

### Chrome

1. Releases から `edhrec-planarbridge-x.x.x-chrome.zip` をダウンロード
2. zip を解凍
3. Chrome で `chrome://extensions` を開く
4. 「デベロッパーモード」を有効化
5. 「パッケージ化されていない拡張機能を読み込む」→ 解凍したフォルダを選択

### Firefox

1. Releases から `edhrec-planarbridge-x.x.x-firefox.zip` をダウンロード
2. Firefox で `about:addons` を開く
3. 歯車アイコン →「ファイルからアドオンをインストール」→ zip ファイルを選択

> **注意**: 署名なしのアドオンは通常の Firefox ではインストールできません。`about:debugging#/runtime/this-firefox` から「一時的なアドオンを読み込む」で zip を選択してください（ブラウザ再起動で無効になります）。

### Edge

1. Releases から `edhrec-planarbridge-x.x.x-edge.zip` をダウンロード
2. zip を解凍
3. Edge で `edge://extensions` を開く
4. 「開発者モード」を有効化
5. 「展開して読み込み」→ 解凍したフォルダを選択

### Safari (macOS)

Safari は zip 配布に対応していないため、ソースからのビルドが必要です。

1. リポジトリをクローンしてビルド（[開発](#開発)セクション参照）
2. Xcode プロジェクトを生成:
   ```bash
   xcrun safari-web-extension-converter .output/safari-mv3
   ```
3. Xcode でビルド・実行

※ Xcode.app のインストールが必要です。

### Safari (iOS)

- Apple Developer アカウントが必要です
- macOS で Safari 版をビルドし、TestFlight 経由で配布してください

## 使い方

1. 拡張機能をインストール後、EDHRECのカードページにアクセス
2. カードの価格エリア（TCGPlayer, Card Kingdom等の横）に「晴れる屋」リンクが表示される
3. クリックすると晴れる屋の検索結果ページが新しいタブで開く

### 対応ページ

- カード詳細: `https://edhrec.com/cards/sol-ring`
- 統率者詳細: `https://edhrec.com/commanders/the-ur-dragon`
- 統率者リスト: `https://edhrec.com/commanders`

## 開発

```bash
# リポジトリをクローン
git clone https://github.com/reonyanarticle/edhrec-planarbridge.git
cd edhrec-planarbridge

# 依存関係のインストール
pnpm install

# 開発サーバー起動（HMR対応）
pnpm dev          # Chrome
pnpm dev:firefox  # Firefox
pnpm dev:edge     # Edge

# ビルド
pnpm build          # Chrome
pnpm build:firefox  # Firefox
pnpm build:edge     # Edge

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

## テスト

```bash
# ユニットテスト（監視モード）
pnpm test

# ユニットテスト（一回実行）
pnpm test:run

# カバレッジ付きテスト
pnpm test:coverage

# E2Eテスト（要事前ビルド）
pnpm build && pnpm test:e2e
```

## 技術スタック

- [WXT](https://wxt.dev) - ブラウザ拡張機能フレームワーク
- React 19
- TypeScript
- Tailwind CSS
- Vitest - ユニットテスト
- Playwright - E2Eテスト

## ライセンス

MIT
