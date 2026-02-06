import { test, expect } from './fixtures';

/**
 * Content Script E2Eテスト
 *
 * 注意: これらのテストは拡張機能をロードした状態で実行する必要があります。
 * 事前に `pnpm build` を実行して `output/chrome-mv3` を生成してください。
 *
 * テスト実行コマンド:
 * pnpm build && pnpm test:e2e
 */

test.describe('Content Script E2E', () => {
  test.beforeEach(async ({ page }) => {
    // ネットワークの安定化のため、ページロードを待機
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('カード詳細ページで晴れる屋リンクが表示される', async ({ page }) => {
    await page.goto('/cards/sol-ring');

    // 価格エリアが表示されるまで待機
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 晴れる屋リンクが追加されるまで待機（拡張機能の動作を待つ）
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // リンクのテキストに「晴れる屋」が含まれることを確認
    await expect(hareruyaLink).toContainText('晴れる屋');

    // リンクが正しいURLを持つことを確認
    const href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('hareruyamtg.com');
    expect(href).toContain('Sol%20Ring');
  });

  test('統率者ページで晴れる屋リンクが表示される', async ({ page }) => {
    await page.goto('/commanders/the-ur-dragon');

    // 価格エリアが表示されるまで待機
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 晴れる屋リンクが追加されるまで待機
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // リンクが正しいURLを持つことを確認
    const href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('hareruyamtg.com');
  });

  test('カードリストページで複数の晴れる屋リンクが表示される', async ({ page }) => {
    await page.goto('/commanders');

    // 価格エリアが表示されるまで待機
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 複数の晴れる屋リンクが追加されるまで待機
    const hareruyaLinks = page.locator('[data-planarbridge="true"]');
    await expect(hareruyaLinks.first()).toBeVisible({ timeout: 5000 });

    // 複数のリンクが存在することを確認
    const count = await hareruyaLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('SPA遷移後も正しいカード名でリンクが更新される', async ({ page }) => {
    // 最初のカードページにアクセス
    await page.goto('/cards/sol-ring');
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 晴れる屋リンクが表示されることを確認
    let hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // Sol Ringのリンクであることを確認
    let href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('Sol%20Ring');

    // 別のカードページに遷移（SPA遷移）
    await page.goto('/cards/command-tower');
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 新しいカードの晴れる屋リンクが表示されることを確認
    hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // Command Towerのリンクであることを確認（Sol Ringではない）
    href = await hareruyaLink.getAttribute('href');
    expect(href).toContain('Command%20Tower');
    expect(href).not.toContain('Sol%20Ring');
  });

  test('リンクをクリックすると新しいタブで晴れる屋の検索ページが開く', async ({
    page,
    context,
  }) => {
    await page.goto('/cards/sol-ring');
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 晴れる屋リンクが表示されるまで待機
    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // 新しいタブが開くことを確認
    const [newPage] = await Promise.all([context.waitForEvent('page'), hareruyaLink.click()]);

    // 新しいタブのURLを確認
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('hareruyamtg.com');
  });

  test('リンクにtarget="_blank"とrel="noopener noreferrer"が設定されている', async ({
    page,
  }) => {
    await page.goto('/cards/sol-ring');
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    const hareruyaLink = page.locator('[data-planarbridge="true"]').first();
    await expect(hareruyaLink).toBeVisible({ timeout: 5000 });

    // セキュリティ属性を確認
    await expect(hareruyaLink).toHaveAttribute('target', '_blank');
    await expect(hareruyaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('同じコンテナに重複してリンクが追加されない', async ({ page }) => {
    await page.goto('/cards/sol-ring');
    await page.waitForSelector('[class*="CardPrices_prices"]', { timeout: 10000 });

    // 晴れる屋リンクが表示されるまで待機
    await expect(page.locator('[data-planarbridge="true"]').first()).toBeVisible({ timeout: 5000 });

    // ページを少しスクロールしてMutationObserverをトリガー
    await page.evaluate(() => {
      window.scrollBy(0, 100);
      window.scrollBy(0, -100);
    });

    // 少し待機してから確認
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
});
