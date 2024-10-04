import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';

const questionnaireUser: RouteConfig[] = [
  // 用戶端問巻清單
  {
    path: `/${MenuName.QuestionnaireUser}`,
    meta: { requireAuth: true, name: `${MenuWord.QuestionnaireUser}` },
    component: () => import('../views/QuestionnaireUser/QuestionnaireUser.vue'),

    children: [
      // 主入口
      {
        path: '/',
        name: `${MenuName.QuestionnaireUser}`,
        meta: {},
        component: () => import('../views/QuestionnaireUser/Index.vue'),
      },
      // 問卷資訊
      {
        path: `/${MenuName.QuestionnaireInformation}/:id`,
        name: `${MenuWord.QuestionnaireInformation}`,
        meta: { name: `${MenuWord.QuestionnaireInformation}` },
        component: () => import('../views/QuestionnaireUser/QuestionnaireInformation.vue'),
      },
      // 問卷答題
      {
        path: `/${MenuName.QuestionnaireAnswer}/:id`,
        name: `${MenuWord.QuestionnaireAnswer}`,
        meta: { name: `${MenuWord.QuestionnaireAnswer}` },
        component: () => import('../views/QuestionnaireUser/QuestionnaireAnswer.vue'),
      },
      // 問卷回顧
      {
        path: `/${MenuName.QuestionnaireReview}/:id`,
        name: `${MenuWord.QuestionnaireReview}`,
        meta: { name: `${MenuWord.QuestionnaireReview}` },
        component: () => import('../views/QuestionnaireUser/QuestionnaireReview.vue'),
      },
    ],
  },
];
export default questionnaireUser;
