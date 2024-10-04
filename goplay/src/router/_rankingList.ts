/**
 * 排行榜
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const rankingList: RouteConfig[] = [
  {
    path: `/${MenuName.RankingList}`,
    name: `${MenuWord.RankingList}`,
    component: () => import('../views/RankingLists/RankingList.vue'),
    meta: { requireAuth: true, name: `${MenuWord.RankingList}` },
  },
];
export default rankingList;
