# E2E Test Debugger - Memory

## Critical Learnings

### Playwright + Chrome Extension Testing

**Issue**: Standard Playwright `launchOptions` does NOT properly load Chrome extensions for testing.

**Solution**: Use `chromium.launchPersistentContext()` with custom fixtures.

```typescript
// ❌ DOES NOT WORK
use: {
  launchOptions: {
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  },
}

// ✅ WORKS
const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});
```

**Key points**:
- Chrome extensions require `launchPersistentContext` instead of standard browser launch
- Must use `headless: false` (extensions don't work reliably in headless mode)
- Create custom test fixtures to share context across tests
- See: `/Users/tomoya/edhrec-planarbridge/e2e/fixtures.ts`

### WXT Output Directory Path

**Issue**: WXT outputs to `output/` directory, not `.output/`

**Correct path**: `${process.cwd()}/output/chrome-mv3`

### EDHREC DOM Structure

Price containers use CSS Modules with hash suffixes:
- Selector: `[class*="CardPrices_prices"]` (partial match required)
- Cardmarket links contain card names in `searchString` parameter
- Card name extraction is reliable and handles special characters

### SPA Navigation Testing

**Issue**: Direct link clicking in SPAs can be flaky on list pages

**Solution**: Use direct navigation (`page.goto()`) between different card pages instead of clicking links on list pages.

```typescript
// ❌ Flaky - clicking links on list pages
await page.goto('/commanders');
await page.locator('a[href*="/commanders/"]').first().click();

// ✅ Reliable - direct navigation
await page.goto('/cards/sol-ring');
// verify
await page.goto('/cards/command-tower');
// verify again
```

## Test Results (2026-02-06)

All 7 E2E tests passing:
- ✅ カード詳細ページで晴れる屋リンクが表示される
- ✅ 統率者ページで晴れる屋リンクが表示される
- ✅ カードリストページで複数の晴れる屋リンクが表示される
- ✅ SPA遷移後も正しいカード名でリンクが更新される
- ✅ リンクをクリックすると新しいタブで晴れる屋の検索ページが開く
- ✅ リンクにtarget="_blank"とrel="noopener noreferrer"が設定されている
- ✅ 同じコンテナに重複してリンクが追加されない

## Files Modified

- `/Users/tomoya/edhrec-planarbridge/playwright.config.ts` - Fixed extension path, disabled parallelization
- `/Users/tomoya/edhrec-planarbridge/e2e/fixtures.ts` - Created custom fixture for persistent context
- `/Users/tomoya/edhrec-planarbridge/e2e/content-script.spec.ts` - Updated to use custom fixture, improved SPA test
