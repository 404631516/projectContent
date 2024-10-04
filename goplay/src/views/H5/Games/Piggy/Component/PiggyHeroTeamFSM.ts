import BattleTeamFSM from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeamFSM';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import { PiggyHeroTeam } from './PiggyHeroTeam';

export class PiggyHeroTeamFSM extends BattleTeamFSM<PiggyHeroTeam> {
  constructor(team: PiggyHeroTeam) {
    super(team, HeroTeamIdle, HeroTeamMove, HeroTeamDead);
  }
}

class HeroTeamIdle extends State<BattleTeamFSM<PiggyHeroTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onIdleEnter();
  }
}

class HeroTeamMove extends State<BattleTeamFSM<PiggyHeroTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onMoveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const team = this.getTarget().team;
    team.onMoveUpdate(time, delta);
  }

  public onLeave(): void {
    const team = this.getTarget().team;
    team.onMoveLeave();
  }
}

class HeroTeamDead extends State<BattleTeamFSM<PiggyHeroTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onDeadEnter();
  }
}
