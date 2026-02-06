import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright E2Eテスト設定
 *
 * 外部サイトへの負荷を避けるため、テストはローカルモックHTMLを使用します。
 * 詳細: docs/external-site-policy.md
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 拡張機能テストは並列実行しない
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 拡張機能テストは1ワーカーのみ
  reporter: 'html',
  use: {
    // baseURLを設定しない（ローカルファイルを使用するため）
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless: false, // 拡張機能はheadlessモードでは動作しない
          args: [
            `--disable-extensions-except=${path.join(process.cwd(), 'output/chrome-mv3')}`,
            `--load-extension=${path.join(process.cwd(), 'output/chrome-mv3')}`,
            '--allow-file-access-from-files',
          ],
        },
      },
    },
  ],
});
