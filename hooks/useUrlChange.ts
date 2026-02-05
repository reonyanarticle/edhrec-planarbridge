import { useEffect, useCallback, useRef } from 'react';

/**
 * SPA対応のURL変更監視フック
 * history.pushState/replaceState と popstate イベントを監視
 */
export function useUrlChange(callback: (url: string) => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleUrlChange = () => {
      callbackRef.current(window.location.href);
    };

    // history.pushState をオーバーライド
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };

    // history.replaceState をオーバーライド
    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    // popstate イベントを監視
    window.addEventListener('popstate', handleUrlChange);

    // 初回実行
    handleUrlChange();

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
}

/**
 * URL変更を監視するイベントリスナー（非React環境用）
 */
export function setupUrlChangeListener(callback: (url: string) => void): () => void {
  const handleUrlChange = () => {
    callback(window.location.href);
  };

  // history.pushState をオーバーライド
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  // history.replaceState をオーバーライド
  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  // popstate イベントを監視
  window.addEventListener('popstate', handleUrlChange);

  // 初回実行
  handleUrlChange();

  // クリーンアップ関数を返す
  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener('popstate', handleUrlChange);
  };
}
