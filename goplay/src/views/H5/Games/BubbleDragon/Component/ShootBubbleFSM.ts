import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import ShootBubble from './ShootBubble';

export enum ShootBubbleEventId {
  /** 閒置 */
  Idle = 0,
  /** 填充 */
  Charge,
  /** 待發射 */
  InCannon,
  /** 射擊 */
  Shoot,
  /** 死亡 */
  Death,
}

export enum ShootBubbleStateId {
  /** 閒置 */
  Idle = 0,
  /** 填充 */
  Charge,
  /** 待發射 */
  InCannon,
  /** 射擊 */
  Shoot,
  /** 死亡 */
  Death,
}

export default class ShootBubbleFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<ShootBubbleFSM> = new StateMachine<ShootBubbleFSM>();

  /** 狀態Map */
  private stateMap: Map<ShootBubbleStateId, State<ShootBubbleFSM>> = new Map<
    ShootBubbleStateId,
    State<ShootBubbleFSM>
  >();

  /** 判斷是否為狀態變換中
   * @returns boolean
   */
  public get isTransitioning(): boolean {
    return this.stateMachine.isTransitioning;
  }

  /** 射擊泡泡 */
  private _shootBubble: ShootBubble;
  /** 射擊泡泡 */
  public get shootBubble(): ShootBubble {
    return this._shootBubble;
  }

  constructor(shootBubble: ShootBubble) {
    this._shootBubble = shootBubble;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(IdleState);
    this.stateMap.set(ShootBubbleStateId.Idle, idleState);

    const chargeState = this.stateMachine.createState(ChargeState);
    this.stateMap.set(ShootBubbleStateId.Charge, chargeState);

    const inCannonState = this.stateMachine.createState(InCannonState);
    this.stateMap.set(ShootBubbleStateId.InCannon, inCannonState);

    const shootState = this.stateMachine.createState(ShootState);
    this.stateMap.set(ShootBubbleStateId.Shoot, shootState);

    const deathState = this.stateMachine.createState(DeathState);
    this.stateMap.set(ShootBubbleStateId.Death, deathState);

    // set transition.
    this.stateMachine.setStatesTransition(ShootBubbleEventId.Shoot, shootState, [inCannonState]);
    this.stateMachine.setStatesTransition(ShootBubbleEventId.Charge, chargeState, [idleState]);
    this.stateMachine.setStatesTransition(ShootBubbleEventId.InCannon, inCannonState, [idleState]);
    this.stateMachine.setStatesTransition(ShootBubbleEventId.Idle, idleState, [chargeState, deathState]);
    this.stateMachine.setStatesTransition(ShootBubbleEventId.Death, deathState, [shootState]);
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(ShootBubbleStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param stateID 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: ShootBubbleStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

/** 閒置狀態 */
class IdleState extends State<ShootBubbleFSM> {
  public onEnter(): void {
    ///
  }
}

/** 填充狀態 */
class ChargeState extends State<ShootBubbleFSM> {
  public async onEnter(): Promise<void> {
    await this.getTarget().shootBubble.onChargeEnter();
    this.getTarget().stateMachine.triggerEvent(ShootBubbleEventId.Idle);
  }
}

/** 待發射狀態 */
class InCannonState extends State<ShootBubbleFSM> {
  public onEnter(): void {
    ///
  }
}

/** 射擊狀態 */
class ShootState extends State<ShootBubbleFSM> {
  public async onEnter(): Promise<void> {
    this.getTarget().shootBubble.onShootEnter();
  }
}

/** 死亡狀態 */
class DeathState extends State<ShootBubbleFSM> {
  public onEnter(): void {
    this.getTarget().shootBubble.onDeathEnter();
  }
}
