/**
 * 課程選單
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const courseMenu: RouteConfig[] = [
  {
    path: `/${MenuName.CourseMenu}`,
    component: () => import('../views/CourseMenu/CourseMenu.vue'),
    meta: { name: `${MenuWord.CourseMenu}`},
    children: [
      // 主入口
      {
        path: `/${MenuName.CourseMenu}`,
        name: `${MenuWord.CourseMenu}`,
        meta: {},
        component: () => import('../views/CourseMenu/_index.vue'),
      },
      {
        path: `${MenuName.ContestInfoDetail}/:id`,
        name: `${MenuName.ContestInfoDetail}`,
        meta: { name: `答題遊戲賽事資訊`},
        component: () => import('../views/WorldContest/_contestDetail.vue'),
      }
    ],
  },
];
export default courseMenu;
