import { test, expect, loadMockPageWithContentScript } from './fixtures';

/**
 * Content Script E2Eテスト（モック版）
 *
 * 外部サイト（edhrec.com, hareruyamtg.com）への負荷を避けるため、
 * ローカルのモックHTMLを使用してテストを実行します。
 *
 * 詳細: docs/external-site-policy.md
 *
 * 事前に `pnpm build` を実行して `output/chrome-mv3` を生成してください。
 *
 * テスト実行コマンド:
 * pnpm build && pnpm test:e2e
 */

test.describe('Content Script E2E（モック版）', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('カード詳細ページで晴れる屋リンクが表示される', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-page.html', extensionId);

    // 価格エリアが表示されていることを確認
    await expect(page.locator('[class*="CardPrices_prices"]')).toBeVisible();

    // 晴れる屋リンクが追加されていることを確認
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // リンクのテキストに「晴れる屋」が含まれることを確認
    await expect(hareruyaLink).toContainText('晴れる屋');

    // リンクが正しいURLを持つことを確認
    const href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('hareruyamtg.com');
    expect(href).toContain('Sol%20Ring');
  });

  test('統率者ページで晴れる屋リンクが表示される', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'commander-page.html', extensionId);

    // 価格エリアが表示されていることを確認
    await expect(page.locator('[class*="CardPrices_prices"]')).toBeVisible();

    // 晴れる屋リンクが追加されていることを確認
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // リンクが正しいURLを持つことを確認
    const href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('hareruyamtg.com');
    expect(href).toContain('The%20Ur-Dragon');
  });

  test('カードリストページで複数の晴れる屋リンクが表示される', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-list-page.html', extensionId);

    // 価格エリアが表示されていることを確認
    await expect(page.locator('[class*="CardPrices_prices"]').first()).toBeVisible();

    // 複数の晴れる屋リンクが追加されていることを確認
    const hareruyaLinks = page.locator('[data-planarbridge="true"]');
    await expect(hareruyaLinks.first()).toBeVisible({ timeout: 5000 });

    // 複数のリンクが存在することを確認（モックには4つのカードがある）
    const count = await hareruyaLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBe(4); // Sol Ring, Command Tower, Arcane Signet, Lightning Greaves
  });

  test('SPA遷移後も正しいカード名でリンクが更新される', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-page.html', extensionId);

    // 晴れる屋リンクが表示されることを確認
    let hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // Sol Ringのリンクであることを確認
    let href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('Sol%20Ring');

    // SPA遷移をシミュレート（モックHTMLのnavigation関数を呼び出し）
    await page.evaluate(() => {
      // 既存の晴れる屋リンクを削除（実際のSPA遷移では新しいコンテナが生成される）
      const existingLinks = document.querySelectorAll('[data-planarbridge]');
      existingLinks.forEach((link) => link.remove());

      // Cardmarketリンクを更新
      const cardmarketLink = document.querySelector('a[href*="cardmarket.com"]') as HTMLAnchorElement;
      if (cardmarketLink) {
        cardmarketLink.href =
          'https://www.cardmarket.com/en/Magic/Products/Search?searchString=Command+Tower';
      }

      // MutationObserverをトリガー
      const container = document.querySelector('[class*="CardPrices_prices"]');
      if (container) {
        const temp = document.createElement('span');
        container.appendChild(temp);
        setTimeout(() => temp.remove(), 10);
      }
    });

    // MutationObserverのデバウンス時間を待つ
    await page.waitForTimeout(500);

    // 新しいカードの晴れる屋リンクが表示されることを確認
    hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // Command Towerのリンクであることを確認（Sol Ringではない）
    href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('Command%20Tower');
    expect(href).not.toContain('Sol%20Ring');
  });

  test('リンクのhrefが晴れる屋の検索ページを指している', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-page.html', extensionId);

    // 晴れる屋リンクが表示されるまで待機
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // リンクのURLを確認（実際にクリックして遷移するのではなく、hrefの値をチェック）
    const href = await hareruyaLink.getAttribute('href');
    expect(href).toBe('https://www.hareruyamtg.com/ja/products/search?product=Sol%20Ring');
  });

  test('リンクにtarget="_blank"とrel="noopener noreferrer"が設定されている', async ({
    page,
    extensionId,
  }) => {
    await loadMockPageWithContentScript(page, 'card-page.html', extensionId);

    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // セキュリティ属性を確認
    await expect(hareruyaLink).toHaveAttribute('target', '_blank');
    await expect(hareruyaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('同じコンテナに重複してリンクが追加されない', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-page.html', extensionId);

    // 晴れる屋リンクが表示されるまで待機
    await expect(page.locator('[data-planarbridge="true"]').first()).toBeVisible({ timeout: 5000 });

    // MutationObserverを複数回トリガー
    await page.evaluate(() => {
      const container = document.querySelector('[class*="CardPrices_prices"]');
      if (container) {
        for (let i = 0; i < 5; i++) {
          const temp = document.createElement('span');
          container.appendChild(temp);
          temp.remove();
        }
      }
    });

    // デバウンス時間を待つ
    await page.waitForTimeout(500);

    // 各価格コンテナ内のリンク数を確認
    const priceContainers = page.locator('[class*="CardPrices_prices"]');
    const count = await priceContainers.count();

    for (let i = 0; i < count; i++) {
      const container = priceContainers.nth(i);
      const linksInContainer = container.locator('[data-planarbridge="true"]');
      const linkCount = await linksInContainer.count();
      expect(linkCount).toBeLessThanOrEqual(1);
    }
  });

  test('各カードに対応する正しいURLが生成される', async ({ page, extensionId }) => {
    await loadMockPageWithContentScript(page, 'card-list-page.html', extensionId);

    // 全ての晴れる屋リンクが表示されるまで待機
    const hareruyaLinks = page.locator('[data-planarbridge="true"]');
    await expect(hareruyaLinks.first()).toBeVisible({ timeout: 5000 });

    // 各カードのURLを確認
    const expectedCards = ['Sol Ring', 'Command Tower', 'Arcane Signet', 'Lightning Greaves'];

    const count = await hareruyaLinks.count();
    expect(count).toBe(expectedCards.length);

    for (let i = 0; i < count; i++) {
      const link = hareruyaLinks.nth(i);
      const href = await link.getAttribute('href');
      const expectedCardName = expectedCards[i];
      expect(href).toContain(encodeURIComponent(expectedCardName));
    }
  });
});
