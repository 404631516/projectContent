/**
 * 周年慶
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const anniversary: RouteConfig[] = [
  {
    path: `/${MenuName.Anniversary}`,
    name: `${MenuWord.Anniversary}`,
    meta: { name: `${MenuWord.Anniversary}` },
    component: () => import('../components/Public/AnniversaryPromotion.vue'),
  },
];
export default anniversary;
