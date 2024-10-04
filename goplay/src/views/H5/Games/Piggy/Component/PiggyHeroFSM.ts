import { HeroData } from '@/manager/TableManager';
import BattleUnit from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnit';
import BattleUnitFSM from '@/views/H5/Scripts/Components/Combat/Battle/BattleUnitFSM';
import State from '@/views/H5/Scripts/Components/StateMachine/State';

export default class PiggyHeroFSM extends BattleUnitFSM<BattleUnit<HeroData>> {
  constructor(unit: BattleUnit<HeroData>) {
    super(unit, Idle, Active, Dead);
  }
}

class Idle extends State<PiggyHeroFSM> {}

class Active extends State<PiggyHeroFSM> {
  public onEnter(): void {
    const unit = this.getTarget().unit;
    unit.onActiveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const unit = this.getTarget().unit;
    unit.onActiveUpdate();
  }
}

class Dead extends State<PiggyHeroFSM> {
  public onEnter(): void {
    const unit = this.getTarget().unit;
    unit.onDeadEnter();
  }
}
