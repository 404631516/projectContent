import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { TotalProps, ContestPlayerData } from '@/helper/interface/Game';

/** 遊戲狀態機事件 */
enum GameFSMEventID {
  /** 進入開場 */
  Opening,
  /** 進入遊戲 */
  Game,
  /** 進入續命 */
  Revive,
  /** 結束遊戲 */
  Ending,
}

/** 遊戲狀態機狀態 */
enum GameFSMStateID {
  /** 開場 */
  Opening = 0,
  /** 遊戲中 */
  Game,
  /** 續命 */
  Revive,
  /** 遊戲結束 */
  Ending,
}

/** 答題遊戲要實作的東西 */
export interface IAnswerGame {
  /** 遊戲是否要續命 */
  isGameRevive: boolean;
  /** 遊戲是否結束 */
  isGameEnd: boolean;
  /** 遊戲背景音樂 */
  readonly bgm: Phaser.Sound.BaseSound | undefined;

  /** 開場開始 */
  onOpeningEnter(): Promise<void>;
  /** 遊戲開始 */
  onGameEnter(): void;
  /** 遊戲進行中才會呼叫的update
   * @param delta
   */
  onGameUpdate(delta: number): void;
  /** 續命開始 */
  onReviveEnter(): void;
  /** 續命結束
   * @param rewardProp
   */
  onReviveEnd(rewardProp: TotalProps[]): Promise<void>;
  /** 遊戲結束 */
  onEndingEnter(): ContestPlayerData;

  /** 遊戲暫停 */
  pauseScene(): void;
}

/** 答題遊戲Web端要處理的流程 */
export interface IAnswerWeb {
  /** 是否為魔王表演 */
  isBossGame: boolean;

  /** 續命流程 */
  onRevive(): Promise<TotalProps[]>;
  /** 上傳遊戲結果
   * @param contestPlayerData
   */
  onResult(contestPlayerData: ContestPlayerData): Promise<void>;
}

/** 一般答題遊戲FSM */
export default class AnswerGameFSM {
  /** 狀態機 */
  protected stateMachine: StateMachine<AnswerGameFSM> = new StateMachine<AnswerGameFSM>();

  /** 狀態Map */
  protected stateMap: Map<GameFSMStateID, State<AnswerGameFSM>> = new Map<GameFSMStateID, State<AnswerGameFSM>>();

  /** 主場景Instance */
  public get gameScene(): IAnswerGame {
    return this._gameScene;
  }

  /** 遊戲需要網頁處理的部分 */
  public get gameWeb(): IAnswerWeb {
    return this._gameWeb;
  }

  /** 是否為遊戲進行中 */
  public get isGameState(): boolean {
    const state = this.stateMap.get(GameFSMStateID.Game);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }

  constructor(private _gameScene: IAnswerGame, private _gameWeb: IAnswerWeb) {
    this.stateMachine.setTarget(this);

    // create states.
    const openingState = this.stateMachine.createState(Opening);
    this.stateMap.set(GameFSMStateID.Opening, openingState);

    const gameState = this.stateMachine.createState(Game);
    this.stateMap.set(GameFSMStateID.Game, gameState);

    const reviveState = this.stateMachine.createState(Revive);
    this.stateMap.set(GameFSMStateID.Revive, reviveState);

    const endingState = this.stateMachine.createState(Ending);
    this.stateMap.set(GameFSMStateID.Ending, endingState);

    // set transition.
    this.stateMachine.setStatesTransition(GameFSMEventID.Game, gameState, [openingState, reviveState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Revive, reviveState, [gameState]);

    this.stateMachine.setStatesTransition(GameFSMEventID.Ending, endingState, [gameState]);

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
class Opening extends State<AnswerGameFSM> {
  public async onEnter(): Promise<void> {
    // 等待開場動畫播放完畢後進入GameState
    await this.getTarget().gameScene.onOpeningEnter();
    this.triggerEvent(GameFSMEventID.Game);
  }
}

/** 進行中 */
class Game extends State<AnswerGameFSM> {
  /** 是否續命過 */
  private hasRevived: boolean = false;

  public onEnter(): void {
    // 第一次進遊戲狀態才要做的事
    if (this.hasRevived === false) {
      this.getTarget().gameScene.onGameEnter();
    }
  }

  public onUpdate(delta: number): void {
    // 如果尚未續命 & 續命條件達成或是續命時間到, 開始續命
    if (this.hasRevived === false && this.getTarget().gameScene.isGameRevive) {
      this.hasRevived = true;
      this.triggerEvent(GameFSMEventID.Revive);
    }
    // 如果遊戲結束條件達成, 結束遊戲
    else if (this.getTarget().gameScene.isGameEnd) {
      this.triggerEvent(GameFSMEventID.Ending);
    }
    // 遊戲進行中才update的東西
    else {
      this.getTarget().gameScene.onGameUpdate(delta);
    }
  }
}

/** 續命/續命後遊戲 */
class Revive extends State<AnswerGameFSM> {
  public async onEnter(): Promise<void> {
    // 開始續命
    this.getTarget().gameScene.onReviveEnter();

    // 續命答題, 取得獎勵
    const reward = await this.getTarget().gameWeb.onRevive();

    // 繼續遊戲
    await this.getTarget().gameScene.onReviveEnd(reward);

    // 轉去繼續遊戲
    this.triggerEvent(GameFSMEventID.Game);
  }
}

/** 結束 */
class Ending extends State<AnswerGameFSM> {
  public async onEnter(): Promise<void> {
    const gamescene = this.getTarget().gameScene;
    // 遊戲停止, 取得結算資料
    const contestPlayerData = gamescene.onEndingEnter();
    // 暫停遊戲場景
    gamescene.pauseScene();
    // 停止播放音樂
    gamescene.bgm?.stop();

    // 發送結算
    await this.getTarget().gameWeb.onResult(contestPlayerData);
  }
}
