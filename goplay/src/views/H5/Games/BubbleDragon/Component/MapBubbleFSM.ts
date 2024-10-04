import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { BubbleDragonNumber } from '../Data/BubbleDragonConfig';
import MapBubble from './MapBubble';

export enum MapBubbleEventId {
  /** 閒置 */
  Idle = 0,
  /** 移動 */
  Move,
  /** 掉落 */
  Fall,
  /** 死亡 */
  Death,
}

export enum MapBubbleStateId {
  /** 閒置 */
  Idle = 0,
  /** 移動 */
  Move,
  /** 掉落 */
  Fall,
  /** 死亡 */
  Death,
}

export default class MapBubbleFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<MapBubbleFSM> = new StateMachine<MapBubbleFSM>();

  /** 狀態Map */
  private stateMap: Map<MapBubbleStateId, State<MapBubbleFSM>> = new Map<MapBubbleStateId, State<MapBubbleFSM>>();

  /** 判斷是否為狀態變幻中
   * @returns boolean
   */
  public get isTransitioning(): boolean {
    return this.stateMachine.isTransitioning;
  }

  /** 關卡泡泡 */
  private _mapBubble: MapBubble;
  public get mapBubble(): MapBubble {
    return this._mapBubble;
  }

  constructor(mapBubble: MapBubble) {
    this._mapBubble = mapBubble;

    this.stateMachine.setTarget(this);

    // create states.
    const idleState = this.stateMachine.createState(IdleState);
    this.stateMap.set(MapBubbleStateId.Idle, idleState);

    const moveState = this.stateMachine.createState(MoveState);
    this.stateMap.set(MapBubbleStateId.Move, moveState);

    const fallState = this.stateMachine.createState(FallState);
    this.stateMap.set(MapBubbleStateId.Fall, fallState);

    const deathState = this.stateMachine.createState(DeathState);
    this.stateMap.set(MapBubbleStateId.Death, deathState);

    // set transition.
    this.stateMachine.setStatesTransition(MapBubbleEventId.Move, moveState, [idleState]);
    this.stateMachine.setStatesTransition(MapBubbleEventId.Fall, fallState, [idleState]);
    this.stateMachine.setStatesTransition(MapBubbleEventId.Idle, idleState, [moveState, deathState]);

    // any transition.
    this.stateMachine.setAnyStateTransition(MapBubbleEventId.Death, deathState);
  }

  public update(time: number, delta: number): void {
    this.stateMachine.updateState(time, delta);
  }

  public start(): void {
    // change to defaule state.
    const idleState = this.stateMap.get(MapBubbleStateId.Idle);
    if (idleState !== undefined) {
      this.stateMachine.initState(idleState);
    }
  }

  /** 判斷是否為某個狀態
   * @param stateID 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: MapBubbleStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

/** 閒置狀態 */
class IdleState extends State<MapBubbleFSM> {
  public onEnter(): void {
    //
  }
}

/** 移動狀態 */
class MoveState extends State<MapBubbleFSM> {
  public async onEnter(): Promise<void> {
    await this.getTarget().mapBubble.onMoveEnter();
    this.getTarget().stateMachine.triggerEvent(MapBubbleEventId.Idle);
  }
}

/** 掉落狀態 */
class FallState extends State<MapBubbleFSM> {
  public async onEnter(): Promise<void> {
    this.getTarget().mapBubble.onFallEnter();
  }

  public onUpdate(time?: number, delta?: number) {
    if (this.getTarget().mapBubble.y > BubbleDragonNumber.CanvasHeight) {
      this.getTarget().stateMachine.triggerEvent(MapBubbleEventId.Death);
    }
  }
}

/** 死亡狀態 */
class DeathState extends State<MapBubbleFSM> {
  public onEnter(): void {
    this.getTarget().mapBubble.onDeathEnter();
  }
}
