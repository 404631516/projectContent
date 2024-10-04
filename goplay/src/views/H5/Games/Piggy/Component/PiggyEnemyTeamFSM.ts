import BattleTeamFSM from '@/views/H5/Scripts/Components/Combat/Battle/BattleTeamFSM';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import { PiggyEnemyTeam } from './PiggyEnemyTeam';

export class PiggyEnemyTeamFSM extends BattleTeamFSM<PiggyEnemyTeam> {
  constructor(team: PiggyEnemyTeam) {
    super(team, EnemyTeamIdle, EnemyTeamMove, EnemyTeamDead);
  }
}

class EnemyTeamIdle extends State<BattleTeamFSM<PiggyEnemyTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.move();
  }
}

class EnemyTeamMove extends State<BattleTeamFSM<PiggyEnemyTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onMoveEnter();
  }

  public onUpdate(time?: number, delta?: number): void {
    const team = this.getTarget().team;
    team.onMoveUpdate();
  }
}

class EnemyTeamDead extends State<BattleTeamFSM<PiggyEnemyTeam>> {
  public onEnter(): void {
    const team = this.getTarget().team;
    team.onDeadEnter();
  }
}
