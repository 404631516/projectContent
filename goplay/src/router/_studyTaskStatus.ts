import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const studyTaskStatus: RouteConfig[] = [
  {
    path: '',
    component: () => import('@/views/StudyTaskStatus/StudyTaskStatus.vue'),
    meta: { name: `${MenuWord.TeacherAdmin}` },
    children: [
      // 主入口
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.StudyTaskStatus}`,
        meta: { name: `${MenuWord.StudyTaskStatus}` },
        component: () => import('@/views/StudyTaskStatus/_index.vue'),
      },
    ],
  },
];
export default studyTaskStatus;
