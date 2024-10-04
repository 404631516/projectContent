import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { SpaceInvadersEnemy } from './SpaceInvadersEnemy';

export enum SpaceInvadersEnemyEventId {
  /** 出生 */
  Spawn = 0,
  /** 移動到場中 */
  MoveToPatrolPosition,
  /** 場中巡邏 */
  Patrol,
  /** 移動到離場位置 */
  MoveToExitPosition,
  /** Z字移動向下 */
  MoveZigzagDown,
  /** 離開場外 */
  Exit,
}

export default class SpaceInvadersEnemyFSM extends StateMachine<SpaceInvadersEnemy> {
  constructor(enemy: SpaceInvadersEnemy) {
    super();
    this.setTarget(enemy);

    // create states.
    const spawnState = this.createState(Spawn);
    const moveToPatrolPositionState = this.createState(MoveToPatrolPosition);
    const patrolState = this.createState(Patrol);
    const moveToExitPositionState = this.createState(MoveToExitPosition);
    const moveZigzagDownState = this.createState(MoveZigzagDown);
    const exitState = this.createState(Exit);

    // set transition.
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.Spawn, spawnState);
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.MoveToPatrolPosition, moveToPatrolPositionState);
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.Patrol, patrolState);
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.MoveToExitPosition, moveToExitPositionState);
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.MoveZigzagDown, moveZigzagDownState);
    this.setAnyStateTransition(SpaceInvadersEnemyEventId.Exit, exitState);

    this.initState(spawnState);
  }
}

/** 出生 */
class Spawn extends State<SpaceInvadersEnemy> {
  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onSpawnEnter();
  }
}

/** 移動到巡邏點 */
class MoveToPatrolPosition extends State<SpaceInvadersEnemy> {
  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onMoveToPatrolPositionEnter();
  }
}

/** 巡邏 */
class Patrol extends State<SpaceInvadersEnemy> {
  /** 巡邏結束時間點 */
  private patrolExitTime: number = 0;

  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onPatrolEnter();
  }

  public onUpdate(time: number, delta: number): void {
    // 如果巡邏結束時間點為0, 則設定巡邏結束時間點
    if (this.patrolExitTime === 0) {
      const enemy = this.getTarget();
      this.patrolExitTime = time + enemy.getPatrolStateDuration();
    }
    // 若超過巡邏結束時間點, 則切換到移動離場狀態
    if (time >= this.patrolExitTime) {
      this.triggerEvent(SpaceInvadersEnemyEventId.MoveToExitPosition);
    }
  }
}

/** 移動到離場點 */
class MoveToExitPosition extends State<SpaceInvadersEnemy> {
  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onMoveToExitPositionEnter();
  }
}

/** Z字移動向下 */
class MoveZigzagDown extends State<SpaceInvadersEnemy> {
  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onMoveZigzagDownEnter();
  }
}

/** 安然離場 */
class Exit extends State<SpaceInvadersEnemy> {
  public onEnter(): void {
    const enemy = this.getTarget();
    enemy.onExitEnter();
  }
}
