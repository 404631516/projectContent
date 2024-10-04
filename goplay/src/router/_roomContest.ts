/** 校園賽事 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const roomContest: RouteConfig[] = [
  {
    path: `/${MenuName.RoomContest}`,
    name: `${MenuWord.RoomContest}`,
    meta: { requireAuth: true, name: `${MenuWord.RoomContest}` },
    component: () => import('../views/WorldContest/RoomContest.vue'),
  },
];
export default roomContest;
