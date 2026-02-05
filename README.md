# edhrec-planarbridge

EDHRECのカードページに日本のMTGショップ（晴れる屋）へのリンクを追加するブラウザ拡張機能です。

## 機能

- EDHRECのカード価格エリアに「晴れる屋」への検索リンクを追加
- カード詳細ページ、統率者ページ、カードリストページに対応
- SPAナビゲーションに対応（ページ遷移しても正しく動作）

## 対応ブラウザ

- Chrome
- Firefox
- Safari（iOS含む）

## インストール

### Chrome

1. このリポジトリをクローン
2. 依存関係をインストール: `pnpm install`
3. ビルド: `pnpm build`
4. Chrome で `chrome://extensions` を開く
5. 「デベロッパーモード」を有効化
6. 「パッケージ化されていない拡張機能を読み込む」をクリック
7. `.output/chrome-mv3` フォルダを選択

### Firefox

1. ビルド: `pnpm build --browser firefox`
2. Firefox で `about:debugging#/runtime/this-firefox` を開く
3. 「一時的なアドオンを読み込む」をクリック
4. `.output/firefox-mv3/manifest.json` を選択

### Safari

1. ビルド: `pnpm build --browser safari`
2. Xcode でプロジェクト生成:
   ```bash
   xcrun safari-web-extension-converter .output/safari-mv3
   ```
3. Xcode でビルド・実行

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
# 依存関係のインストール
pnpm install

# 開発サーバー起動（HMR対応）
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm typecheck
```

## 技術スタック

- [WXT](https://wxt.dev) - ブラウザ拡張機能フレームワーク
- React 19
- TypeScript
- Tailwind CSS

## ライセンス

MIT
