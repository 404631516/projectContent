import { BattleUnitAttackMode } from '@/helper/enum/Combat';
import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import BattleUnitFSM, { BattleUnitEventId } from '../../../../Scripts/Components/Combat/Battle/BattleUnitFSM';

export default class AntiTDBattleUnitFSM extends BattleUnitFSM<BattleUnit<HeroData>> {
  constructor(unit: BattleUnit<HeroData>) {
    super(unit, Idle, Active, Dead);
  }
}

class Idle extends State<AntiTDBattleUnitFSM> {
  /** Idle待機時間 */
  private readonly idleTime: number = 1200;
  /** 經過時間 */
  private elapsedTime: number = 0;

  public onEnter(): void {
    this.elapsedTime = 0;
  }

  public onUpdate(time: number, delta: number): void {
    const unit = this.getTarget().unit;
    switch (unit.attackMode) {
      // 主動攻擊類型，一定時間後或受傷才切換到啟動狀態
      case BattleUnitAttackMode.Active:
        this.elapsedTime += delta;
        if (this.elapsedTime > this.idleTime || unit.isFullHp === false) {
          this.triggerEvent(BattleUnitEventId.Active);
        }
        break;
      // 被動攻擊類型，受傷了才切換到啟動狀態
      case BattleUnitAttackMode.Passive:
        if (unit.isFullHp === false) {
          this.triggerEvent(BattleUnitEventId.Active);
        }
        break;
      // 不攻擊類型，永遠不會切換到啟動狀態
      case BattleUnitAttackMode.DoNotAttack:
        break;
    }
  }
}

class Active extends State<AntiTDBattleUnitFSM> {
  public onEnter(): void {
    this.getTarget().unit.onActiveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    this.getTarget().unit.onActiveUpdate();
  }
}

class Dead extends State<AntiTDBattleUnitFSM> {
  public onEnter(): void {
    const unit = this.getTarget().unit;
    unit.onDeadEnter();
  }
}
