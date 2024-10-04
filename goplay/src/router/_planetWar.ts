/**
 * 星球大戰
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { WebGameHelpName, WebGameName } from '@/helper/enum/WebGame';
import { RouteConfig } from 'vue-router';
const planetWar: RouteConfig[] = [
  {
    path: `/${MenuName.PlanetWar}`,
    component: () => import('../views/PlanetWar/PlanetWar.vue'),
    meta: { requireAuth: true },
    children: [
      // 主入口
      {
        path: '/',
        name: `${MenuName.PlanetWar}`,
        meta: { name: `${MenuWord.PlanetWar}` },
        component: () => import('../views/PlanetWar/_index.vue'),
      },
      {
        path: `/${WebGameName.PlanetGame}/:id`,
        name: `${WebGameName.PlanetGame}`,
        meta: { name: `${MenuWord.PlanetWar}`, isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/PlanetGame.vue'),
      },
      {
        path: `/${WebGameHelpName.PlanetGameHelp}/:id`,
        name: `${WebGameHelpName.PlanetGameHelp}`,
        meta: { name: `${MenuWord.PlanetWar}`, isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../views/PlanetWar/GameHelp.vue'),
      },
    ],
  },
];
export default planetWar;
