/**
 * 故事簡介
 */
import { MenuName, MenuWord } from '@/helper/enum/MenuName';
import { RouteConfig } from 'vue-router';
const storyTour: RouteConfig[] = [
  {
    path: `/${MenuName.StoryTour}`,
    name: `${MenuName.StoryTour}`,
    meta: { name: `${MenuWord.StoryTour}`},
    component: () => import('../views/StoryTour/index.vue'),
  },
];
export default storyTour;
