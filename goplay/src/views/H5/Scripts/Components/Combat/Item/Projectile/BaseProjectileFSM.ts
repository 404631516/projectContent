import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import BaseProjectile from './BaseProjectile';

export enum BaseProjectileEventId {
  /** 發動階段 */
  Active,
  /** 執行完成 */
  Finish,
}

export enum BaseProjectileStateId {
  /** 發動階段 */
  Active,
  /** 執行完成 */
  Finish,
}

export default class BaseProjectileFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<BaseProjectileFSM> = new StateMachine<BaseProjectileFSM>();

  /** 狀態Map */
  private stateMap: Map<BaseProjectileStateId, State<BaseProjectileFSM>> = new Map<
    BaseProjectileStateId,
    State<BaseProjectileFSM>
  >();

  /** 投射物物件 */
  private _baseProjectile: BaseProjectile;
  public get baseProjectile(): BaseProjectile {
    return this._baseProjectile;
  }

  constructor(baseProjectile: BaseProjectile) {
    this._baseProjectile = baseProjectile;

    this.stateMachine.setTarget(this);

    // create states.
    const activeState = this.stateMachine.createState(ActiveState);
    this.stateMap.set(BaseProjectileStateId.Active, activeState);

    const finishState = this.stateMachine.createState(FinishState);
    this.stateMap.set(BaseProjectileStateId.Finish, finishState);

    // set transition.
    this.stateMachine.setStatesTransition(BaseProjectileEventId.Finish, finishState, [activeState]);
    this.stateMachine.setStatesTransition(BaseProjectileEventId.Active, activeState, [finishState]);
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const detectState = this.stateMap.get(BaseProjectileStateId.Active);
    if (detectState !== undefined) {
      this.stateMachine.initState(detectState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: BaseProjectileStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class ActiveState extends State<BaseProjectileFSM> {
  private survivalTime: number = 0;
  private activeTime: number = 0;

  public onEnter(): void {
    this.activeTime = 0;
    this.survivalTime = this.getTarget().baseProjectile.survivalTime * 1000;
    this.getTarget().baseProjectile.onActiveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const baseProjectile = this.getTarget().baseProjectile;
    if (baseProjectile.onActiveUpdate(time, delta) === true) {
      this.getTarget().stateMachine.triggerEvent(BaseProjectileEventId.Finish);
    }

    // 超過存活時間時銷毀
    this.activeTime += delta;
    if (this.activeTime > this.survivalTime) {
      this.getTarget().stateMachine.triggerEvent(BaseProjectileEventId.Finish);
    }
  }
}

class FinishState extends State<BaseProjectileFSM> {
  public onEnter(): void {
    const baseProjectile = this.getTarget().baseProjectile;
    baseProjectile.onFinishEnter();
  }
}
