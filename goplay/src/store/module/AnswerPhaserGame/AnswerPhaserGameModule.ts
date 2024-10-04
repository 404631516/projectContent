import {
  BossGameData,
  TowerDefenseGameData,
  HamsterGameData,
  BejeweledGameData,
  ShooterGameData,
  ParkourGameData,
  FishingGameData,
  BomberManGameData,
  BubbleDragonGameData,
  MatchingCardGameData,
  PiggyGameData,
  SnakeGameData,
  VerticalParkourGameData,
  SpaceInvadersGameData,
  Puzzle2048GameData,
} from '@/helper/interface/Game';
import { HeroJ7GameType } from '@/helper/enum/Common';
import {
  BossGame,
  AnswerGameStrategy,
  DefenseGame,
  HamsterGame,
  BejeweledGame,
  ShooterGame,
  ParkourGame,
  FishingGame,
  BomberManGame,
  BubbleDragonGame,
  MatchingCardGame,
  PiggyGame,
  SnakeGame,
  VerticalParkourGame,
  SpaceInvadersGame,
  Puzzle2048Game,
} from '@/views/H5/Games/Common/PhaserGameStrategy';
import { ActionContext, ReturnGetters } from '@/types/store';
import { IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';

interface AnswerPhaserGameState {
  /** 遊戲類型 */
  gameType: HeroJ7GameType;
  /** 魔王表演設定 */
  bossGameData?: BossGameData;
  /** 塔防遊戲設定 */
  defenseGameData?: TowerDefenseGameData;
  /** 打地鼠遊戲設定 */
  hamsterGameData?: HamsterGameData;
  /** 消消樂遊戲設定 */
  bejeweledGameData?: BejeweledGameData;
  /** 射擊遊戲設定 */
  shooterGameData?: ShooterGameData;
  /** 跑酷遊戲設定 */
  parkourGameData?: ParkourGameData;
  /** 釣魚遊戲設定 */
  fishingGameData?: FishingGameData;
  /** 炸彈超人遊戲設定 */
  bomberManGameData?: BomberManGameData;
  /** 泡泡龍遊戲設定 */
  bubbleDragonGameData?: BubbleDragonGameData;
  /** 翻翻牌遊戲設定 */
  matchingCardGameData?: MatchingCardGameData;
  /** 小豬遊戲設定 */
  piggyGameData?: PiggyGameData;
  /** 貪食蛇遊戲設定 */
  snakeGameData?: SnakeGameData;
  /** 垂直跑酷遊戲設定 */
  verticalParkourGameData?: VerticalParkourGameData;
  /** 太空侵略者遊戲設定 */
  spaceInvadersGameData?: SpaceInvadersGameData;
  /** 2048 */
  puzzle2048GameData?: Puzzle2048GameData;
}

const moduleState: AnswerPhaserGameState = {
  gameType: -1,
};

const moduleGetters = {
  /** 魔王表演的魔王ID
   * @param state
   */
  bossId(state: AnswerPhaserGameState): number {
    return state.bossGameData?.bossTableData.id ?? -1;
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定開始遊戲類型
   * @param state
   * @param gameType
   */
  setGameType(state: AnswerPhaserGameState, newGameType: HeroJ7GameType) {
    state.gameType = newGameType;
  },

  /** 設定魔王表演設定
   * @param state
   * @param data
   */
  setBossGameData(state: AnswerPhaserGameState, data: BossGameData) {
    state.bossGameData = data;
  },

  /** 設定塔防遊戲資料
   * @param state
   * @param data
   */
  setTowerDefenseGameData(state: AnswerPhaserGameState, data: TowerDefenseGameData) {
    state.defenseGameData = data;
  },

  /** 設定打地鼠遊戲資料
   * @param state
   * @param data
   */
  setHamsterGameData(state: AnswerPhaserGameState, data: HamsterGameData) {
    state.hamsterGameData = data;
  },

  /** 設定消消樂遊戲資料
   * @param state
   * @param data
   */
  setBejeweledGameData(state: AnswerPhaserGameState, data: BejeweledGameData) {
    state.bejeweledGameData = data;
  },

  /** 設定射擊遊戲資料
   * @param state
   * @param data
   */
  setShooterGameData(state: AnswerPhaserGameState, data: ShooterGameData) {
    state.shooterGameData = data;
  },

  /** 設定跑酷遊戲設定
   * @param state
   * @param data
   */
  setParkourGameData(state: AnswerPhaserGameState, data: ParkourGameData) {
    state.parkourGameData = data;
  },

  /** 設定釣魚遊戲資料
   * @param state
   * @param data
   */
  setFishingGameData(state: AnswerPhaserGameState, data: FishingGameData) {
    state.fishingGameData = data;
  },

  /** 設定炸彈超人遊戲資料
   * @param state
   * @param data
   */
  setBomberManGameData(state: AnswerPhaserGameState, data: BomberManGameData) {
    state.bomberManGameData = data;
  },

  /** 設定泡泡龍遊戲資料
   * @param state
   * @param data
   */
  setBubbleDragonGameData(state: AnswerPhaserGameState, data: BubbleDragonGameData) {
    state.bubbleDragonGameData = data;
  },

  /** 設定翻翻牌遊戲資料
   * @param state
   * @param data
   */
  setMatchingCardGameData(state: AnswerPhaserGameState, data: MatchingCardGameData) {
    state.matchingCardGameData = data;
  },

  /** 設定小豬遊戲資料
   * @param state
   * @param data
   */
  setPiggyGameData(state: AnswerPhaserGameState, data: PiggyGameData) {
    state.piggyGameData = data;
  },

  /** 設定貪食蛇遊戲資料
   * @param state
   * @param data
   */
  setSnakeGameData(state: AnswerPhaserGameState, data: SnakeGameData) {
    state.snakeGameData = data;
  },

  /** 設定垂直跑酷遊戲資料
   * @param state
   * @param data
   */
  setVerticalParkourGameData(state: AnswerPhaserGameState, data: VerticalParkourGameData) {
    state.verticalParkourGameData = data;
  },

  /** 設定太空侵略者遊戲資料
   * @param state
   * @param data
   */
  setSpaceInvadersGameData(state: AnswerPhaserGameState, data: SpaceInvadersGameData) {
    state.spaceInvadersGameData = data;
  },

  /** 設定2048遊戲資料
   * @param state
   * @param data
   */
  setPuzzle2048GameData(state: AnswerPhaserGameState, data: Puzzle2048GameData) {
    state.puzzle2048GameData = data;
  },
};

const actions = {
  /** 開始新遊戲
   * @param state
   */
  async newAnswerPhaserGame(
    context: ActionContext<AnswerPhaserGameState, Getters>,
    answerWeb: IAnswerWeb,
  ): Promise<AnswerGameStrategy | undefined> {
    // 創建魔王表演
    let bossGame: BossGame | undefined;
    if (answerWeb.isBossGame) {
      const bossGameData = context.state.bossGameData;
      if (bossGameData == null) {
        return;
      }

      bossGame = new BossGame(bossGameData);
    }

    // 創建遊戲
    switch (context.state.gameType) {
      // 塔防
      case HeroJ7GameType.TowerDefense:
        if (context.state.defenseGameData != null) {
          return new DefenseGame(context.state.defenseGameData, answerWeb, bossGame);
        }
        break;
      // 打地鼠
      case HeroJ7GameType.Hamster:
        if (context.state.hamsterGameData != null) {
          return new HamsterGame(context.state.hamsterGameData, answerWeb, bossGame);
        }
        break;
      // 消消樂
      case HeroJ7GameType.Bejeweled:
        if (context.state.bejeweledGameData != null) {
          return new BejeweledGame(context.state.bejeweledGameData, answerWeb, bossGame);
        }
        break;
      // 射擊
      case HeroJ7GameType.Shooter:
        if (context.state.shooterGameData != null) {
          return new ShooterGame(context.state.shooterGameData, answerWeb, bossGame);
        }
        break;
      // 跑酷
      case HeroJ7GameType.Parkour:
        if (context.state.parkourGameData != null) {
          return new ParkourGame(context.state.parkourGameData, answerWeb, bossGame);
        }
        break;
      // 釣魚
      case HeroJ7GameType.Fishing:
        if (context.state.fishingGameData != null) {
          return new FishingGame(context.state.fishingGameData, answerWeb, bossGame);
        }
        break;
      // 炸彈超人
      case HeroJ7GameType.BomberMan:
        if (context.state.bomberManGameData != null) {
          return new BomberManGame(context.state.bomberManGameData, answerWeb, bossGame);
        }
        break;
      // 泡泡龍
      case HeroJ7GameType.BubbleDragon:
        if (context.state.bubbleDragonGameData != null) {
          return new BubbleDragonGame(context.state.bubbleDragonGameData, answerWeb, bossGame);
        }
        break;
      // 翻翻牌
      case HeroJ7GameType.MatchingCard:
        if (context.state.matchingCardGameData != null) {
          return new MatchingCardGame(context.state.matchingCardGameData, answerWeb, bossGame);
        }
        break;
      // 小豬
      case HeroJ7GameType.Piggy:
        if (context.state.piggyGameData != null) {
          return new PiggyGame(context.state.piggyGameData, answerWeb, bossGame);
        }
        break;
      // 貪食蛇
      case HeroJ7GameType.Snake:
        if (context.state.snakeGameData != null) {
          return new SnakeGame(context.state.snakeGameData, answerWeb, bossGame);
        }
        break;
      // 垂直跑酷
      case HeroJ7GameType.VerticalParkour:
        if (context.state.verticalParkourGameData != null) {
          return new VerticalParkourGame(context.state.verticalParkourGameData, answerWeb, bossGame);
        }
        break;
      // 太空侵略者
      case HeroJ7GameType.SpaceInvaders:
        if (context.state.spaceInvadersGameData != null) {
          return new SpaceInvadersGame(context.state.spaceInvadersGameData, answerWeb, bossGame);
        }
        break;
      // 2048
      case HeroJ7GameType.Puzzle2048:
        if (context.state.puzzle2048GameData != null) {
          return new Puzzle2048Game(context.state.puzzle2048GameData, answerWeb, bossGame);
        }
        break;
      default:
        console.error(`newAnswerPhaserGame Error: unknown gameType=${context.state.gameType}`);
        return;
    }

    // 未設定gameData
    console.error('Start Game fail: gameData = null');
  },

  /** 結束遊戲時要做的事
   * @param context
   */
  onGameEnd(context: ActionContext<AnswerPhaserGameState, Getters>): void {
    context.state.bossGameData = undefined;
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
