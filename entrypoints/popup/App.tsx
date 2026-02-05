import { useEffect, useState } from 'react';
import { storage } from 'wxt/utils/storage';
import { SHOPS, DEFAULT_SHOP_ID, type ShopId } from '@/lib/shops';

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState<ShopId>(DEFAULT_SHOP_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const [storedEnabled, storedShopId] = await Promise.all([
        storage.getItem<boolean>('local:settings:enabled'),
        storage.getItem<ShopId>('local:settings:selectedShopId'),
      ]);
      setEnabled(storedEnabled ?? true);
      setSelectedShopId(storedShopId ?? DEFAULT_SHOP_ID);
      setIsLoaded(true);
    }
    loadSettings();
  }, []);

  const handleEnabledChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnabled(newValue);
    await storage.setItem('local:settings:enabled', newValue);
  };

  const handleShopChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as ShopId;
    setSelectedShopId(newValue);
    await storage.setItem('local:settings:selectedShopId', newValue);
  };

  if (!isLoaded) {
    return <div className="popup-container">読み込み中...</div>;
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1 className="popup-title">EDHREC Planarbridge</h1>
        <p className="popup-subtitle">日本のショップリンクを追加</p>
      </header>

      <main className="popup-main">
        <div className="setting-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleEnabledChange}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">拡張機能を有効化</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="select-label">
            <span className="select-text">ショップ</span>
            <select
              value={selectedShopId}
              onChange={handleShopChange}
              className="select-input"
              disabled={!enabled}
            >
              {Object.values(SHOPS).map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </main>

      <footer className="popup-footer">
        <p>EDHRECのカードページで使用できます</p>
      </footer>
    </div>
  );
}
