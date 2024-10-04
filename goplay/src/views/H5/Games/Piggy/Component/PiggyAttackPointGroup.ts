import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { PiggyEffectId, PiggyNumber } from '../Data/PiggyConfig';
import PiggyGameScene from '../Scenes/PiggyGameScene';
import { EnemyTeamState, PiggyEnemyTeam } from './PiggyEnemyTeam';

export default class PiggyAttackPointGroup extends Object2D {
  /** 小豬遊戲場景 */
  public declare scene: PiggyGameScene;
  /** 偷襲點Y座標 */
  private readonly positionYList: number[] = [300, 230, 160, 90];
  /** 等待敵人列表 */
  private waitingTeamList: PiggyEnemyTeam[] = [];

  constructor(scene: PiggyGameScene) {
    super(scene);
  }

  update() {
    this.fillEnemies();
    this.updateEnemies();
    this.clearEnemies();
  }

  /** 有空位補上等待敵人 */
  private fillEnemies(): void {
    // 沒人等待
    if (this.waitingTeamList.length === 0) {
      return;
    }

    // 找到未使用的攻擊點
    const newAttackPoint = this.positionYList.find(
      (attackPointY) => this.waitingTeamList.findIndex((attackTeam) => attackTeam.targetY === attackPointY) === -1
    );
    if (newAttackPoint === undefined) {
      return;
    }

    // 找到排隊中的隊伍
    const newAttackTeam = this.waitingTeamList.find(
      (waitingTeam) => waitingTeam.enemyTeamState === EnemyTeamState.Queue
    );
    if (newAttackTeam === undefined) {
      return;
    }

    // 設定隊伍為攀爬
    newAttackTeam.setClimb(newAttackPoint);
  }

  /** 更新敵人隊伍狀態 */
  private updateEnemies(): void {
    // 清除已死亡隊伍
    this.waitingTeamList = this.waitingTeamList.filter(
      (waitingTeam) => waitingTeam.enemyTeamState >= EnemyTeamState.Queue
    );

    // 找到抵達的隊伍
    const arriveTeamList = this.waitingTeamList.filter(
      (waitingTeam) => waitingTeam.enemyTeamState === EnemyTeamState.Arrive
    );

    // 抵達隊伍攻擊
    arriveTeamList.forEach((arriveTeam) => {
      arriveTeam.setAttack();
    });
  }

  /** 消除敵人(滿人or道具用完) */
  private async clearEnemies(): Promise<void> {
    // 找到攻擊隊伍
    const attackTeamList = this.waitingTeamList.filter(
      (enemyTeam) => enemyTeam.enemyTeamState === EnemyTeamState.Attack
    );
    if (attackTeamList.length === 0) {
      return;
    }

    const explodeTweenList: Phaser.Tweens.Tween[] = [];
    // 滿人
    if (attackTeamList.length === this.positionYList.length) {
      attackTeamList.forEach(async (attackTeam) => {
        attackTeam.leader.dead();
        const effectTween = await this.scene.combatComponent.playEffectOnMap(
          attackTeam.leader.x,
          attackTeam.leader.y,
          PiggyEffectId.Explode
        );
        if (effectTween == null) {
          return;
        }
        explodeTweenList.push(effectTween);
      });
      // 等爆炸特效播完
      await AsyncHelper.pendingUntil(() =>
        explodeTweenList.every((tween: Phaser.Tweens.Tween) => tween.progress === 1)
      );
      this.scene.updateEnergy(-100, PiggyNumber.AttackPointX, this.scene.worldTopEdgeY);
    }
    // 未滿
    else {
      attackTeamList.forEach((attackTeam) => {
        if (attackTeam.noActiveItemOnAllMembers) {
          attackTeam.leader.dead();
        }
      });
    }
  }

  /** 敵人等待分派偷襲點
   *  @param enemyTeam
   */
  public joinWaitingList(enemyTeam: PiggyEnemyTeam): void {
    this.waitingTeamList.push(enemyTeam);
  }

  /** 移除死亡敵人隊伍
   * @param targetTeam
   */
  public removeEnemyTeam(targetTeam: PiggyEnemyTeam): void {
    const index = this.waitingTeamList.findIndex((enemyTeam) => enemyTeam === targetTeam);
    if (index > -1) {
      this.waitingTeamList.splice(index, 1);
    }
  }
}
