import { AntiTDEnemyData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BattleUnitFSM, { BattleUnitEventId } from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnitFSM';
import State from '@/views/H5/Scripts/Components/StateMachine/State';

export default class PiggyEnemyFSM extends BattleUnitFSM<BattleUnit<AntiTDEnemyData>> {
  constructor(unit: BattleUnit<AntiTDEnemyData>) {
    super(unit, Idle, Active, Dead);
  }
}

class Idle extends State<PiggyEnemyFSM> {
  /** 最小閒置距離 */
  private readonly minIdleDistance: number = 20;
  /** 最大閒置距離 */
  private readonly maxIdleDistance: number = 100;
  /** 隨機時間開始攻擊 */
  private idleDistance: number = 0;

  public onEnter(): void {
    // 隨機閒置距離開始攻擊
    this.idleDistance = Phaser.Math.Between(this.minIdleDistance, this.maxIdleDistance);
  }

  public onUpdate(time: number, delta: number): void {
    const unit = this.getTarget().unit;
    if (unit.y - unit.scene.worldTopEdgeY > this.idleDistance) {
      this.triggerEvent(BattleUnitEventId.Active);
    }
  }
}

class Active extends State<PiggyEnemyFSM> {
  public onEnter(): void {
    const unit = this.getTarget().unit;
    unit.onActiveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const unit = this.getTarget().unit;
    unit.onActiveUpdate();
  }
}

class Dead extends State<PiggyEnemyFSM> {
  public onEnter(): void {
    const unit = this.getTarget().unit;
    unit.onDeadEnter();
  }
}
