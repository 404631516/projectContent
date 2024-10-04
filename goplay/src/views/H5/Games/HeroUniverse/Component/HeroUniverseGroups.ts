import BaseGroups from '@/views/H5/Scripts/Components/BaseGroups';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import { HeroUniverseHero } from './HeroUniverseHero';
import HeroUniverseMapObstacle from './HeroUniverseMapObstacle';

export default class HeroUniverseGroups extends BaseGroups {
  /** 因雄宇宙遊戲場景 */
  public declare scene: HeroUniverseGameScene;

  public init(): void {
    /** 英雄物件池 */
    this.createPhysicGroup(HeroUniverseHero.name, { classType: HeroUniverseHero, runChildUpdate: true });
    /** 地圖障礙物件池 */
    this.createPhysicGroup(HeroUniverseMapObstacle.name, { classType: HeroUniverseMapObstacle });
  }
}
