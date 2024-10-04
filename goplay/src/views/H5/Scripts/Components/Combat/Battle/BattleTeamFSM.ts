import { HeroData } from '@/manager/TableManager';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { BattleTeam } from './BattleTeam';
import BattleUnit from './BattleUnit';

export enum BattleTeamEventId {
  /** 進入閒置 */
  Idle = 0,
  /** 進入移動 */
  Move,
  /** 死亡 */
  Dead,
}

export enum BattleTeamStateId {
  /** 閒置 */
  Idle = 0,
  /** 移動 */
  Move,
  /** 死亡 */
  Dead,
}

export default class BattleTeamFSM<T extends BattleTeam<BattleUnit<HeroData>>> {
  /** 狀態機 */
  public stateMachine: StateMachine<BattleTeamFSM<T>> = new StateMachine<BattleTeamFSM<T>>();

  /** 狀態Map */
  private stateMap: Map<BattleTeamStateId, State<BattleTeamFSM<T>>> = new Map<
    BattleTeamStateId,
    State<BattleTeamFSM<T>>
  >();

  /** 隊伍 */
  private _team: T;
  public get team(): T {
    return this._team;
  }

  constructor(
    team: T,
    idleStateType: new () => State<BattleTeamFSM<T>>,
    moveStateType: new () => State<BattleTeamFSM<T>>,
    deadStateType: new () => State<BattleTeamFSM<T>>
  ) {
    this._team = team;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(idleStateType);
    this.stateMap.set(BattleTeamStateId.Idle, idleState);

    const moveState = this.stateMachine.createState(moveStateType);
    this.stateMap.set(BattleTeamStateId.Move, moveState);

    const deadState = this.stateMachine.createState(deadStateType);
    this.stateMap.set(BattleTeamStateId.Dead, deadState);

    // set transition.
    this.stateMachine.setStatesTransition(BattleTeamEventId.Move, moveState, [idleState]);
    this.stateMachine.setStatesTransition(BattleTeamEventId.Idle, idleState, [moveState]);
    // any transition.
    this.stateMachine.setAnyStateTransition(BattleTeamEventId.Dead, deadState);
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(BattleTeamStateId.Idle);

    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: BattleTeamStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}
