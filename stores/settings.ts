import { create } from 'zustand';
import { storage } from 'wxt/utils/storage';
import { DEFAULT_SHOP_ID, type ShopId } from '@/lib/shops';

interface SettingsState {
  enabled: boolean;
  selectedShopId: ShopId;
  isLoaded: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
  setSelectedShopId: (shopId: ShopId) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEYS = {
  enabled: 'local:settings:enabled',
  selectedShopId: 'local:settings:selectedShopId',
} as const;

export const useSettingsStore = create<SettingsState>((set) => ({
  enabled: true,
  selectedShopId: DEFAULT_SHOP_ID,
  isLoaded: false,

  setEnabled: async (enabled: boolean) => {
    await storage.setItem(STORAGE_KEYS.enabled, enabled);
    set({ enabled });
  },

  setSelectedShopId: async (shopId: ShopId) => {
    await storage.setItem(STORAGE_KEYS.selectedShopId, shopId);
    set({ selectedShopId: shopId });
  },

  loadSettings: async () => {
    const [enabled, selectedShopId] = await Promise.all([
      storage.getItem<boolean>(STORAGE_KEYS.enabled),
      storage.getItem<ShopId>(STORAGE_KEYS.selectedShopId),
    ]);

    set({
      enabled: enabled ?? true,
      selectedShopId: selectedShopId ?? DEFAULT_SHOP_ID,
      isLoaded: true,
    });
  },
}));
