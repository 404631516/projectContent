import Vue from 'vue';
import VueRouter, { RouteConfig, Route } from 'vue-router';
import gameH5 from './_gameH5';
import storyTour from './_storyTour';
import profile from './_profile';
import learningAnalysis from './_learningAnalysis';
import rankingList from './_rankingList';
import heroUniverse from './_heroUniverse';
import planetWar from './_planetWar';
import worldContest from './_worldContest';
import interstellarForum from './_InterstellarForum';
import immediateRank from './_immediateRank';
import main from './_main';
import backEndManagement from './_backEndManagement';
import courseMenu from './_courseMenu';
import noviceGuide from './_noviceGuide';
import teacherAdmin from './_teacherAdmin';
import studyTask from './_studyTask';
import newGame from './_newGame';
import testPage from './_testPage';
import roomGame from './_roomGame';
import { AdlLoginInfo } from '@/helper/interface/Login';
import Cookies from 'js-cookie';
import questionnaireUser from './_questionnaireUser';
import { CookieStr, LocalStorageStr } from '@/helper/enum/Common';
import anniversary from './_anniversary';
import roomContest from './_roomContest';
import studyTaskStatus from './_studyTaskStatus';

Vue.use(VueRouter);
const routes: RouteConfig[] = [
  ...main, // 主要配置(ex: 首頁)
  ...gameH5, // 小遊戲入口
  ...storyTour, // 故事簡介
  ...profile, // 個人資訊頁
  ...rankingList, // 排行榜
  ...learningAnalysis, // 學情分析
  ...heroUniverse, // 因雄宇宙
  ...planetWar, // 星球大戰相關
  ...worldContest, // 世界大賽相關
  ...roomGame, // 房間賽
  ...interstellarForum, // 星際論壇
  ...backEndManagement, // 導師專區
  ...courseMenu, // 課程選單
  ...noviceGuide, // 新手引導
  ...teacherAdmin, // 教師後台
  ...studyTask, // 教師派任務系統
  ...studyTaskStatus, // 任務完成狀態
  ...immediateRank, // 即時排行榜
  ...questionnaireUser, // 用戶端問巻清單
  ...anniversary, // 周年慶
  ...roomContest, // 校園賽事
];

/** 測試路由 */
const debugRoutes: RouteConfig[] = [
  ...newGame, // 新開發遊戲
  ...testPage, // 測試頁面
];

// 測試時加入測試頁面
if (process.env.NODE_ENV !== 'production') {
  routes.push(...debugRoutes);
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  // 因材網轉跳
  if (to.query.token) {
    // 因材網轉跳帶來的資訊
    const loginAdlInfo: AdlLoginInfo = {
      token: to.query.token as string,
      gameLinkId: to.query.gameLinkId ? (to.query.gameLinkId as string) : '',
    };

    // 設定因材網轉跳資訊
    Cookies.set(`${CookieStr.AdlGame}`, JSON.stringify(loginAdlInfo), {
      expires: 0.2, // 暫存5小時時效
    });
  }

  // 判斷是否登入
  if (isLoginBlock(to)) {
    if (from.path !== '/') {
      next('/');
    }
    return;
  }

  // 如果是返回
  if (isClickReturn) {
    // 重置點擊返回判斷
    isClickReturn = false;

    // 判斷是否阻擋返回
    if (isReturnBlock(to, from)) {
      next(false);
      return;
    }
  }

  // 進入目標網頁
  next();
});

/** 阻擋未登入
 * @param token
 */
function isLoginBlock(to: Route): boolean {
  // 如果需要Token
  if (to.matched.find((record) => record.meta.requireAuth) !== undefined) {
    // 返回是否取得token
    return localStorage.getItem(LocalStorageStr.UserInfo) === null;
  }
  // 不需要Token
  return false;
}

/** 阻擋返回
 * @param to
 * @param from
 */
function isReturnBlock(to: Route, from: Route): boolean {
  // 錯誤返回
  if (isErrorReturn) {
    isErrorReturn = false;
    return false;
  }

  // 當前頁面不允許返回
  if (from.meta && from.meta.isNoReturn) {
    return true;
  }

  // 前往頁面不允許返回
  if (to.meta && to.meta.isNoReturn) {
    return true;
  }

  // 當前頁面允許返回
  return false;
}

/** 是否按上一頁 */
let isClickReturn: boolean = false;
window.addEventListener('popstate', () => {
  isClickReturn = true;
});

/** 錯誤返回 */
let isErrorReturn: boolean = false;
export function onErrorReturn(): void {
  isErrorReturn = true;
  router.go(-1);
}
export default router;
