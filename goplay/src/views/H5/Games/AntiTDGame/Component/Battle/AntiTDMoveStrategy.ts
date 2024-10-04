import { AntiTDEnemyTeamMoveDirection } from '@/helper/enum/AntiTD';
import { CombatNumber } from '@/helper/enum/Combat';
import { AntiTDEnemyTeamData } from '@/manager/TableManager';
import { AntiTDEnemyTeam } from './AntiTDBattleTeam';
import { AntiTDEnemy } from './AntiTDBattleUnit';

/** 多個battleUnit組成一個Team一起移動 */
export default abstract class AntiTDMoveStrategy {
  /** 目標點容忍值 */
  protected readonly toleranceDistance: number = 4;

  /** 原點 */
  protected originalPoint!: Phaser.Math.Vector2;
  /** 路線清單 */
  protected targetRoutineList!: Phaser.Math.Vector2[][];
  /** 路線Index */
  protected targetRoutineIndex!: number;
  /** 目標點Index */
  protected targetPointIndex!: number;
  /** IndexStep */
  protected indexStep!: number;

  /** 紀錄開始等待轉向的時間 */
  protected startWaitingTurnTime: number = 0;
  /** 等待轉向間隔時間 */
  protected waitingTurnInterval: number = 0;
  /** 是否在等待轉向 */
  protected isWaitingTurn: boolean = false;

  /** 紀錄上一次隨機轉向的時間 */
  private randomTurnTime: number = 0;
  /** 隨機轉向間隔時間 */
  private randomTurnInterval: number = 0;

  /** 是否返回中心點 */
  private isReturnToOriginal: boolean = false;

  /** 上一幀是否也碰撞 */
  protected isBlockLastFrame: boolean = false;
  /** 碰撞時是否逆向行進 */
  protected isRevertIndexStepWhenBlocked: boolean = false;

  /** 初始化
   * @param enemyTeam 敵人隊伍
   */
  public init(enemyTeam: AntiTDEnemyTeam): void {
    // 原點
    this.originalPoint = new Phaser.Math.Vector2(
      enemyTeam.leader.x + enemyTeam.teamData.movePointOffsetX,
      enemyTeam.leader.y + enemyTeam.teamData.movePointOffsetY
    );
    // 重置目標路線
    this.targetRoutineList = [];
    // 繼承類別各自設定targetRoutineList
    this.onInit(enemyTeam);
    // 重置路線順序與Index
    this.resetIndex(enemyTeam.teamData);
  }

  /** 重置路線順序與Index
   * @param teamData 敵人隊伍資料
   */
  private resetIndex(teamData: AntiTDEnemyTeamData): void {
    // 路線順序
    this.targetRoutineList =
      teamData.moveDirection === AntiTDEnemyTeamMoveDirection.Random
        ? Phaser.Math.RND.shuffle(this.targetRoutineList)
        : this.targetRoutineList;
    // 起始路線隨機
    this.targetRoutineIndex = Phaser.Math.Between(0, this.targetRoutineList.length - 1);
    // 路線IndexStep
    this.indexStep = teamData.moveDirection === AntiTDEnemyTeamMoveDirection.CounterClockwise ? -1 : 1;
    // 目標點歸零
    this.targetPointIndex = 0;
  }

  /** 設置等待轉向
   * @param isWaiting 是否等待轉向
   * @param nowTime 現在時間
   */
  protected setWaiting(isWaiting: boolean, nowTime: number): void {
    this.isWaitingTurn = isWaiting;
    if (this.isWaitingTurn) {
      // 重置等待開始時間，並設定一個隨機間隔
      this.startWaitingTurnTime = nowTime;
      this.updateWaitingTurnInterval();
    }
  }

  /** 更新等待轉向時間 */
  private updateWaitingTurnInterval(): void {
    this.waitingTurnInterval = Phaser.Math.Between(500, 1500);
  }

  /** 更新轉向間隔時間 */
  private updateRandomTurnInterval(): void {
    this.randomTurnInterval = Phaser.Math.Between(2000, 3000);
  }

  /** 依照TargetRoutineList的路線移動
   * @param enemyTeam 敵人隊伍
   * @param nowTime 現在時間
   */
  protected moveByTargetRoutineList(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    // 是否正在等待轉向
    if (this.isWaitingTurn && nowTime - this.startWaitingTurnTime < this.waitingTurnInterval) {
      return;
    }

    // 查看隊伍是否已接近目標點
    const distanceToTarget = Phaser.Math.Distance.Between(
      enemyTeam.leader.x,
      enemyTeam.leader.y,
      this.targetRoutineList[this.targetRoutineIndex][this.targetPointIndex].x,
      this.targetRoutineList[this.targetRoutineIndex][this.targetPointIndex].y
    );

    // 當隊伍接近目標點或撞牆，向下一個目標點移動
    if (distanceToTarget <= this.toleranceDistance || enemyTeam.isBlocked) {
      // 標記進入等待狀態
      this.setWaiting(
        this.isWait(this.targetRoutineList[this.targetRoutineIndex][this.targetPointIndex], enemyTeam.isBlocked),
        nowTime
      );
      // 停止隊伍
      enemyTeam.stopTeam();

      // 撞到時是否折返
      if (this.isRevertIndexStepWhenBlocked) {
        // 若連續碰撞，則不折返(表示兩個點都到不了，持續往下找到可以行進的點)
        if (enemyTeam.isBlocked && this.isBlockLastFrame !== true) {
          // 逆向行進
          this.indexStep *= -1;
        }
        this.isBlockLastFrame = enemyTeam.isBlocked;
      }

      // 往下一個目標點移動
      this.targetPointIndex += this.indexStep;
      // 該路線的目標點都走完了之後，往下一個路線移動
      if (
        this.targetPointIndex >= this.targetRoutineList[this.targetRoutineIndex].length ||
        this.targetPointIndex < 0
      ) {
        // 往下一個路線移動
        this.targetRoutineIndex += this.indexStep;
        this.targetRoutineIndex = Phaser.Math.Wrap(this.targetRoutineIndex, 0, this.targetRoutineList.length);
        // 往下一個目標點移動
        this.targetPointIndex = Phaser.Math.Wrap(
          this.targetPointIndex,
          0,
          this.targetRoutineList[this.targetRoutineIndex].length
        );
      }
      return;
    }

    // 隊伍與目標點的夾角
    const rotation = Phaser.Math.Angle.Between(
      enemyTeam.leader.x,
      enemyTeam.leader.y,
      this.targetRoutineList[this.targetRoutineIndex][this.targetPointIndex].x,
      this.targetRoutineList[this.targetRoutineIndex][this.targetPointIndex].y
    );

    // 隊伍向目標點移動
    enemyTeam.setVelocityFromRotation(rotation);
    this.setWaiting(false, nowTime);
  }

  /** 範圍內隨機移動
   * @param enemyTeam 敵人隊伍
   * @param nowTime 現在時間
   */
  protected moveRandomByRange(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    // 是否正在等待轉向
    if (this.isWaitingTurn && nowTime - this.startWaitingTurnTime < this.waitingTurnInterval) {
      return;
    }

    // 查看隊伍是否已接近目標
    const isOutOfRange = this.isOutOfRange(enemyTeam);
    // 當隊伍超出範圍或轉向時間到
    if (this.isWaitingTurn === false && (isOutOfRange || nowTime - this.randomTurnTime > this.randomTurnInterval)) {
      // 標記進入等待狀態，撞牆轉向不等待
      this.setWaiting(this.isWait(this.originalPoint, enemyTeam.isBlocked), nowTime);
      // 停止隊伍
      enemyTeam.stopTeam();
      // 如果超出邊緣，設定目標往中心點
      this.isReturnToOriginal = isOutOfRange;
      return;
    }

    // 返回中心點
    if (this.isReturnToOriginal) {
      const rotation = Phaser.Math.Angle.Between(
        enemyTeam.leader.x,
        enemyTeam.leader.y,
        this.originalPoint.x,
        this.originalPoint.y
      );
      // 向中心點移動時附加隨機偏移
      enemyTeam.leader.forwardRotation =
        rotation + Phaser.Math.FloatBetween(-CombatNumber.Rad_45_Degree, CombatNumber.Rad_45_Degree);
      this.isReturnToOriginal = false;
      // 更新轉向時間
      this.randomTurnTime = nowTime;
      this.updateRandomTurnInterval();
    }
    // 隨機轉向
    else if (this.isWaitingTurn) {
      // 隨機改變角度
      const turnRotation = Phaser.Math.FloatBetween(-CombatNumber.Rad_90_Degree, CombatNumber.Rad_90_Degree);
      enemyTeam.leader.forwardRotation = enemyTeam.leader.forwardRotation + turnRotation;
      // 更新轉向時間
      this.randomTurnTime = nowTime;
      this.updateRandomTurnInterval();
    }
    // 不轉向，往前移動
    else {
      enemyTeam.leader.forwardRotation = enemyTeam.leader.body.velocity.angle();
    }

    enemyTeam.setVelocityFromRotation(enemyTeam.leader.forwardRotation);
    this.setWaiting(false, nowTime);
  }

  /** 各Strategy初始化
   * @param enemyTeam 敵人隊伍
   */
  protected abstract onInit(enemyTeam: AntiTDEnemyTeam): void;

  /** 是否要等待轉向
   * @param currentPoint 目前目標點
   * @param isBlock 是否撞牆
   */
  protected abstract isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean;

  /** 是否超出範圍
   * @param enemyTeam 敵人隊伍
   */
  protected abstract isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean;

  /** 移動隊伍
   * @param enemyTeam 敵人隊伍
   * @param nowTime
   */
  public abstract move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void;
}

/** 定點移動 */
export class FixedPointMove extends AntiTDMoveStrategy {
  public onInit(enemyTeam: AntiTDEnemyTeam): void {
    // 移動點1
    const fixedPoint1 = new Phaser.Math.Vector2(
      this.originalPoint.x + enemyTeam.teamData.movePointX1,
      this.originalPoint.y + enemyTeam.teamData.movePointY1
    );
    // 移動點2
    const fixedPoint2 = new Phaser.Math.Vector2(
      this.originalPoint.x + enemyTeam.teamData.movePointX2,
      this.originalPoint.y + enemyTeam.teamData.movePointY2
    );
    // 移動路線清單
    this.targetRoutineList = [
      [this.originalPoint, fixedPoint1],
      [this.originalPoint, fixedPoint2],
    ];
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return currentPoint !== this.originalPoint;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveByTargetRoutineList(enemyTeam, nowTime);
  }
}

/** 十字移動 */
export class CrossMove extends AntiTDMoveStrategy {
  protected onInit(enemyTeam: AntiTDEnemyTeam): void {
    const relativeMovePoint1 = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX1, enemyTeam.teamData.movePointY1);
    const relativeMovePoint2 = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX2, enemyTeam.teamData.movePointY2);

    // 初始化路線
    this.targetRoutineList = [];
    for (let index = 0; index < 4; index++) {
      const rotateRadians = index === 0 ? 0 : CombatNumber.Rad_90_Degree;
      const movePoint1 = this.originalPoint.clone().add(relativeMovePoint1.rotate(rotateRadians));
      const movePoint2 = this.originalPoint.clone().add(relativeMovePoint2.rotate(rotateRadians));
      this.targetRoutineList.push([this.originalPoint, movePoint1, this.originalPoint, movePoint2]);
    }
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return currentPoint !== this.originalPoint;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveByTargetRoutineList(enemyTeam, nowTime);
  }
}

/** 米字移動 */
export class StarMove extends AntiTDMoveStrategy {
  protected onInit(enemyTeam: AntiTDEnemyTeam): void {
    const relativeMovePoint1 = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX1, enemyTeam.teamData.movePointY1);
    const relativeMovePoint2 = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX2, enemyTeam.teamData.movePointY2);

    // 初始化路線
    this.targetRoutineList = [];
    for (let index = 0; index < 8; index++) {
      const rotateRadians = index === 0 ? 0 : CombatNumber.Rad_45_Degree;
      const movePoint1 = this.originalPoint.clone().add(relativeMovePoint1.rotate(rotateRadians));
      const movePoint2 = this.originalPoint.clone().add(relativeMovePoint2.rotate(rotateRadians));
      this.targetRoutineList.push([this.originalPoint, movePoint1, this.originalPoint, movePoint2]);
    }
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return currentPoint !== this.originalPoint;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveByTargetRoutineList(enemyTeam, nowTime);
  }
}

/** 圓形邊緣移動 */
export class CircleShapeMove extends AntiTDMoveStrategy {
  protected onInit(enemyTeam: AntiTDEnemyTeam): void {
    const relativeMovePoint = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX1, enemyTeam.teamData.movePointY1);

    // 初始化路線
    this.targetRoutineList = [];
    for (let index = 0; index < 8; index++) {
      const rotateRadians = index === 0 ? 0 : CombatNumber.Rad_45_Degree;
      const movePoint = this.originalPoint.clone().add(relativeMovePoint.rotate(rotateRadians));
      this.targetRoutineList.push([movePoint]);
    }

    // 碰撞時折返
    this.isRevertIndexStepWhenBlocked = true;
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return isBlock;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveByTargetRoutineList(enemyTeam, nowTime);
  }
}

/** 圓形範圍內隨機移動 */
export class CircleRandomMove extends AntiTDMoveStrategy {
  /** 圓形半徑 */
  private radius!: number;

  public onInit(enemyTeam: AntiTDEnemyTeam): void {
    const relativeMovePoint = new Phaser.Math.Vector2(enemyTeam.teamData.movePointX1, enemyTeam.teamData.movePointY1);
    // 紀錄半徑
    this.radius = relativeMovePoint.length();
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return isBlock === false;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    const distance = Phaser.Math.Distance.Between(
      enemyTeam.leader.x,
      enemyTeam.leader.y,
      this.originalPoint.x,
      this.originalPoint.y
    );
    return distance > this.radius;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveRandomByRange(enemyTeam, nowTime);
  }
}

/** 長方形邊緣移動 */
export class RectangleShapeMove extends AntiTDMoveStrategy {
  public onInit(enemyTeam: AntiTDEnemyTeam): void {
    // 紀錄邊界
    const rightEdgeX =
      enemyTeam.teamData.movePointX1 < 0 ? this.originalPoint.x : this.originalPoint.x + enemyTeam.teamData.movePointX1;
    const leftEdgeX =
      enemyTeam.teamData.movePointX2 < 0 ? this.originalPoint.x : this.originalPoint.x - enemyTeam.teamData.movePointX2;
    const buttomEdgeY =
      enemyTeam.teamData.movePointY1 < 0 ? this.originalPoint.y : this.originalPoint.y + enemyTeam.teamData.movePointY1;
    const topEdgeY =
      enemyTeam.teamData.movePointY2 < 0 ? this.originalPoint.y : this.originalPoint.y - enemyTeam.teamData.movePointY2;

    // 移動點1
    const fixedPoint1 = new Phaser.Math.Vector2(rightEdgeX, topEdgeY);
    // 移動點2
    const fixedPoint2 = new Phaser.Math.Vector2(rightEdgeX, buttomEdgeY);
    // 移動點3
    const fixedPoint3 = new Phaser.Math.Vector2(leftEdgeX, buttomEdgeY);
    // 移動點4
    const fixedPoint4 = new Phaser.Math.Vector2(leftEdgeX, topEdgeY);

    // 移動路線順序
    this.targetRoutineList = [[fixedPoint1, fixedPoint2, fixedPoint3, fixedPoint4]];
    // 碰撞時折返
    this.isRevertIndexStepWhenBlocked = true;
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return currentPoint !== this.originalPoint || isBlock;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveByTargetRoutineList(enemyTeam, nowTime);
  }
}

/** 長方形範圍內隨機移動 */
export class RectangleRandomMove extends AntiTDMoveStrategy {
  /** 左邊緣 */
  private rightEdgeX!: number;
  /** 右邊緣 */
  private leftEdgeX!: number;
  /** 上邊緣 */
  private buttomEdgeY!: number;
  /** 下邊緣 */
  private topEdgeY!: number;

  public onInit(enemyTeam: AntiTDEnemyTeam): void {
    // 紀錄邊界
    this.rightEdgeX =
      enemyTeam.teamData.movePointX1 < 0 ? Infinity : this.originalPoint.x + enemyTeam.teamData.movePointX1;
    this.leftEdgeX =
      enemyTeam.teamData.movePointX2 < 0 ? -Infinity : this.originalPoint.x - enemyTeam.teamData.movePointX2;
    this.buttomEdgeY =
      enemyTeam.teamData.movePointY1 < 0 ? Infinity : this.originalPoint.y + enemyTeam.teamData.movePointY1;
    this.topEdgeY =
      enemyTeam.teamData.movePointY2 < 0 ? -Infinity : this.originalPoint.y - enemyTeam.teamData.movePointY2;
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return isBlock === false;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return (
      enemyTeam.leader.x < this.leftEdgeX ||
      enemyTeam.leader.x > this.rightEdgeX ||
      enemyTeam.leader.y < this.topEdgeY ||
      enemyTeam.leader.y > this.buttomEdgeY
    );
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    this.moveRandomByRange(enemyTeam, nowTime);
  }
}

/** 不移動 */
export class DoNotMove extends AntiTDMoveStrategy {
  public onInit(enemyTeam: AntiTDEnemyTeam): void {
    /** */
  }

  protected isWait(currentPoint: Phaser.Math.Vector2, isBlock: boolean): boolean {
    return false;
  }

  protected isOutOfRange(enemyTeam: AntiTDEnemyTeam): boolean {
    return false;
  }

  public move(enemyTeam: AntiTDEnemyTeam, nowTime: number): void {
    const distanceToTarget = Phaser.Math.Distance.Between(
      enemyTeam.leader.x,
      enemyTeam.leader.y,
      this.originalPoint.x,
      this.originalPoint.y
    );

    // 到達目標點或撞牆
    if (distanceToTarget <= this.toleranceDistance || enemyTeam.isBlocked) {
      // 停止隊伍
      enemyTeam.stopTeam();
      // 隊伍與玩家的夾角
      const faceRotation = Phaser.Math.Angle.Between(
        enemyTeam.leader.x,
        enemyTeam.leader.y,
        enemyTeam.scene.heroTeamLeader.x,
        enemyTeam.scene.heroTeamLeader.y
      );
      // 看向玩家
      enemyTeam.battleUnits.forEach((enemy: AntiTDEnemy) => {
        enemy.forwardRotation = faceRotation;
      });
      return;
    }

    // 隊伍與目標的夾角
    const rotation = Phaser.Math.Angle.Between(
      enemyTeam.leader.x,
      enemyTeam.leader.y,
      this.originalPoint.x,
      this.originalPoint.y
    );

    enemyTeam.setVelocityFromRotation(rotation);
  }
}
