import AntiTDHeroSelect from './AntiTDHeroSelect';
import AntiTDEnergyBall from './AntiTDEnergyBall';
import { AntiTDEnemyIndicator, AntiTDHeroIndicator } from './AntiTDIndicator';
import { AntiTDEnemy, AntiTDHero } from './Battle/AntiTDBattleUnit';
import {
  AntiTDEnemyTeam,
  AntiTDHeroTeam,
  CircleRandomMoveEnemyTeam,
  CircleShapeMoveEnemyTeam,
  CrossMoveEnemyTeam,
  DoNotMoveEnemyTeam,
  FixedPointMoveEnemyTeam,
  RectangleRandomMoveEnemyTeam,
  RectangleShapeMoveEnemyTeam,
  StarMoveEnemyTeam,
} from './Battle/AntiTDBattleTeam';
import CombatGroups from '../../../Scripts/Components/Combat/CombatGroups';
import { AntiTDEnemyTeamMoveMode } from '@/helper/enum/AntiTD';

export default class AntiTDGroups extends CombatGroups {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  /** 敵人隊伍類別 */
  private readonly enemyTeamClassTypes: Map<string, typeof AntiTDEnemyTeam> = new Map<string, typeof AntiTDEnemyTeam>([
    [AntiTDEnemyTeamMoveMode.FixedPoint, FixedPointMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.Cross, CrossMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.Star, StarMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.CircleShape, CircleShapeMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.CircleRandom, CircleRandomMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.RectangleShape, RectangleShapeMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.RectangleRandom, RectangleRandomMoveEnemyTeam],
    [AntiTDEnemyTeamMoveMode.DoNotMove, DoNotMoveEnemyTeam],
  ]);

  public onInit(): void {
    /** 英雄物件池 */
    this.createPhysicGroup(AntiTDHero.name, { classType: AntiTDHero, runChildUpdate: true });

    /** 敵人物件池 */
    this.createPhysicGroup(AntiTDEnemy.name, { classType: AntiTDEnemy, runChildUpdate: true });

    /** 英雄隊伍物件池 */
    this.createGroup(AntiTDHeroTeam.name, { classType: AntiTDHeroTeam, runChildUpdate: true });

    /** 英雄選擇物件池 */
    this.createGroup(AntiTDHeroSelect.name, { classType: AntiTDHeroSelect, runChildUpdate: true });

    /** 英雄指標物件池 */
    this.createGroup(AntiTDHeroIndicator.name, { classType: AntiTDHeroIndicator, runChildUpdate: true });

    /** 敵人指標物件池 */
    this.createGroup(AntiTDEnemyIndicator.name, { classType: AntiTDEnemyIndicator, runChildUpdate: true });

    /** 魔力球物件池 */
    this.createGroup(AntiTDEnergyBall.name, { classType: AntiTDEnergyBall, runChildUpdate: true });

    /** 敵人隊伍物件池 */
    this.enemyTeamClassTypes.forEach((enemyTeamClassType: typeof AntiTDEnemyTeam, nameKey: string) => {
      this.createGroup(nameKey, { classType: enemyTeamClassType, runChildUpdate: true });
    });
  }

  /** 獲取所有敵人隊伍群組
   * @returns 所有敵人隊伍群組
   */
  public getEnemyTeamGroups(): Phaser.GameObjects.Group[] {
    const enemyTeamGroups: Phaser.GameObjects.Group[] = [];
    this.enemyTeamClassTypes.forEach((value: typeof AntiTDEnemyTeam, enemyTeamClassType: string) => {
      const enemyTeamGroup = this.getGroup(enemyTeamClassType);
      if (enemyTeamGroup !== undefined) {
        enemyTeamGroups.push(enemyTeamGroup);
      }
    });
    return enemyTeamGroups;
  }

  /** 取得活動中敵人隊伍總數
   * @returns 活動中敵人隊伍總數
   */
  public getTotalAliveEnemyTeam(): number {
    const enemyTeamGroups = this.getEnemyTeamGroups();
    // 將所有敵人群組中的活動中敵人隊伍加總
    let totalAliveEnemyTeam: number = 0;
    enemyTeamGroups.forEach((enemyTeamGroup: Phaser.GameObjects.Group) => {
      totalAliveEnemyTeam += enemyTeamGroup.getTotalUsed();
    });

    return totalAliveEnemyTeam;
  }
}
