import { HeroData } from '@/manager/TableManager';
import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import BattleUnit from './BattleUnit';

export enum BattleUnitEventId {
  /** 進入閒置 */
  Idle = 0,
  /** 發動攻擊 */
  Active,
  /** 死亡 */
  Dead,
}

export enum BattleUnitStateId {
  /** 閒置 */
  Idle = 0,
  /** 攻擊 */
  Active,
  /** 死亡 */
  Dead,
}

export default class BattleUnitFSM<T extends BattleUnit<HeroData>> {
  /** 狀態機 */
  public stateMachine: StateMachine<BattleUnitFSM<T>> = new StateMachine<BattleUnitFSM<T>>();

  /** 狀態Map */
  private stateMap: Map<BattleUnitStateId, State<BattleUnitFSM<T>>> = new Map<
    BattleUnitStateId,
    State<BattleUnitFSM<T>>
  >();

  /** 戰鬥角色 */
  private _unit: T;
  public get unit(): T {
    return this._unit;
  }

  constructor(
    unit: T,
    idleStateType: new () => State<BattleUnitFSM<T>>,
    activeStateType: new () => State<BattleUnitFSM<T>>,
    deadStateType: new () => State<BattleUnitFSM<T>>
  ) {
    this._unit = unit;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(idleStateType);
    this.stateMap.set(BattleUnitStateId.Idle, idleState);

    const moveState = this.stateMachine.createState(activeStateType);
    this.stateMap.set(BattleUnitStateId.Active, moveState);

    const deadState = this.stateMachine.createState(deadStateType);
    this.stateMap.set(BattleUnitStateId.Dead, deadState);

    // set transition.
    this.stateMachine.setStatesTransition(BattleUnitEventId.Active, moveState, [idleState]);
    this.stateMachine.setStatesTransition(BattleUnitEventId.Idle, idleState, [moveState]);
    // any transition.
    this.stateMachine.setAnyStateTransition(BattleUnitEventId.Dead, deadState);
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(BattleUnitStateId.Idle);

    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param stateID 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: BattleUnitStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}
