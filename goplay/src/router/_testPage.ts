import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const testPage: RouteConfig[] = [
  {
    path: `/${MenuName.TestPage}`,
    component: () => import('@/views/TestPage/TestPage.vue'),
  },
];
export default testPage;
