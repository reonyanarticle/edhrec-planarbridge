import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUrlChange, setupUrlChangeListener } from './useUrlChange';

describe('setupUrlChangeListener', () => {
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;
  let mockLocation: { href: string };

  beforeEach(() => {
    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;

    mockLocation = { href: 'https://edhrec.com/cards/sol-ring' };
    vi.stubGlobal('location', mockLocation);
  });

  afterEach(() => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    vi.unstubAllGlobals();
  });

  it('初回コールバックを呼び出す', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/sol-ring');

    cleanup();
  });

  it('popstateイベントでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/cards/lightning-bolt';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/lightning-bolt');

    cleanup();
  });

  it('history.pushStateでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/commanders/the-ur-dragon';
    history.pushState({}, '', '/commanders/the-ur-dragon');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/commanders/the-ur-dragon');

    cleanup();
  });

  it('history.replaceStateでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/cards/brainstorm';
    history.replaceState({}, '', '/cards/brainstorm');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/brainstorm');

    cleanup();
  });

  it('クリーンアップ関数がリスナーを削除する', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    callback.mockClear();
    cleanup();

    mockLocation.href = 'https://edhrec.com/cards/counterspell';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('クリーンアップ後にhistory.pushStateが元に戻る', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    cleanup();

    expect(history.pushState).toBe(originalPushState);
  });

  it('クリーンアップ後にhistory.replaceStateが元に戻る', () => {
    const callback = vi.fn();
    const cleanup = setupUrlChangeListener(callback);

    cleanup();

    expect(history.replaceState).toBe(originalReplaceState);
  });

  it('複数のリスナーを独立して管理できる', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const cleanup1 = setupUrlChangeListener(callback1);
    const cleanup2 = setupUrlChangeListener(callback2);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    callback1.mockClear();
    callback2.mockClear();

    cleanup1();

    mockLocation.href = 'https://edhrec.com/cards/dark-ritual';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);

    cleanup2();
  });
});

describe('useUrlChange (React Hook)', () => {
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;
  let mockLocation: { href: string };

  beforeEach(() => {
    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;

    mockLocation = { href: 'https://edhrec.com/cards/sol-ring' };
    vi.stubGlobal('location', mockLocation);
  });

  afterEach(() => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    vi.unstubAllGlobals();
  });

  it('初回レンダリング時にコールバックを呼び出す', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/sol-ring');

    unmount();
  });

  it('history.pushStateでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/commanders/the-ur-dragon';
    history.pushState({}, '', '/commanders/the-ur-dragon');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/commanders/the-ur-dragon');

    unmount();
  });

  it('history.replaceStateでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/cards/brainstorm';
    history.replaceState({}, '', '/cards/brainstorm');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/brainstorm');

    unmount();
  });

  it('popstateイベントでコールバックを呼び出す', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    callback.mockClear();

    mockLocation.href = 'https://edhrec.com/cards/lightning-bolt';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('https://edhrec.com/cards/lightning-bolt');

    unmount();
  });

  it('アンマウント時にクリーンアップする', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    callback.mockClear();
    unmount();

    mockLocation.href = 'https://edhrec.com/cards/counterspell';
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('アンマウント後にhistory.pushStateが元に戻る', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    unmount();

    expect(history.pushState).toBe(originalPushState);
  });

  it('アンマウント後にhistory.replaceStateが元に戻る', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useUrlChange(callback));

    unmount();

    expect(history.replaceState).toBe(originalReplaceState);
  });

  it('コールバック参照が更新されても正しく動作する', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ cb }) => useUrlChange(cb),
      { initialProps: { cb: callback1 } }
    );

    expect(callback1).toHaveBeenCalledTimes(1);
    callback1.mockClear();

    // コールバックを更新
    rerender({ cb: callback2 });

    // URL変更時に新しいコールバックが呼ばれることを確認
    mockLocation.href = 'https://edhrec.com/cards/dark-ritual';
    history.pushState({}, '', '/cards/dark-ritual');

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith('https://edhrec.com/cards/dark-ritual');

    unmount();
  });
});
