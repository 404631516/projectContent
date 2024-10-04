import { RouteConfig } from 'vue-router';
const immediateRank: RouteConfig[] = [
  {
    path: '/immediateRank',
    component: () => import('../views/ImmediateRank/ImmediateRank.vue'),
  },
];
export default immediateRank;
