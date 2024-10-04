/**
 * 主要配置
 */
import { MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
import Home from '../views/Index.vue';
const main: RouteConfig[] = [
  // 重導向
  {
    path: '*',
    redirect: '/404',
  },
  // 404
  {
    path: '/404',
    name: '404',
    component: () => import('../views/404/Erro404.vue'),
  },
  // 首頁
  {
    path: '/',
    name: `${MenuWord.Home}`,
    meta: {name: '首頁'},
    component: Home,
  },
];
export default main;
