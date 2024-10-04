import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import FishingHero from './TestHero';

export enum TestHeroEventId {
  /** 進入閒置 */
  Idle = 0,
  /** 進入移動 */
  Move,
  /** 發射魚竿 */
  Cast,
  /** 拉起魚竿 */
  PullUp,
  /** 發射魚網 */
  CastNet,
  /** 拉起魚網 */
  PullUpNet,
  /** 死亡 */
  Dead,
}

export enum TestHeroStateId {
  /** 閒置 */
  Idle = 0,
  /** 移動 */
  Move,
  /** 發射魚竿 */
  Cast,
  /** 拉起魚竿 */
  PullUp,
  /** 發射魚網 */
  CastNet,
  /** 拉起魚網 */
  PullUpNet,
  /** 死亡 */
  Dead,
}

export default class TestHeroFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<TestHeroFSM> = new StateMachine<TestHeroFSM>();

  /** 狀態Map */
  private stateMap: Map<TestHeroStateId, State<TestHeroFSM>> = new Map<TestHeroStateId, State<TestHeroFSM>>();

  /** 英雄角色 */
  private _hero: FishingHero;
  public get hero(): FishingHero {
    return this._hero;
  }

  constructor(inhero: FishingHero) {
    this._hero = inhero;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(IdleState);
    this.stateMap.set(TestHeroStateId.Idle, idleState);

    const moveState = this.stateMachine.createState(MoveState);
    this.stateMap.set(TestHeroStateId.Move, moveState);

    const castState = this.stateMachine.createState(CastState);
    this.stateMap.set(TestHeroStateId.Cast, castState);

    const pullUpState = this.stateMachine.createState(PullUpState);
    this.stateMap.set(TestHeroStateId.PullUp, pullUpState);

    const castNetState = this.stateMachine.createState(CastNetState);
    this.stateMap.set(TestHeroStateId.CastNet, castNetState);

    const pullUpNetState = this.stateMachine.createState(PullUpNetState);
    this.stateMap.set(TestHeroStateId.PullUpNet, pullUpNetState);

    const deadState = this.stateMachine.createState(DeadState);
    this.stateMap.set(TestHeroStateId.Dead, deadState);

    // set transition.
    this.stateMachine.setStatesTransition(TestHeroEventId.Move, moveState, [idleState, pullUpState, pullUpNetState]);

    this.stateMachine.setStatesTransition(TestHeroEventId.Cast, castState, [moveState]);
    this.stateMachine.setStatesTransition(TestHeroEventId.CastNet, castNetState, [moveState]);

    this.stateMachine.setStatesTransition(TestHeroEventId.PullUp, pullUpState, [castState]);
    this.stateMachine.setStatesTransition(TestHeroEventId.PullUpNet, pullUpNetState, [castNetState]);

    // any transition.
    this.stateMachine.setAnyStateTransition(TestHeroEventId.Dead, deadState);
  }

  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(TestHeroStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: TestHeroStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class IdleState extends State<TestHeroFSM> {
  public onEnter(): void {
    // Do nothing.
  }
}

class MoveState extends State<TestHeroFSM> {
  public onUpdate(delta: number): void {
    this.getTarget().hero.onMoveUpdate(delta);
  }
}

class CastState extends State<TestHeroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onCastEnter();
  }

  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onCastUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(TestHeroEventId.PullUp);
    }
  }
}

class PullUpState extends State<TestHeroFSM> {
  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onPullUpUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(TestHeroEventId.Move);
    }
  }

  public onLeave(): void {
    this.getTarget().hero.onPullUpLeave();
  }
}

class CastNetState extends State<TestHeroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onCastNetEnter();
  }

  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onCastNetUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(TestHeroEventId.PullUpNet);
    }
  }
}

class PullUpNetState extends State<TestHeroFSM> {
  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onPullUpNetUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(TestHeroEventId.Move);
    }
  }

  public onLeave(): void {
    this.getTarget().hero.onPullUpLeave();
  }
}

class DeadState extends State<TestHeroFSM> {
  // 進入死亡狀態，玩家不可再操控漁船
}
