/**
 * 世界大戰
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const worldContest: RouteConfig[] = [
  {
    path: `/${MenuName.WorldContest}`,
    meta: {  name: `${MenuWord.WorldContest}` },
    component: () => import('../views/WorldContest/WorldContest.vue'),
    children: [
      // 主入口
      {
        path: `/${MenuName.WorldContest}`,
        name: `${MenuName.WorldContest}`,
        meta: { },
        component: () => import('../views/WorldContest/_index.vue'),
      },
      {
        path: `${MenuName.BossContestInfoDetail}/:id`,
        name: `${MenuName.BossContestInfoDetail}`,
        meta: { name: `魔王挑戰賽事資訊`},
        component: () => import('../views/WorldContest/_contestDetail.vue'),
      }
    ],
  },
];
export default worldContest;
