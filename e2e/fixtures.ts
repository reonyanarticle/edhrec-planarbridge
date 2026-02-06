import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * モックHTML用のローカルサーバーを提供するfixture
 *
 * 外部サイト（edhrec.com, hareruyamtg.com）への負荷を避けるため、
 * テストはローカルのモックHTMLを使用します。
 *
 * 詳細: docs/external-site-policy.md
 */
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  mockPage: Page;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(process.cwd(), 'output/chrome-mv3');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        // ローカルファイルへのアクセスを許可
        '--allow-file-access-from-files',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // 拡張機能のIDを取得
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  mockPage: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});

export const expect = test.expect;

/**
 * モックHTMLファイルのパスを取得
 */
export function getMockHtmlPath(filename: string): string {
  return path.join(process.cwd(), 'e2e', 'mocks', filename);
}

/**
 * モックHTMLの内容を取得
 */
export function getMockHtmlContent(filename: string): string {
  const filePath = getMockHtmlPath(filename);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * モックHTMLをページにロードし、Content Scriptを注入
 *
 * Content Scriptは通常、manifest.jsonのmatchesパターンに一致するURLでのみ動作します。
 * ローカルHTMLファイルでは動作しないため、Content Scriptの主要ロジックを
 * ページ内で直接実行します。
 */
export async function loadMockPageWithContentScript(
  page: Page,
  mockHtmlFilename: string,
  _extensionId: string
): Promise<void> {
  const htmlPath = getMockHtmlPath(mockHtmlFilename);
  await page.goto(`file://${htmlPath}`);

  // 拡張機能のContent Scriptロジックを直接注入
  // （manifest.jsonのmatchesがedhrec.comのみのため、ローカルファイルでは動作しない）
  await injectContentScriptLogic(page);
}

/**
 * Content Scriptの主要ロジックを直接ページに注入
 *
 * lib/shops.ts と entrypoints/content.tsx の主要ロジックを
 * テスト用にインライン化したものです。
 */
async function injectContentScriptLogic(page: Page): Promise<void> {
  await page.evaluate(() => {
    const MARKER_ATTR = 'data-planarbridge';

    // ショップ設定（lib/shops.ts からインライン化）
    const shop = {
      name: '晴れる屋',
      baseUrl: 'https://www.hareruyamtg.com/ja/products/search',
      buildUrl: (cardName: string) =>
        `https://www.hareruyamtg.com/ja/products/search?product=${encodeURIComponent(cardName)}`,
    };

    function extractCardNameFromCardmarketUrl(url: string): string | null {
      try {
        const urlObj = new URL(url);
        const searchString = urlObj.searchParams.get('searchString');
        if (searchString) {
          return decodeURIComponent(searchString.replace(/\+/g, ' '));
        }
      } catch {
        // URL parse error
      }
      return null;
    }

    function getCardNameFromPriceContainer(container: Element): string | null {
      const cardmarketLink = container.querySelector('a[href*="cardmarket.com"]');
      if (cardmarketLink) {
        const href = cardmarketLink.getAttribute('href');
        if (href) {
          return extractCardNameFromCardmarketUrl(href);
        }
      }
      return null;
    }

    function createShopLink(cardName: string): HTMLAnchorElement {
      const link = document.createElement('a');
      link.href = shop.buildUrl(cardName);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = `${shop.name}で「${cardName}」を検索`;
      link.setAttribute(MARKER_ATTR, 'true');

      link.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgb(23, 99, 181);
        font-size: 12.8px;
        font-weight: 400;
        text-decoration: none;
        white-space: nowrap;
        flex-shrink: 0;
      `;

      link.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>${shop.name}</span>
      `;

      return link;
    }

    function injectShopLinksToAllContainers(): void {
      const priceContainers = document.querySelectorAll('[class*="CardPrices_prices"]');

      priceContainers.forEach((container) => {
        if (container.querySelector(`[${MARKER_ATTR}]`)) {
          return;
        }

        const cardName = getCardNameFromPriceContainer(container);
        if (cardName) {
          const link = createShopLink(cardName);
          container.appendChild(link);
        }
      });
    }

    function setupMutationObserver(): void {
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const observer = new MutationObserver(() => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          injectShopLinksToAllContainers();
        }, 300);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // 初回実行
    injectShopLinksToAllContainers();

    // DOM変化を監視
    setupMutationObserver();
  });
}
