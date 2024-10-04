import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
import { Message } from '@/helper/class/Common'; // 訊息框
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

const interstellarForum: RouteConfig[] = [
  // 星際論壇
  {
    path: `/${MenuName.InterstellarForum}`,
    component: () => import('../views/InterstellarForum/InterstellarForum.vue'),
    meta: { requireAuth: true, name: `${MenuWord.InterstellarForum}` },
    beforeEnter: async (to, from, next) => {
      // 等到有$$store再判斷
      await AsyncHelper.pendingUntil(() => StoreHelper.$$store != null);

      // 尚未登入, 返回首頁
      if (StoreHelper.$$store.getters.isLogin === false) {
        next('/');
      }
      // 有登入, 沒學校資料
      else if (StoreHelper.$$store.getters.hasSchool === false) {
        // 停留原地
        Message.warn('目前沒有使用權限喔! 請確認身份是否具備學校資訊');
        next('/');
      }

      // 進入星際論壇
      next();
    },
    children: [
      // 主入口
      {
        path: '/InterstellarForum',
        name: `${MenuName.InterstellarForum}`,
        meta: {},
        component: () => import('../views/InterstellarForum/_index.vue'),
      },
      {
        path: '/MyQuestion',
        name: `${MenuWord.QuestionList}`,
        meta: { name: `${MenuWord.QuestionList}` },
        component: () => import('../views/InterstellarForum/MyQuestion.vue'),
        children: [
          {
            path: '/MyQuestion',
            name: '',
            meta: {},
            component: () =>
              import('../views/InterstellarForum/_questionList.vue'),
          },
          {
            path: '/MyQuestionContent/:id',
            name: `${MenuWord.MyQuestionContent}`,
            meta: { name: `${MenuWord.MyQuestionContent}` },
            component: () =>
              import('../views/InterstellarForum/MyQuestionContent.vue'),
          },
        ],
      },
      {
        path: '/SchoolQuestionContent/:id',
        name: 'SchoolQuestionContent',
        meta: { name: `${MenuWord.SchoolQuestionContent}` },
        component: () =>
          import('../views/InterstellarForum/SchoolQuestionContent.vue'),
      },
      {
        path: '/ChallengeProblem/:id',
        name: 'ChallengeProblem',
        component: () =>
          import('../views/InterstellarForum/ChallengeProblem.vue'),
      },
    ],
  },
];
export default interstellarForum;
