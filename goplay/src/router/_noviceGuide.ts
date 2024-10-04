/**
 * 故事簡介
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
import { GameTypeName, WebGameModeName } from '@/helper/enum/Common';
const noviceGuide: RouteConfig[] = [
  {
    path: `/${MenuName.NoviceGuide}`,
    meta: { name: `${MenuWord.NoviceGuide}` },
    component: () => import('../views/NoviceGuide/NoviceGuide.vue'),
    children: [
      // 主入口
      {
        path: `/`,
        component: () => import('../views/NoviceGuide/_index.vue'),
      },
      {
        path: `/${MenuName.ShooterGuide}`,
        meta: { name: `${GameTypeName.Shooter}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.TowerRoomGuide}`,
        meta: { name: `${GameTypeName.TowerDefense}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },

      {
        path: `/${MenuName.HamsterGuide}`,
        meta: { name: `${GameTypeName.Hamster}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.BejeweledGuide}`,
        meta: { name: `${GameTypeName.Bejeweled}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.ParkourGuide}`,
        meta: { name: `${GameTypeName.Parkour}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.FishingGuide}`,
        meta: { name: `${GameTypeName.Fishing}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.BombermanGuide}`,
        meta: { name: `${GameTypeName.BomberMan}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.BubbleDragonGuide}`,
        meta: { name: `${GameTypeName.BubbleDragon}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.MatchingCardGuide}`,
        meta: { name: `${GameTypeName.MatchingCard}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.PiggyGuide}`,
        meta: { name: `${GameTypeName.Piggy}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.PlanetWarGuide}`,
        meta: { name: `${WebGameModeName.OuterWar}` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.InnerWarGuide}`,
        meta: { name: `${WebGameModeName.InnerWar}` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.AdornmentGuide}`,
        meta: { name: `${WebGameModeName.Adornment}` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.TaskGuide}`,
        meta: { name: '任務小精靈篇' },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
      {
        path: `/${MenuName.BrickBreakerGuide}`,
        meta: { name: `${WebGameModeName.BrickBreaker}篇` },
        component: () => import('../views/NoviceGuide/NoviceContent.vue'),
      },
    ],
  },
];
export default noviceGuide;
