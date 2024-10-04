import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const backEndManagement: RouteConfig[] = [
  // 管理者介面
  {
    path: '',
    component: () => import('../views/BackEndManagement/BackEndManagement.vue'),
    meta: { requireAuth: true, name: `${MenuWord.BackEndManagement}` },
    children: [
      // 賽事管理
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.Contest}`,
        meta: { requireAuth: true, name: `${MenuWord.Contest}` },
        component: () => import('../views/BackEndManagement/Contest.vue'),
        children: [
          {
            path: '',
            meta: { requireAuth: true },
            component: () => import('../views/BackEndManagement/_index.vue'),
          },
          {
            path: `${MenuName.ContestAdd}/:tabType`,
            name: `${MenuName.ContestAdd}`,
            meta: { requireAuth: true, name: `${MenuWord.ContestAdd}` },
            component: () => import('../views/BackEndManagement/Contest/FormEdit/index.vue'),
          },
          {
            path: `${MenuName.ContestEdit}/:id`,
            name: `${MenuName.ContestEdit}`,
            meta: { requireAuth: true, name: `${MenuWord.ContestEdit}` },
            component: () => import('../views/BackEndManagement/Contest/FormEdit/index.vue'),
          },
          {
            path: `${MenuName.RoomCreate}/:id/:roomId`,
            meta: { requireAuth: true, name: `${MenuWord.RoomCreate}` },
            component: () => import('../views/BackEndManagement/Contest/RoomEdit/index.vue'),
          },
          {
            path: `${MenuName.RoomEdit}/:id/:roomId`,
            meta: { requireAuth: true, name: `${MenuWord.RoomEdit}` },
            component: () => import('../views/BackEndManagement/Contest/RoomEdit/index.vue'),
          },
        ],
      },
      // 活動管理
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.AdminSetting}`,
        meta: { requireAuth: true, name: `${MenuWord.AdminSetting}` },
        component: () => import('../views/BackEndManagement/AdminSetting/Index.vue'),
      },
      // 數據報表
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.StatisticReport}`,
        meta: { name: `${MenuWord.StatisticReport}` },
        component: () => import('@/views/BackEndManagement/StatisticReport/Index.vue'),
      },
      // 學習歷程報表
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.LearningRecordStatistic}`,
        meta: { name: `${MenuWord.LearningRecordStatistic}` },
        component: () => import('@/views/BackEndManagement/LearningRecordStatistic/Index.vue'),
      },
      // 管理者問巻清單
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.QuestionnaireEdit}`,
        component: () => import('../views/QuestionnaireEdit/QuestionnaireEdit.vue'),
        meta: { requireAuth: true, name: `${MenuWord.QuestionnaireEdit}` },

        children: [
          // 主入口
          {
            path: '',
            name: `${MenuWord.QuestionnaireEntrance}`,
            meta: {},
            component: () => import('../views/QuestionnaireEdit/Index.vue'),
          },
          // 問卷表單
          {
            path: `/${MenuName.QuestionnaireForm}/:id`,
            name: `${MenuWord.QuestionnaireForm}`,
            meta: { name: `${MenuWord.QuestionnaireForm}` },
            component: () => import('../components/BackEndManagement/Questionnaire/index.vue'),
          },
        ],
      },
      // 教師派獎設定介面
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.AdminTeacherAward}`,
        meta: { requireAuth: true, name: `${MenuWord.AdminTeacherAward}` },
        component: () => import('@/views/AdminTeacherAward/Index.vue'),
      },
      // 數據儀表板
      {
        path: `/${MenuName.BackEndManagement}/${MenuName.AdminDataDashboard}`,
        meta: { name: `${MenuWord.DataDashboardAnalysis}` },
        component: () => import('@/views/BackEndManagement/AdminDataDashboard/_index.vue'),
      },
    ],
  },
];
export default backEndManagement;
