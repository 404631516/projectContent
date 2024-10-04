import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import BaseItem from './BaseItem';

export enum BaseItemEventId {
  /** 偵測階段 */
  Detect = 0,
  /** 發動階段 */
  Active,
  /** 執行完成 */
  Finish,
}

export enum BaseItemStateId {
  /** 偵測階段 */
  Detect = 0,
  /** 發動階段 */
  Active,
  /** 執行完成 */
  Finish,
}

export default class BaseItemFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<BaseItemFSM> = new StateMachine<BaseItemFSM>();

  /** 狀態Map */
  private stateMap: Map<BaseItemStateId, State<BaseItemFSM>> = new Map<BaseItemStateId, State<BaseItemFSM>>();

  /** 道具物件 */
  private _baseItem: BaseItem;
  public get baseItem(): BaseItem {
    return this._baseItem;
  }

  constructor(baseItem: BaseItem) {
    this._baseItem = baseItem;

    this.stateMachine.setTarget(this);

    // create states.
    const detectState = this.stateMachine.createState(DetectState);
    this.stateMap.set(BaseItemStateId.Detect, detectState);

    const activeState = this.stateMachine.createState(ActiveState);
    this.stateMap.set(BaseItemStateId.Active, activeState);

    const finishState = this.stateMachine.createState(FinishState);
    this.stateMap.set(BaseItemStateId.Finish, finishState);

    // set transition.
    this.stateMachine.setStatesTransition(BaseItemEventId.Active, activeState, [detectState]);
    this.stateMachine.setStatesTransition(BaseItemEventId.Finish, finishState, [activeState]);
    this.stateMachine.setStatesTransition(BaseItemEventId.Detect, detectState, [finishState]);
  }

  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  public start(): void {
    // change to defaule state.
    const detectState = this.stateMap.get(BaseItemStateId.Detect);
    if (detectState !== undefined) {
      this.stateMachine.initState(detectState);
    }
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: BaseItemStateId): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class DetectState extends State<BaseItemFSM> {
  public onUpdate(): void {
    const baseItem = this.getTarget().baseItem;
    if (baseItem.onDectectUpdate()) {
      this.getTarget().stateMachine.triggerEvent(BaseItemEventId.Active);
    }
  }
}

class ActiveState extends State<BaseItemFSM> {
  public async onEnter(): Promise<void> {
    const baseItem = this.getTarget().baseItem;
    await baseItem.onActiveEnter();
    this.getTarget().stateMachine.triggerEvent(BaseItemEventId.Finish);
  }

  public onUpdate(): void {
    const baseItem = this.getTarget().baseItem;
    baseItem.onActiveUpdate();
  }
}

class FinishState extends State<BaseItemFSM> {
  public onEnter(): void {
    const baseItem = this.getTarget().baseItem;
    baseItem.onFinishEnter();
  }

  public onUpdate(delta: number): void {
    const baseItem = this.getTarget().baseItem;
    baseItem.onFinishUpdate(delta);
  }
}
