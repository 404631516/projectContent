import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import Fish from './Fish';

export enum FishEventId {
  /** 閒置 */
  Idle = 0,
  /** 海中游動 */
  Swim,
  /** 被釣中 */
  Caught,
  /** 躍出海面 */
  Jump,
  /** 從天空掉落 */
  Drop,
}

export enum FishStateId {
  /** 閒置 */
  Idle = 0,
  /** 海中游動 */
  Swim,
  /** 被釣中 */
  Caught,
  /** 躍出海面 */
  Jump,
  /** 從天空掉落 */
  Drop,
}

export default class FishFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<FishFSM> = new StateMachine<FishFSM>();

  /** 狀態Map */
  private stateMap: Map<FishStateId, State<FishFSM>> = new Map<FishStateId, State<FishFSM>>();

  /** 魚 */
  private _fish: Fish;
  public get fish(): Fish {
    return this._fish;
  }

  constructor(fish: Fish) {
    this._fish = fish;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(IdleState);
    this.stateMap.set(FishStateId.Idle, idleState);

    const swimState = this.stateMachine.createState(SwimState);
    this.stateMap.set(FishStateId.Swim, swimState);

    const caughtState = this.stateMachine.createState(CaughtState);
    this.stateMap.set(FishStateId.Caught, caughtState);

    const jumpState = this.stateMachine.createState(JumpState);
    this.stateMap.set(FishStateId.Jump, jumpState);

    const dropState = this.stateMachine.createState(DropState);
    this.stateMap.set(FishStateId.Drop, dropState);

    // set transition.
    this.stateMachine.setStatesTransition(FishEventId.Caught, caughtState, [swimState]);
    this.stateMachine.setStatesTransition(FishEventId.Jump, jumpState, [caughtState]);

    // any transition.
    this.stateMachine.setAnyStateTransition(FishEventId.Idle, idleState);
    this.stateMachine.setAnyStateTransition(FishEventId.Swim, swimState);
    this.stateMachine.setAnyStateTransition(FishEventId.Drop, dropState);
  }

  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(FishStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: FishStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class IdleState extends State<FishFSM> {
  public onEnter(): void {
    this.getTarget().fish.onIdleEnter();
  }
}

class SwimState extends State<FishFSM> {
  public onEnter(): void {
    this.getTarget().fish.onSwimEnter();
  }

  public onLeave(): void {
    this.getTarget().fish.onSwimLeave();
  }
}

class CaughtState extends State<FishFSM> {
  public onEnter(): void {
    this.getTarget().fish.onCaughtEnter();
  }
}

class JumpState extends State<FishFSM> {
  public onEnter(): void {
    this.getTarget().fish.onJumpEnter();
  }
}

class DropState extends State<FishFSM> {
  public onEnter(): void {
    this.getTarget().fish.onDropEnter();
  }
}
