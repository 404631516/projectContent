import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { PlanetWarResult } from '@/helper/interface/Game';

/** 遊戲狀態機事件 */
enum GameFSMEventID {
  /** 進入開場 */
  Opening,
  /** 進入遊戲 */
  Game,
  /** 結束表演 */
  Result,
  /** 結束遊戲 */
  Ending,
}

/** 遊戲狀態機狀態 */
enum GameFSMStateID {
  /** 開場 */
  Opening = 0,
  /** 遊戲中 */
  Game,
  /** 結束表演 */
  Result,
  /** 遊戲結束 */
  Ending,
}

/** 星球大戰遊戲要實作的東西 */
export interface IPlanetGame {
  /** 遊戲是否結束 */
  isGameEnd: boolean;
  /** 遊戲背景音樂 */
  readonly bgm: Phaser.Sound.BaseSound | undefined;

  /** 設定遊戲狀態機 */
  setGameFSM(gameFSM: PlanetGameFSM): void;

  /** 開場開始 */
  onOpeningEnter(): Promise<void>;
  /** 遊戲開始 */
  onGameEnter(): void;
  /** 遊戲進行中才會呼叫的update
   * @param delta
   */
  onGameUpdate(delta: number): void;
  /** 遊戲結束表演 */
  onPlanetResultEnter(): Promise<void>;
  /** 遊戲結束 */
  onPlanetEndingEnter(): Promise<PlanetWarResult>;

  /** 遊戲暫停 */
  pauseScene(): void;
}

/** 星球大戰Web端要處理的流程 */
export interface IPlanetWeb {
  /** 上傳遊戲結果
   * @param planetWarResult
   */
  onPlanetResult(planetWarResult: PlanetWarResult): Promise<void>;
}

/** 星球大戰遊戲FSM */
export default class PlanetGameFSM {
  /** 狀態機 */
  protected stateMachine: StateMachine<PlanetGameFSM> = new StateMachine<PlanetGameFSM>();

  /** 狀態Map */
  protected stateMap: Map<GameFSMStateID, State<PlanetGameFSM>> = new Map<GameFSMStateID, State<PlanetGameFSM>>();

  /** 主場景Instance */
  public get gameScene(): IPlanetGame {
    return this._gameScene;
  }

  /** 遊戲需要網頁處理的部分 */
  public get gameWeb(): IPlanetWeb {
    return this._gameWeb;
  }

  /** 是否為遊戲進行中 */
  public get isGameState(): boolean {
    const state = this.stateMap.get(GameFSMStateID.Game);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }

  constructor(private _gameScene: IPlanetGame, private _gameWeb: IPlanetWeb) {
    this.stateMachine.setTarget(this);

    // create states.
    const openingState = this.stateMachine.createState(Opening);
    this.stateMap.set(GameFSMStateID.Opening, openingState);

    const gameState = this.stateMachine.createState(Game);
    this.stateMap.set(GameFSMStateID.Game, gameState);

    const resultState = this.stateMachine.createState(Result);
    this.stateMap.set(GameFSMStateID.Result, resultState);

    const endingState = this.stateMachine.createState(Ending);
    this.stateMap.set(GameFSMStateID.Ending, endingState);

    // set transition.
    this.stateMachine.setStatesTransition(GameFSMEventID.Game, gameState, [openingState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Result, resultState, [gameState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Ending, endingState, [resultState]);

    // change to defaule state.
    this.stateMachine.initState(openingState);
  }

  /** 更新狀態機
   * @param delta 每偵間隔時間，ms為單位
   */
  update(delta: number) {
    this.stateMachine.updateState(delta);
  }
}

/** 開場 */
class Opening extends State<PlanetGameFSM> {
  public async onEnter(): Promise<void> {
    // 等待開場動畫播放完畢後進入GameState
    await this.getTarget().gameScene.onOpeningEnter();
    this.triggerEvent(GameFSMEventID.Game);
  }
}

/** 進行中 */
class Game extends State<PlanetGameFSM> {
  public onEnter(): void {
    this.getTarget().gameScene.onGameEnter();
  }

  public onUpdate(delta: number): void {
    // 如果遊戲結束條件達成, 轉結束遊戲表演
    if (this.getTarget().gameScene.isGameEnd) {
      this.triggerEvent(GameFSMEventID.Result);
    }
    // 遊戲進行中才update的東西
    else {
      this.getTarget().gameScene.onGameUpdate(delta);
    }
  }
}

/** 結束表演 */
class Result extends State<PlanetGameFSM> {
  public async onEnter(): Promise<void> {
    // 遊戲結束表演
    await this.getTarget().gameScene.onPlanetResultEnter();

    // 結束遊戲
    this.triggerEvent(GameFSMEventID.Ending);
  }
}

/** 結束 */
class Ending extends State<PlanetGameFSM> {
  public async onEnter(): Promise<void> {
    const gamescene = this.getTarget().gameScene;
    // 遊戲停止, 取得結算資料
    const planetWarReuslt = await gamescene.onPlanetEndingEnter();
    // 暫停遊戲場景
    gamescene.pauseScene();
    // 停止播放音樂
    gamescene.bgm?.stop();

    // 發送結算
    await this.getTarget().gameWeb.onPlanetResult(planetWarReuslt);
  }
}
