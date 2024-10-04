import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const teacherAdmin: RouteConfig[] = [
  {
    path: '',
    component: () => import('@/views/TeacherAdmin/TeacherAdmin.vue'),
    meta: { name: `${MenuWord.TeacherAdmin}` },
    children: [
      // 主入口
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.StatisticReport}`,
        meta: { name: `${MenuWord.StatisticReport}` },
        component: () => import('@/views/TeacherAdmin/StatisticReport/Index.vue'),
      },
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.Contest}`,
        meta: { requireAuth: true, name: `${MenuWord.Contest}` },
        component: () => import('../views/BackEndManagement/Contest.vue'),
        children: [
          {
            path: '',
            meta: { requireAuth: true },
            component: () => import('../views/BackEndManagement/_index.vue'),
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
      // 學習歷程報表
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.LearningRecordStatistic}`,
        meta: { name: `${MenuWord.LearningRecordStatistic}` },
        component: () => import('@/views/BackEndManagement/LearningRecordStatistic/Index.vue'),
      },
      // 數據儀表板
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.TeacherDataDashboard}`,
        meta: { name: `${MenuWord.DataDashboardAnalysis}` },
        component: () => import('@/views/TeacherAdmin/TeacherDataDashboard/_index.vue'),
      },
    ],
  },
];
export default teacherAdmin;
