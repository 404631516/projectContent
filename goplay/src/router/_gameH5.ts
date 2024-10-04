import { WebGameName } from '@/helper/enum/WebGame';
import { RouteConfig } from 'vue-router';

/** 遊戲路由配置 */
const gameH5: RouteConfig[] = [
  {
    path: '/game',
    component: () => import('../views/H5/H5Game.vue'),
    meta: { requireAuth: true },
    children: [
      //#region 答題遊戲
      {
        path: `/${WebGameName.AnswerGame}`,
        name: `${WebGameName.AnswerGame}`,
        meta: { isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/AnswerGame.vue'),
      },
      {
        path: `/${WebGameName.AnswerPhaserGame}`,
        name: `${WebGameName.AnswerPhaserGame}`,
        meta: { isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/AnswerPhaserGame.vue'),
      },
      //#endregion

      //#region 個人基地
      {
        path: `/${WebGameName.PersonalBaseGame}`,
        name: `${WebGameName.PersonalBaseGame}`,
        meta: { isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/PersonalBaseGame.vue'),
      },
      //#endregion
    ],
  },
];
export default gameH5;
