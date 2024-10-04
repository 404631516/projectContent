import { RouteConfig } from 'vue-router';
import { WebGameName } from '@/helper/enum/WebGame';
const newGame: RouteConfig[] = [
  {
    path: `/game`,
    component: () => import('../views/H5/H5Game.vue'),
    children: [
      // 主入口
      {
        path: `/${WebGameName.TestGame}`,
        name: `${WebGameName.TestGame}`,
        meta: { isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/TestGame.vue'),
      },
      // 指定gameType
      {
        path: `/${WebGameName.TestGame}/:gameType`,
        name: `${WebGameName.TestGame}`,
        meta: { isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/TestGame.vue'),
      },
    ],
  },
];
export default newGame;
