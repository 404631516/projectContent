import { AntiTDEnemyTeamData } from '@/manager/TableManager';
import { BattleTeam } from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeam';
import { AntiTDNumber } from '../../Data/AntiTDConfig';
import AntiTDGameScene from '../../Scenes/AntiTDGameScene';
import AntiTDEnemySpawnPoint from '../AntiTDEnemySpawnPoint';
import { AntiTDEnemyTeamFSM, AntiTDHeroTeamFSM } from './AntiTDBattleTeamFSM';
import { AntiTDEnemy, AntiTDHero } from './AntiTDBattleUnit';
import AntiTDMoveStrategy, {
  CircleRandomMove,
  CircleShapeMove,
  CrossMove,
  DoNotMove,
  FixedPointMove,
  RectangleRandomMove,
  RectangleShapeMove,
  StarMove,
} from './AntiTDMoveStrategy';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';
import { CompassRad } from '@/views/H5/Helper/MathHelper';

/** 英雄隊伍 */
export class AntiTDHeroTeam extends BattleTeam<AntiTDHero> {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;

  protected fsm: AntiTDHeroTeamFSM = new AntiTDHeroTeamFSM(this);

  /** 鍵盤操控 */
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.cursorKeys = this.scene.input.keyboard!.createCursorKeys();
  }

  /** 當戰鬥單位死亡 */
  public onUnitDie(unit: AntiTDHero): void {
    this.sortTeamOrder();

    if (this.leader.isAlive === false) {
      this.dead();
    }
  }

  /** 進入閒置狀態 */
  public onIdleEnter(): void {
    this.stopTeam();
  }

  /** 更新隊伍
   * @param time 時間
   * @param delta 每幀間隔
   */
  public onMoveUpdate(time: number, delta: number): void {
    // 8 方向移動
    const cursorKeyRotation = PhaserHelper.getCursorKeyDirectionRad(this.cursorKeys);

    // 假如有按任何方向鍵，完全忽略鼠標
    if (cursorKeyRotation !== CompassRad.None) {
      // 給予加速度
      this.setVelocityFromRotation(cursorKeyRotation);
      return;
    }

    const pointer = this.scene.input.activePointer;
    // 滑鼠在UI位置上，暫停移動
    if (this.scene.isPointerAboveItemDialog(pointer)) {
      this.stopTeam();
      return;
    }

    // 或鼠標放開時，或滑鼠離英雄隊長很靠近時，暫停移動
    if (pointer.isDown === false || this.getleaderDiatanceToPointer() < this.leader.width / 4) {
      this.stopTeam();
      return;
    }

    // 當鼠標按著
    if (pointer.isDown) {
      // 計算轉向，面對鼠標
      const leaderPosition = this.getLeaderPositionOnScreen();
      const pointerRotation = Math.atan2(pointer.y - leaderPosition.y, pointer.x - leaderPosition.x);
      // 給予加速度
      this.setVelocityFromRotation(pointerRotation);
    }
  }

  /** 當隊伍死亡 */
  public onDeadEnter(): void {
    this.stopTeam();
  }

  /** 當隊伍重整 */
  public onSortTeamOrder(): void {
    // 鏡頭跟上新的隊長
    this.scene.cameras.main.startFollow(this.leader);
    this.scene.cameras.main.setFollowOffset(0, -AntiTDNumber.CameraOffsetY);
    this.scene.updateHeroItems(this.battleUnits);
  }
}

export abstract class AntiTDEnemyTeam extends BattleTeam<AntiTDEnemy> {
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;

  protected fsm: AntiTDEnemyTeamFSM = new AntiTDEnemyTeamFSM(this);

  /** 敵人隊伍資料 */
  public teamData!: AntiTDEnemyTeamData;
  /** 出生點 */
  private spawnPoint!: AntiTDEnemySpawnPoint;
  /** 是否撞牆 */
  public get isBlocked(): boolean {
    return (
      this.leader.body.blocked.down ||
      this.leader.body.blocked.left ||
      this.leader.body.blocked.up ||
      this.leader.body.blocked.right
    );
  }
  /** 移動模式策略 */
  protected abstract moveStrategy: AntiTDMoveStrategy;

  /** 設置隊伍
   * @param battleUnits 全體隊員(包含隊長)，隊長放陣列最前面
   * @param teamData 隊伍資料
   * @param spawnPoint 隊伍出生點
   */
  public setTeamByTeamData(
    battleUnits: AntiTDEnemy[],
    teamData: AntiTDEnemyTeamData,
    spawnPoint: AntiTDEnemySpawnPoint,
  ): void {
    // 紀錄隊伍資料
    this.teamData = teamData;
    // 紀錄出生點
    this.spawnPoint = spawnPoint;
    // 出生點增加活著的敵人隊伍數量
    this.spawnPoint.spawnedLivingEnemyCount += 1;
    // 紀錄全體隊員
    this.setTeam(battleUnits);
    // 初始化移動模式
    this.moveStrategy.init(this);
  }

  public onUnitDie(unit: AntiTDEnemy): void {
    // 找到死亡單位的隊伍順序
    const deadUnitIndex = this._battleUnits.indexOf(unit);
    if (deadUnitIndex === -1) {
      return;
    }

    // 更新隊伍，並取得死亡單位列表
    const deadUnits = this._battleUnits.splice(deadUnitIndex);
    // 排除觸發onUnitDie的第一個死亡單位
    deadUnits.shift();
    // 排在第一個死亡單位後的都會跟著死亡
    deadUnits.forEach((deadUnit: AntiTDEnemy) => {
      deadUnit.updateHpByPercentageWithoutPopUp(-100);
    });

    // 假如沒有任何單位活著，觸發隊伍死亡
    if (this._battleUnits.length === 0) {
      this.dead();
    }
  }

  /** 更新隊伍
   * @param time 時間
   * @param delta 每幀間隔
   */
  public onMoveUpdate(time: number, delta: number): void {
    this.moveStrategy.move(this, time);
  }

  public onDeadEnter(): void {
    // 將自己回收
    this.scene.combatGroups.hideMemberFromGroup(this.teamData.moveMode, this);
    // 出生點減少活著的敵人隊伍數量
    this.spawnPoint.spawnedLivingEnemyCount -= 1;
    // 通知遊戲場景隊伍死亡
    this.scene.onEnemyTeamDead();
  }

  public onSortTeamOrder(): void {
    /** */
  }
}

/** 兩點定點移動的敵人隊伍 */
export class FixedPointMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new FixedPointMove();
}

/** 十字移動的敵人隊伍 */
export class CrossMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new CrossMove();
}

/** 米字移動的敵人隊伍 */
export class StarMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new StarMove();
}

/** 圓形邊緣上移動的敵人隊伍 */
export class CircleShapeMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new CircleShapeMove();
}

/** 圓形範圍內隨機移動的敵人隊伍 */
export class CircleRandomMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new CircleRandomMove();
}

/** 長方形範圍內隨機移動的敵人隊伍 */
export class RectangleRandomMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new RectangleRandomMove();
}

/** 長方形邊緣上移動的敵人隊伍 */
export class RectangleShapeMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new RectangleShapeMove();
}

/** 不移動的敵人隊伍 */
export class DoNotMoveEnemyTeam extends AntiTDEnemyTeam {
  protected moveStrategy: AntiTDMoveStrategy = new DoNotMove();
}
