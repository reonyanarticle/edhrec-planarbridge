import { getShop, DEFAULT_SHOP_ID, type ShopId } from '@/lib/shops';
import { storage } from 'wxt/utils/storage';

export default defineContentScript({
  matches: ['https://edhrec.com/*'],
  runAt: 'document_idle',
  main() {
    const MARKER_ATTR = 'data-planarbridge';

    async function getSettings(): Promise<{ enabled: boolean; shopId: ShopId }> {
      const enabled = await storage.getItem<boolean>('local:settings:enabled');
      const selectedShopId = await storage.getItem<ShopId>('local:settings:selectedShopId');
      return {
        enabled: enabled ?? true,
        shopId: selectedShopId ?? DEFAULT_SHOP_ID,
      };
    }

    /**
     * CardmarketリンクのURLからカード名を抽出
     * 例: searchString=Sol+Ring → Sol Ring
     */
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

    /**
     * 価格コンテナからカード名を抽出
     */
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

    /**
     * 晴れる屋リンクを作成
     */
    function createShopLink(cardName: string, shopId: ShopId): HTMLAnchorElement {
      const shop = getShop(shopId);
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

    /**
     * 全ての価格コンテナに晴れる屋リンクを追加
     */
    async function injectShopLinksToAllContainers(): Promise<void> {
      const settings = await getSettings();
      if (!settings.enabled) {
        removeAllShopLinks();
        return;
      }

      const priceContainers = document.querySelectorAll('[class*="CardPrices_prices"]');

      priceContainers.forEach((container) => {
        // 既にリンクが追加されていればスキップ
        if (container.querySelector(`[${MARKER_ATTR}]`)) {
          return;
        }

        const cardName = getCardNameFromPriceContainer(container);
        if (cardName) {
          const link = createShopLink(cardName, settings.shopId);
          container.appendChild(link);
        }
      });
    }

    /**
     * 全ての晴れる屋リンクを削除
     */
    function removeAllShopLinks(): void {
      const links = document.querySelectorAll(`[${MARKER_ATTR}]`);
      links.forEach((link) => link.remove());
    }

    /**
     * MutationObserver で DOM 変化を監視
     */
    function setupMutationObserver(): void {
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const observer = new MutationObserver(() => {
        // デバウンス: 連続したDOM変更をまとめて処理
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
  },
});
