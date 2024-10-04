import State from './State';
import Transition from './Transition';

export default class StateMachine<T> {
  public isShowDebugInfo: boolean = false;
  public currentEventID?: number;
  private target!: T;
  private currentState!: State<T>;
  private newState?: State<T>;
  private transitionList: Array<Transition<T>> = new Array<Transition<T>>();

  /** 設定target class */
  public setTarget(target: T): void {
    this.target = target;
  }

  /** 取得target class */
  public getTarget(): T {
    return this.target;
  }

  /** 取得當前state */
  public getCurrentState(): State<T> {
    return this.currentState;
  }

  /** 判斷當前state
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(state: State<T>): boolean {
    return this.currentState === state;
  }

  /** 輸入from state及to state, 取得transition
   * @param from from state
   * @param to to state
   */
  public getTransition(to: State<T>, from?: State<T>): Transition<T> {
    for (const transition of this.transitionList) {
      if (transition.to === to) {
        if (transition.from === from || transition.from === undefined || from === undefined) {
          return transition;
        }
      }
    }
    return new Transition<T>();
  }

  /** 取得設定成any state都可觸發的transition
   * @param eventID
   */
  public getAnyStateTransition(eventID: number): Transition<T> {
    for (const transition of this.transitionList) {
      if (transition.from == null && transition.eventID === eventID) {
        return transition;
      }
    }
    return new Transition<T>();
  }

  /** 取得來自當前state的transition
   * @param eventID
   */
  public getCurrentStateTransition(eventID: number): Transition<T> {
    for (const transition of this.transitionList) {
      if (transition.from === this.currentState && transition.eventID === eventID) {
        return transition;
      }
    }
    return new Transition<T>();
  }

  /** 設定任何state都可觸發的transition
   * @param to
   * @param eventID
   */
  public setAnyStateTransition(to: State<T>, eventID: number): void {
    this.setTransition(eventID, to);
  }

  /** 設定兩個states之間的transition
   * @param from 在此state時
   * @param to 移動到此state
   * @param eventID 觸發此event時會執行換state
   */
  public setTransition(eventID: number, to: State<T>, from?: State<T>): void {
    if (this.getTransition(to, from).eventID !== undefined) {
      console.error('setTransition fail, already set!');
      return;
    }

    const newTransition = new Transition<T>();
    if (from !== undefined) {
      newTransition.from = from;
    }
    newTransition.to = to;
    newTransition.eventID = eventID;

    this.transitionList.push(newTransition);
  }

  /** 觸發event
   * @param eventID
   * @param waitSeconds
   */
  public triggerEvent(eventID: number): void {
    this.currentEventID = eventID;
    // 先檢查AnyState
    const anyStateTransition = this.getAnyStateTransition(eventID);
    if (anyStateTransition.eventID !== undefined) {
      this._changeState(anyStateTransition.to);
      return;
    }

    // 檢查目前的State
    const currentStateTransition = this.getCurrentStateTransition(eventID);
    if (currentStateTransition.eventID !== undefined) {
      this._changeState(currentStateTransition.to);
      return;
    }

    if (this.isShowDebugInfo) {
      console.log('GameStateManager.TriggerEvent, no match transition. event = ' + eventID);
      return;
    }
  }

  /** 創一個新的state, 傳入class type
   * @param stateType 新的state的type
   */
  public createState<S extends State<T>>(stateType: new () => S): S {
    if (this.isShowDebugInfo) {
      console.log('create State ' + stateType.constructor.name);
    }
    const newState = new stateType();
    newState.stateMachine = this;
    return newState;
  }

  /** 進入第一個state */
  public initState(newState: State<T>): void {
    this._changeState(newState);
  }

  /**
   * call這個function可直接切換到指定的state,
   * 但標準做法希望是觸發TriggerEvent走Transition來changeState
   */
  public _changeState(newState: State<T>): void {
    if (this.isShowDebugInfo) {
      console.log('Change State ' + newState.constructor.name);
    }

    if (newState == null) {
      console.error('GameStateManager.ChangeState fail, m_New is not null!');
      return;
    }

    this.newState = newState;
  }

  /** update */
  public updateState(delta?: number): void {
    if (this.newState !== undefined) {
      if (this.currentState != null) {
        this.currentState.onLeave();
      }
      this.currentState = this.newState;
      this.newState = undefined;
      if (this.currentState != null) {
        this.currentState.onEnter();
        return;
      }
    }
    if (this.currentState !== null) {
      this.currentState.onUpdate(delta);
    }
  }
}
