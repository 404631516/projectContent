import { ScreenType } from '@/helper/enum/Common';

(function (doc, win) {
  const docElement = doc.documentElement;
  const resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize';

  /** 不使用自動rem的頁面 */
  const excludePages = ['/HeroUniverseGame'];

  // 設置rem函數
  const setRem = function () {
    // 依當前頁面寬度縮放比例
    const clientWidth = docElement.clientWidth;
    if (!clientWidth) {
      return;
    }
    if (clientWidth <= ScreenType.Phone) {
      // 手機(435) 435及以下
      // 基準大小
      docElement.style.fontSize = 16 * (clientWidth / ScreenType.Phone) + 'px';
    } else if (clientWidth <= ScreenType.Tablet) {
      // 平板(1024) 435~1024
      // docElement.style.fontSize = 16 * (clientWidth / ScreenType.Computer ) + 'px';
      docElement.style.fontSize = 16 * (clientWidth / ScreenType.Tablet) + 'px';
    } else {
      // 電腦(1920)) 1025以上
      docElement.style.fontSize = 16 * (clientWidth / ScreenType.Computer) + 'px';
    }
  };
  if (!doc.addEventListener) {
    return;
  }
  // 不使用自動rem的頁面
  if (excludePages.includes(doc.location.pathname)) {
    return;
  }
  // 初始化
  setRem();
  // 改變窗口大小時重新設置 rem
  win.addEventListener(resizeEvent, setRem, false);
})(document, window);
