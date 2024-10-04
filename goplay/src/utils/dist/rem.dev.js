"use strict";

var _Common = require("@/helper/enum/Common");

(function (doc, win) {
  var docElement = doc.documentElement;
  var resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize'; // 設置rem函數

  var setRem = function setRem() {
    // 依當前頁面寬度縮放比例
    var clientWidth = docElement.clientWidth;

    if (!clientWidth) {
      return;
    }

    if (clientWidth <= _Common.ScreenType.Phone) {
      // 手機(425) 425及以下
      // 基準大小
      docElement.style.fontSize = 16 * (clientWidth / _Common.ScreenType.Phone) + 'px';
    } else if (clientWidth <= _Common.ScreenType.Tablet) {
      // 平板(1024) 426~1024
      // docElement.style.fontSize = 16 * (clientWidth / ScreenType.Computer ) + 'px';
      docElement.style.fontSize = 16 * (clientWidth / _Common.ScreenType.Tablet) + 'px';
    } else {
      // 電腦(1920)) 1025以上
      docElement.style.fontSize = 16 * (clientWidth / _Common.ScreenType.Computer) + 'px';
    }
  };

  if (!doc.addEventListener) {
    return;
  } // 初始化


  setRem(); // 改變窗口大小時重新設置 rem

  win.addEventListener(resizeEvent, setRem, false);
})(document, window);