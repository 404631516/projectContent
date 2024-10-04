/**
 * 因雄宇宙
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { WebGameName } from '@/helper/enum/WebGame';
import { RouteConfig } from 'vue-router';
const heroUniverse: RouteConfig[] = [
  {
    path: `/${MenuName.HeroUniverse}`,
    component: () => import('../views/HeroUniverse/HeroUniverse.vue'),
    meta: { requireAuth: true },
    children: [
      // 主入口
      {
        path: '/',
        name: `${MenuName.HeroUniverse}`,
        meta: { name: `${MenuWord.HeroUniverse}` },
        component: () => import('../views/HeroUniverse/_index.vue'),
      },
      // 因雄宇宙
      {
        path: `/${WebGameName.HeroUniverseGame}`,
        name: `${WebGameName.HeroUniverseGame}`,
        meta: { name: `${MenuWord.HeroUniverse}`, isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
        component: () => import('../components/H5/HeroUniverseWebGame.vue'),
      },
    ],
  },
];
export default heroUniverse;
