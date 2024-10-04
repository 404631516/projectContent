import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import BubbleDragonHero from './BubbleDragonHero';

export enum BubbleDragonHeroEventId {
  /** 閒置 */
  Idle = 0,
}

export enum BubbleDragonHeroStateId {
  /** 閒置 */
  Idle = 0,
}

export default class BubbleDragonHeroFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<BubbleDragonHeroFSM> = new StateMachine<BubbleDragonHeroFSM>();

  /** 狀態Map */
  private stateMap: Map<BubbleDragonHeroStateId, State<BubbleDragonHeroFSM>> = new Map<
    BubbleDragonHeroStateId,
    State<BubbleDragonHeroFSM>
  >();

  /** 英雄 */
  private _bubbleDragonHero: BubbleDragonHero;
  public get bubbleDragonHero(): BubbleDragonHero {
    return this._bubbleDragonHero;
  }

  constructor(bubbleDragonHero: BubbleDragonHero) {
    this._bubbleDragonHero = bubbleDragonHero;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(IdleState);
    this.stateMap.set(BubbleDragonHeroStateId.Idle, idleState);

    // set transition.

    // any transition.
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(BubbleDragonHeroStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param stateID 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: BubbleDragonHeroStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

/** 閒置狀態 */
class IdleState extends State<BubbleDragonHeroFSM> {
  public onEnter(): void {
    this.getTarget().bubbleDragonHero.onIdleEnter();
  }
}
