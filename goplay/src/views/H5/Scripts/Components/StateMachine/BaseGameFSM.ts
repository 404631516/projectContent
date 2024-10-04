import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import BaseGameScene from '../BaseGameScene';

/** 遊戲狀態機事件 */
export enum GameFSMEventID {
  /** 進入開場 */
  Opening = 0,
  /** 進入遊戲 */
  Game,
  /** 進入結算 */
  Result,
  /** 結束遊戲 */
  Ending,
}

/** 遊戲狀態機狀態 */
export enum GameFSMStateID {
  /** 開場 */
  Opening = 0,
  /** 遊戲中 */
  Game,
  /** 結算 */
  Result,
  /** 遊戲結束 */
  Ending,
}

export default class BaseGameFSM<T extends BaseGameScene> {
  /** 狀態機 */
  private stateMachine: StateMachine<BaseGameFSM<T>> = new StateMachine<BaseGameFSM<T>>();

  /** 狀態Map */
  private stateMap: Map<GameFSMStateID, State<BaseGameFSM<T>>> = new Map<GameFSMStateID, State<BaseGameFSM<T>>>();

  /** 主場景Instance */
  private _gameScene: T;
  public get gameScene(): T {
    return this._gameScene;
  }

  constructor(
    gameScene: T,
    openingStateType: new () => State<BaseGameFSM<T>>,
    gameStateType: new () => State<BaseGameFSM<T>>,
    resultStateType: new () => State<BaseGameFSM<T>>,
    endingStateType: new () => State<BaseGameFSM<T>>
  ) {
    this._gameScene = gameScene;

    this.stateMachine.setTarget(this);

    // create states.
    const openingState = this.stateMachine.createState(openingStateType);
    this.stateMap.set(GameFSMStateID.Opening, openingState);

    const gameState = this.stateMachine.createState(gameStateType);
    this.stateMap.set(GameFSMStateID.Game, gameState);

    const resultState = this.stateMachine.createState(resultStateType);
    this.stateMap.set(GameFSMStateID.Result, resultState);

    const endingState = this.stateMachine.createState(endingStateType);
    this.stateMap.set(GameFSMStateID.Ending, endingState);

    // set transition.
    this.stateMachine.setStatesTransition(GameFSMEventID.Game, gameState, [openingState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Result, resultState, [gameState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Ending, endingState, [resultState]);
  }

  /** 啟動狀態機 */
  public start(): void {
    // change to defaule state.
    const openingState = this.stateMap.get(GameFSMStateID.Opening);
    if (openingState !== undefined) {
      this.stateMachine.initState(openingState);
    }
  }

  /** 更新狀態機
   * @param delta 每偵間隔時間，ms為單位
   */
  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  /** 判斷是否為某個狀態
   * @param stateID 要判斷的狀態ID
   * @returns boolean
   */
  public isCurrentState(stateID: GameFSMStateID): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}
