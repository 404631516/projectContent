import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { BattleTeam } from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeam';
import { PiggyNumber } from '../Data/PiggyConfig';
import PiggyGameScene from '../Scenes/PiggyGameScene';
import PiggyEnemy from './PiggyEnemy';
import { PiggyEnemyTeamFSM } from './PiggyEnemyTeamFSM';

/** 敵人隊伍移動階段 */
export enum EnemyTeamState {
  /** 初始 */
  None = 0,
  /** 下降 */
  Drop = 1,
  /** 衝鋒 */
  Charge,
  /** 排隊 */
  Queue,
  /** 攀爬 */
  Climb,
  /** 抵達偷襲點 */
  Arrive,
  /** 偷襲 */
  Attack,
}

/** 英雄隊伍 */
export class PiggyEnemyTeam extends BattleTeam<PiggyEnemy> {
  /** 逆塔防遊戲場景 */
  public declare scene: PiggyGameScene;

  /** X座標目標 */
  private targetX: number = PiggyNumber.AttackPointX;
  /** Y座標目標 */
  public targetY: number = 0;

  /** 敵人階段 */
  public enemyTeamState: number = EnemyTeamState.None;

  /** 速度調整倍率(依照波次資料) */
  public enemySpeedMultiply: number = 1;
  /** 動畫 */
  private moveTween?: Phaser.Tweens.Tween;

  protected fsm: PiggyEnemyTeamFSM = new PiggyEnemyTeamFSM(this);

  /** 是否所有隊伍成員道具次數都使用完 */
  public get noActiveItemOnAllMembers(): boolean {
    return this.battleUnits.every((member: PiggyEnemy) =>
      member.bindingItem ? member.bindingItem.active === false : true
    );
  }

  /** 當戰鬥單位死亡
   * @param unit
   */
  public async onUnitDie(unit: PiggyEnemy): Promise<void> {
    this.enemyTeamState = EnemyTeamState.None;
    this.scene.attackPointGroup.removeEnemyTeam(this);
    this.moveTween?.remove();
    this.dead();
  }

  /** 當隊伍死亡 */
  public async onDeadEnter(): Promise<void> {
    await AsyncHelper.pendingUntil(() => this.leader.body.velocity.y === 0 && this.noActiveItemOnAllMembers);

    this.setActive(false);
  }

  /** 當隊伍重整 */
  public onSortTeamOrder(): void {
    return;
  }

  /** 開始移動 */
  public onMoveEnter(): void {
    // 降落
    this.targetY = this.scene.worldBottomEdgeY;
    this.enemyTeamState = EnemyTeamState.Drop;
  }

  /** 移動 */
  public onMoveUpdate(): void {
    // 死亡不移動
    if (this.enemyTeamState === EnemyTeamState.None || this.leader.isAlive === false) {
      return;
    }

    // 被冰凍or到偷襲點停止動畫
    if (this.leader.body.velocity.length() === 0) {
      this.stopTeam();
    }
    // 下落沒有動畫
    else if (this.enemyTeamState === EnemyTeamState.Drop) {
      this.moveTeamWithoutAnimation();
    }
    // 移動播動畫
    else {
      this.moveTeamWithAnimation();
    }

    // 離目標距離
    const distanceToY = Math.abs(this.targetY - this.leader.y);
    const distanceToX = Math.abs(this.targetX - this.leader.x);

    // 往目y標前進
    if (distanceToY > 0) {
      // 表演移動
      if (distanceToY > PiggyNumber.DistanceToleranceValue) {
        this.scene.physics.moveTo(
          this.leader,
          this.leader.x,
          this.targetY,
          this.leader.speed * this.enemySpeedMultiply
        );
      }
      // 還在動
      else if (this.leader.body.velocity !== Phaser.Math.Vector2.ZERO) {
        this.stopTeam();
        this.leader.y = this.targetY;
      }
      // 誤差範圍內, 瞬移
      else {
        this.leader.y = this.targetY;
      }
    }
    // 往目x標前進
    else if (distanceToX > 0) {
      // 表演移動
      if (distanceToX > PiggyNumber.DistanceToleranceValue) {
        this.scene.physics.moveTo(
          this.leader,
          this.targetX,
          this.leader.y,
          this.leader.speed * this.enemySpeedMultiply
        );
      }
      // 還在動
      else if (this.leader.body.velocity !== Phaser.Math.Vector2.ZERO) {
        this.stopTeam();
        this.leader.x = this.targetX;
      }
      // 誤差範圍內, 瞬移
      else {
        this.leader.x = this.targetX;
      }
    }

    // 抵達
    this.arrive();
  }

  /** 抵達位置 */
  private arrive(): void {
    switch (this.enemyTeamState) {
      // 降落結束
      case EnemyTeamState.Drop:
        if (this.leader.y !== this.scene.worldBottomEdgeY) {
          return;
        }

        // 不可被攻擊敵人觸地即死
        if (this.leader.isCannotBeHit) {
          this.leader.dead();
          this.enemyTeamState = EnemyTeamState.None;
        }
        // 下一階段衝鋒
        else {
          // 敵人降落
          this.leader.onLand();
          // 下一階,衝鋒
          this.enemyTeamState = EnemyTeamState.Charge;
        }
        break;

      // 衝鋒結束
      case EnemyTeamState.Charge:
        if (this.leader.y !== this.scene.worldBottomEdgeY || this.leader.x !== PiggyNumber.AttackPointX) {
          return;
        }

        // 停止隊伍
        this.stopTeam();

        // 排隊
        this.leader.onWait();
        // 下一階, 等待
        this.enemyTeamState = EnemyTeamState.Queue;
        // 加入排隊隊伍
        this.scene.attackPointGroup.joinWaitingList(this);
        break;

      // 排隊結束
      case EnemyTeamState.Queue:
        // 等外部切換狀態
        break;

      // 攀爬
      case EnemyTeamState.Climb:
        if (this.leader.y !== this.targetY) {
          return;
        }

        // 停止隊伍
        this.stopTeam();
        // 回復第一幀
        this.resetAnimeSprite();

        // 抵達偷襲點
        this.enemyTeamState = EnemyTeamState.Arrive;
        break;
    }
  }

  /** 更新下一個目標位置(不增加計數)
   *  @param targetY 移動目標Y
   */
  public setClimb(targetY: number): void {
    this.targetY = targetY;
    this.enemyTeamState = EnemyTeamState.Climb;
  }

  /** 設定為攻擊 */
  public setAttack(): void {
    // 綁定近戰攻擊
    this.leader.bindMeleeItem();
    // 下一階, 偷襲
    this.enemyTeamState = EnemyTeamState.Attack;
  }
}
