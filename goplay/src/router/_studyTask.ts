import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const studyTask: RouteConfig[] = [
  {
    path: '',
    component: () => import('@/views/StudyTask/StudyTask.vue'),
    meta: { name: `${MenuWord.TeacherAdmin}` },
    children: [
      // 主入口
      {
        path: `/${MenuName.TeacherAdmin}/${MenuName.StudyTask}`,
        meta: { name: `${MenuWord.StudyTask}` },
        component: () => import('@/views/StudyTask/_index.vue'),
      },
    ],
  },
];
export default studyTask;
