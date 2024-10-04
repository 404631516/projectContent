/**
 * 個人資訊
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const profile: RouteConfig[] = [
  {
    path: `/${MenuName.Profile}`,
    meta: { requireAuth: true, name: `${MenuWord.Profile}` },
    component: () => import('../views/Profile/ProfileEntries.vue'),

    children: [
      // 主入口
      {
        path: '/',
        name: `${MenuName.Profile}`,
        meta: {},
        component: () => import('../views/Profile/Profile.vue'),
      },
      // 個人學習歷程
      {
        path: `/${MenuName.Portfolio}`,
        name: `${MenuWord.Portfolio}`,
        meta: { name: `${MenuWord.Portfolio}` },
        component: () => import('../views/Profile/Portfolio.vue'),
      },
    ],
  },
];
export default profile;
