import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import FishingHero from './FishingHero';

export enum FishingHeroEventId {
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

export enum FishingHeroStateId {
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

export default class FishingheroFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<FishingheroFSM> = new StateMachine<FishingheroFSM>();

  /** 狀態Map */
  private stateMap: Map<FishingHeroStateId, State<FishingheroFSM>> = new Map<
    FishingHeroStateId,
    State<FishingheroFSM>
  >();

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
    this.stateMap.set(FishingHeroStateId.Idle, idleState);

    const moveState = this.stateMachine.createState(MoveState);
    this.stateMap.set(FishingHeroStateId.Move, moveState);

    const castState = this.stateMachine.createState(CastState);
    this.stateMap.set(FishingHeroStateId.Cast, castState);

    const pullUpState = this.stateMachine.createState(PullUpState);
    this.stateMap.set(FishingHeroStateId.PullUp, pullUpState);

    const castNetState = this.stateMachine.createState(CastNetState);
    this.stateMap.set(FishingHeroStateId.CastNet, castNetState);

    const pullUpNetState = this.stateMachine.createState(PullUpNetState);
    this.stateMap.set(FishingHeroStateId.PullUpNet, pullUpNetState);

    const deadState = this.stateMachine.createState(DeadState);
    this.stateMap.set(FishingHeroStateId.Dead, deadState);

    // set transition.
    this.stateMachine.setStatesTransition(FishingHeroEventId.Move, moveState, [idleState, pullUpState, pullUpNetState]);

    this.stateMachine.setStatesTransition(FishingHeroEventId.Cast, castState, [moveState]);
    this.stateMachine.setStatesTransition(FishingHeroEventId.CastNet, castNetState, [moveState]);

    this.stateMachine.setStatesTransition(FishingHeroEventId.PullUp, pullUpState, [castState]);
    this.stateMachine.setStatesTransition(FishingHeroEventId.PullUpNet, pullUpNetState, [castNetState]);

    // any transition.
    this.stateMachine.setAnyStateTransition(FishingHeroEventId.Dead, deadState);
  }

  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(FishingHeroStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: FishingHeroStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class IdleState extends State<FishingheroFSM> {
  public onEnter(): void {
    // Do nothing.
  }
}

class MoveState extends State<FishingheroFSM> {
  public onUpdate(delta: number): void {
    this.getTarget().hero.onMoveUpdate(delta);
  }
}

class CastState extends State<FishingheroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onCastEnter();
  }

  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onCastUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(FishingHeroEventId.PullUp);
    }
  }
}

class PullUpState extends State<FishingheroFSM> {
  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onPullUpUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(FishingHeroEventId.Move);
    }
  }

  public onLeave(): void {
    this.getTarget().hero.onPullUpLeave();
  }
}

class CastNetState extends State<FishingheroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onCastNetEnter();
  }

  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onCastNetUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(FishingHeroEventId.PullUpNet);
    }
  }
}

class PullUpNetState extends State<FishingheroFSM> {
  public onUpdate(delta: number): void {
    if (this.getTarget().hero.onPullUpNetUpdate(delta) === false) {
      this.getTarget().stateMachine.triggerEvent(FishingHeroEventId.Move);
    }
  }

  public onLeave(): void {
    this.getTarget().hero.onPullUpLeave();
  }
}

class DeadState extends State<FishingheroFSM> {
  // 進入死亡狀態，玩家不可再操控漁船
}
