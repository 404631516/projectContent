import CombatGroups from '../../../Scripts/Components/Combat/CombatGroups';
import PiggyAttackPointGroup from './PiggyAttackPointGroup';
import PiggyEnemy from './PiggyEnemy';
import { PiggyEnemyTeam } from './PiggyEnemyTeam';
import PiggyHero from './PiggyHero';
import { PiggyHeroTeam } from './PiggyHeroTeam';

export default class PiggyGroups extends CombatGroups {
  public onInit(): void {
    /** 偷襲點群組物件池 */
    this.createGroup(PiggyAttackPointGroup.name, {
      classType: PiggyAttackPointGroup,
      runChildUpdate: true,
      maxSize: 1,
    });
    /** 英雄物件池 */
    this.createPhysicGroup(PiggyHero.name, { classType: PiggyHero, runChildUpdate: true, maxSize: 1 });
    /** 英雄隊伍物件池 */
    this.createGroup(PiggyHeroTeam.name, { classType: PiggyHeroTeam, runChildUpdate: true, maxSize: 1 });
    /** 敵人物件池 */
    this.createPhysicGroup(PiggyEnemy.name, { classType: PiggyEnemy, runChildUpdate: true });
    /** 敵人隊伍物件池 */
    this.createGroup(PiggyEnemyTeam.name, { classType: PiggyEnemyTeam, runChildUpdate: true });
  }
}
