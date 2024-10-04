import State from '../Scripts/Components/StateMachine/State';
import StateMachine from '../Scripts/Components/StateMachine/StateMachine';
import BossGameScene from './BossGameScene';
import { AsyncHelper } from '../Helper/AsyncHelper';

/** 遊戲狀態機事件 */
enum BossGameFSMEventID {
  /** 魔王開場 */
  Opening,
  /** 遊戲進行中 */
  Gaming,
  /** 魔王閉幕 */
  Ending,
}

/** 遊戲狀態機狀態 */
enum BossGameFSMStateID {
  /** 魔王開場 */
  Opening,
  /** 遊戲進行中 */
  Gaming,
  /** 魔王閉幕 */
  Ending,
}

/** BossGame, 在魔王賽時, 遊戲上方顯示的攻擊魔王表演 */
export default class BossGameFSM {
  /** 狀態機 */
  private stateMachine: StateMachine<BossGameFSM> = new StateMachine<BossGameFSM>();

  /** 狀態Map */
  private stateMap: Map<BossGameFSMStateID, State<BossGameFSM>> = new Map<BossGameFSMStateID, State<BossGameFSM>>();

  /** 是否為遊戲進行中 */
  public get isGameState(): boolean {
    const state = this.stateMap.get(BossGameFSMStateID.Gaming);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }

  constructor(public gameScene: BossGameScene) {
    // 狀態機setTarget
    this.stateMachine.setTarget(this);
    // create states.
    const openingState = this.stateMachine.createState(OpeningState);
    this.stateMap.set(BossGameFSMStateID.Opening, openingState);

    const gamingState = this.stateMachine.createState(GamingState);
    this.stateMap.set(BossGameFSMStateID.Gaming, gamingState);

    const endingState = this.stateMachine.createState(EndingState);
    this.stateMap.set(BossGameFSMStateID.Ending, endingState);

    // set transition.
    this.stateMachine.setTransition(BossGameFSMEventID.Gaming, gamingState, openingState);

    this.stateMachine.setTransition(BossGameFSMEventID.Ending, endingState, gamingState);

    // change to defaule state.
    this.stateMachine.initState(openingState);
  }

  update(delta: number) {
    this.stateMachine.updateState(delta);
  }

  end() {
    // 轉換到End
    this.stateMachine.triggerEvent(BossGameFSMEventID.Ending);
  }
}

/** 播放開場動畫 */
class OpeningState extends State<BossGameFSM> {
  public async onEnter(): Promise<void> {
    await this.getTarget().gameScene.onOpeningEnter();
    this.triggerEvent(BossGameFSMEventID.Gaming);
  }
}

/** 遊戲進行中 */
class GamingState extends State<BossGameFSM> {
  public onUpdate(delta: number): void {
    this.getTarget().gameScene.onGameUpdate();
  }
}

/** 播放結尾動畫 */
class EndingState extends State<BossGameFSM> {
  //
}
