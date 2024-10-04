import { HeroData } from '@/manager/TableManager';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BattleTeamFSM from './BattleTeamFSM';
import { BattleTeamEventId, BattleTeamStateId } from './BattleTeamFSM';
import BattleUnit from './BattleUnit';

/** 路徑，紀錄位置與轉向 */
interface Path {
  /** 位置 */
  point: Phaser.Geom.Point;
  /** 轉向 */
  rotation: number;
}

/** 多個battleUnit組成一個Team一起移動 */
export abstract class BattleTeam<T extends BattleUnit<HeroData>> extends Object2D {
  //#region decalre、readonly
  /** 隊員之間的間隔 */
  protected readonly battleUnitSpacing: number = 20;
  //#endregion decalre、readonly

  //#region variable、properties
  /** 狀態機 */
  protected abstract fsm: BattleTeamFSM<BattleTeam<BattleUnit<HeroData>>>;
  /** 隊伍路徑 */
  private path: Path[] = [];
  /** 全體隊員 */
  protected _battleUnits: T[] = [];
  public get battleUnits(): T[] {
    return this._battleUnits;
  }
  /** 取得隊長(第一位隊員) */
  public get leader(): T {
    return this._battleUnits[0];
  }
  /** 取得最後一位隊員 */
  public get lastUnit(): T {
    return this._battleUnits[this._battleUnits.length - 1];
  }
  //#endregion variable、properties

  //#region constructor、Phaser function
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  /** 在update處理移動邏輯
   * @param time 當下時間
   * @param delta 每一幀間隔
   */
  public update(time: number, delta: number): void {
    this.fsm.update(time, delta);
  }
  //#endregion constructor、Phaser function

  //#region fsm
  /** 觸發死亡狀態 */
  public dead(): void {
    this.fsm.stateMachine.triggerEvent(BattleTeamEventId.Dead);
  }
  /** 是否為死亡狀態 */
  public isDead(): boolean {
    return this.fsm.isCurrentState(BattleTeamStateId.Dead);
  }
  /** 觸發移動狀態 */
  public move(): void {
    this.fsm.stateMachine.triggerEvent(BattleTeamEventId.Move);
  }
  //#endregion fsm

  //#region callback
  /** 當戰鬥單位死亡 */
  public abstract onUnitDie(unit: T): void;
  /** 重整隊伍時Callback */
  public abstract onSortTeamOrder(): void;
  //#endregion callback

  //#region BattleTeam 隊伍功能
  /** 設置隊伍
   * @param battleUnits 全體隊員(包含隊長)，隊長放陣列最前面
   */
  public setTeam(battleUnits: T[]): void {
    // 紀錄全體隊員
    this._battleUnits = battleUnits;
    this._battleUnits.forEach((battleUnit: T) => battleUnit.setTeam(this));
    // 隊長開啟邊界碰撞
    this.leader.body.onWorldBounds = true;
    this.leader.body.collideWorldBounds = true;

    //  初始化路徑
    this.setPath(0);

    // 啟動
    this.setActive(true);
    this.fsm.start();
  }

  /** 新增battleUnit到隊伍末端
   * @param battleUnit 成員
   */
  public addBattleUnit(battleUnit: T): void {
    // 新增到隊伍末端
    battleUnit.setPosition(this.lastUnit.x, this.lastUnit.y);
    this._battleUnits.push(battleUnit);
    battleUnit.setTeam(this);

    // 增加隊伍路徑點
    this.setPath(this.path.length);

    // 重整隊伍順序
    this.sortTeamOrder();
  }

  /** 設置隊伍路徑
   * @param start 從哪個路徑點開始設置
   */
  protected setPath(start: number): void {
    for (let i = start; i <= this._battleUnits.length * this.battleUnitSpacing; i++) {
      this.path[i] = {
        point: new Phaser.Geom.Point(this.lastUnit.x, this.lastUnit.y),
        rotation: 0,
      };
    }

    // 去除過長的路徑點
    this.path.splice(this._battleUnits.length * this.battleUnitSpacing + 1);
  }

  /** 隊伍停止移動 */
  public stopTeam(): void {
    this.leader.body.setVelocity(0);
    this._battleUnits.forEach((battleUnit: T) => {
      battleUnit.pauseAnim();
    });
  }

  /** 暫停動畫並回復第一幀 */
  public resetAnimeSprite(): void {
    this._battleUnits.forEach((battleUnit: T) => {
      battleUnit.pauseAnim(0);
    });
  }

  /** 隊伍移動(有動畫) */
  public moveTeamWithAnimation(): void {
    this.moveTeam(true);
  }

  /** 隊伍移動(無動畫) */
  public moveTeamWithoutAnimation(): void {
    this.moveTeam(false);
  }

  /** 隊伍移動
   *  @param hasAnimation 有無動畫
   */
  private moveTeam(hasAnimation: boolean): void {
    // 位於下方的角色顯示在最上層
    this._battleUnits.forEach((battleUnit: T) => {
      if (Math.abs(battleUnit.depth - battleUnit.y) > 2) {
        battleUnit.setDepth(battleUnit.y);
      }
      if (hasAnimation) {
        battleUnit.resumeAnim();
      } else {
        battleUnit.pauseAnim();
      }
    });

    // 取出最後一個路徑
    const part = this.path.pop() ?? { point: new Phaser.Geom.Point(0, 0), rotation: 0 };

    // 紀錄位置及轉向後存放到第一個
    part.point.setTo(this._battleUnits[0].x, this._battleUnits[0].y);
    part.rotation = this._battleUnits[0].forwardRotation;
    this.path.unshift(part);

    // 更新隊伍中每位隊員位置及轉向
    for (let i = 1; i <= this._battleUnits.length - 1; i++) {
      const previousPath = this.path[i * this.battleUnitSpacing];
      this._battleUnits[i].x = previousPath.point.x;
      this._battleUnits[i].y = previousPath.point.y;
      this._battleUnits[i].forwardRotation = previousPath.rotation;
    }
  }

  /** 重整隊伍順序 */
  public sortTeamOrder(): void {
    // 先停止現任隊長的移動速度
    this.leader.body.setVelocity(0);

    // 變成幽靈的隊友排最後面
    this._battleUnits.sort((a: T, b: T) => {
      // 依照隊伍順序排
      let result = a.teamOrder - b.teamOrder;
      // 死亡的必定排在後面
      if (a.isAlive === true && b.isAlive === false) {
        result = -1;
      } else if (a.isAlive === false && b.isAlive === true) {
        result = 1;
      }
      // 交換站位
      if (result < 0) {
        const bx = b.x;
        const by = b.y;
        b.x = a.x;
        b.y = a.y;
        a.x = bx;
        a.y = by;
      }
      return result;
    });

    this.onSortTeamOrder();
  }

  /** 依照角度給予加速度 */
  public setVelocityFromRotation(rotation: number): void {
    // 設置隊長面向的角度
    this.leader.forwardRotation = rotation;
    // 設置隊長的加速度
    this.leader.body.velocity = this.scene.physics.velocityFromRotation(this.leader.forwardRotation, this.leader.speed);
    // 設置隊伍跟隨移動
    this.leader.body.velocity.length() === 0 ? this.stopTeam() : this.moveTeamWithAnimation();
  }

  /** 取得隊長在螢幕中相對位置
   * @returns 隊長在螢幕中相對位置
   */
  protected getLeaderPositionOnScreen(): Phaser.Math.Vector2 {
    // 遊戲主攝影機
    const camera = this.scene.cameras.main;
    // 將隊長世界座標轉換成螢幕座標
    const leaderPosition = new Phaser.Math.Vector2(
      (this.leader.body.center.x - camera.worldView.x) * camera.zoom,
      (this.leader.body.center.y - camera.worldView.y) * camera.zoom
    );
    return leaderPosition;
  }

  /** 取得隊長與鼠標之間距離
   * @returns 隊長與鼠標之間距離
   */
  protected getleaderDiatanceToPointer(): number {
    const leaderPosition = this.getLeaderPositionOnScreen();

    return Phaser.Math.Distance.Between(
      leaderPosition.x,
      leaderPosition.y,
      this.scene.input.activePointer.x,
      this.scene.input.activePointer.y
    );
  }
  //#endregion BattleTeam 隊伍功能
}
