/**
 * 房間賽
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const roomGame: RouteConfig[] = [
  {
    path: `/${MenuName.RoomGame}`,
    name: `${MenuWord.RoomGame}`,
    meta: { requireAuth: true, name: `${MenuWord.RoomGame}`, isNoReturn: true, isTopNav: false, isPlayHomeBGM: false },
    component: () => import('../components/H5/RoomGame.vue'),
  },
];
export default roomGame;
