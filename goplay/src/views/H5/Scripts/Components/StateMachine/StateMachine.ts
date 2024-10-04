import State from './State';

export default class StateMachine<T> {
  public isShowDebugInfo: boolean = false;
  public currentEventID?: number;
  private target!: T;
  private currentState!: State<T>;
  private newState?: State<T>;
  private transitionList: Array<Transition<T>> = new Array<Transition<T>>();

  public get isTransitioning(): boolean {
    return this.newState !== undefined;
  }

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
   * @param to to state
   * @param from from state
   */
  public getTransition(to: State<T>, from?: State<T>): Transition<T> {
    for (const transition of this.transitionList) {
      if (transition.from === from && transition.to === to) {
        return transition;
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
   * @param eventID 觸發此event時會執行換state
   * @param to 移動到此state
   */
  public setAnyStateTransition(eventID: number, to: State<T>): void {
    this.setTransition(eventID, to);
  }

  /** 設定多個states可觸發的transition
   * @param eventID 觸發此event時會執行換state
   * @param to 移動到此state
   * @param fromStates 可從那些狀態觸發
   */
  public setStatesTransition(eventID: number, to: State<T>, fromStates: Array<State<T>>): void {
    for (const from of fromStates) {
      this.setTransition(eventID, to, from);
    }
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
    newState._stateMachine = this;
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
  public updateState(time?: number, delta?: number): void {
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
      this.currentState.onUpdate(time, delta);
    }
  }

  /** 設定兩個states之間的transition
   * @param eventID 觸發此event時會執行換state
   * @param to 移動到此state
   * @param from 在此state時可觸發，若為undefined則表示任何狀態
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
}

/** 一條Transition */
class Transition<T> {
  public from?: State<T>;

  public to!: State<T>;

  public eventID!: number;
}
