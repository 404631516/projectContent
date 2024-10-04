/**
 * 學情分析
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const learningAnalysis: RouteConfig[] = [
  {
    path: `/${MenuName.LearningAnalysis}`,
    component: () => import('../views/LearningAnalysis/LearningAnalysis.vue'),
    meta: { requireAuth: true },
    children: [
      // 主入口
      {
        path: '/',
        name: `${MenuName.LearningAnalysis}`,
        meta: { name: `${MenuWord.LearningAnalysis}`},
        component: () => import('../views/LearningAnalysis/_index.vue'),
      },
    ],
  },
];
export default learningAnalysis;
