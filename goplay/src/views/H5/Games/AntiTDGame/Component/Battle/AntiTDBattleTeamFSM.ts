import BattleTeamFSM, { BattleTeamStateId } from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeamFSM';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import { AntiTDEnemyTeam, AntiTDHeroTeam } from './AntiTDBattleTeam';

export class AntiTDHeroTeamFSM extends BattleTeamFSM<AntiTDHeroTeam> {
  constructor(team: AntiTDHeroTeam) {
    super(team, HeroTeamIdle, HeroTeamMove, HeroTeamDead);
  }
}

class HeroTeamIdle extends State<BattleTeamFSM<AntiTDHeroTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onIdleEnter();
  }
}

class HeroTeamMove extends State<BattleTeamFSM<AntiTDHeroTeam>> {
  public onUpdate(time: number, delta: number): void {
    const team = this.getTarget().team;
    team.onMoveUpdate(time, delta);
  }
}

class HeroTeamDead extends State<BattleTeamFSM<AntiTDHeroTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onDeadEnter();
  }
}

export class AntiTDEnemyTeamFSM extends BattleTeamFSM<AntiTDEnemyTeam> {
  constructor(team: AntiTDEnemyTeam) {
    super(team, EnemyTeamIdle, EnemyTeamMove, EnemyTeamDead);
  }
}

class EnemyTeamIdle extends State<BattleTeamFSM<AntiTDEnemyTeam>> {
  public onEnter(): void {
    this.triggerEvent(BattleTeamStateId.Move);
  }
}

class EnemyTeamMove extends State<BattleTeamFSM<AntiTDEnemyTeam>> {
  public onUpdate(time: number, delta: number): void {
    const team = this.getTarget().team;
    team.onMoveUpdate(time, delta);
  }
}

class EnemyTeamDead extends State<BattleTeamFSM<AntiTDEnemyTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onDeadEnter();
  }
}
