import { HeroJ7GameType, GameBoxType, GameTypeName } from '@/helper/enum/Common';
import imgPath from '@/config/imgPath/imgPath';

/** 小遊戲資料 */
export interface GameTypeData {
  /** 小遊戲類型 */
  gameType: HeroJ7GameType;
  /** 用於展示的名子 */
  displayName: string;
  /** 小遊戲截圖 */
  url: string;
  /** 標籤顏色 */
  tagColor: string;
  /** 遊戲所屬類型 */
  gameBoxType: GameBoxType;
}

export default class GameTypeHelper {
  /** 屬性資料列表 */
  private static readonly gameTypeDataList: GameTypeData[] = [
    // 全部
    {
      gameType: HeroJ7GameType.Total,
      displayName: GameTypeName.Total,
      url: '',
      tagColor: '',
      gameBoxType: GameBoxType.None,
    },
    // 塔防
    {
      gameType: HeroJ7GameType.TowerDefense,
      displayName: GameTypeName.TowerDefense,
      url: imgPath.gameWheelDefenseImg,
      tagColor: '#9553C8',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 打地鼠
    {
      gameType: HeroJ7GameType.Hamster,
      displayName: GameTypeName.Hamster,
      url: imgPath.gameWheelHamsterImg,
      tagColor: '#D8741C',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 消消樂
    {
      gameType: HeroJ7GameType.Bejeweled,
      displayName: GameTypeName.Bejeweled,
      url: imgPath.gameWheelBejeweledImg,
      tagColor: '#11C7A2',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 射擊
    {
      gameType: HeroJ7GameType.Shooter,
      displayName: GameTypeName.Shooter,
      url: imgPath.gameWheelShooterImg,
      tagColor: '#DE4866',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 跑酷
    {
      gameType: HeroJ7GameType.Parkour,
      displayName: GameTypeName.Parkour,
      url: imgPath.gameWheelParkourImg,
      tagColor: '#6504D4',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 釣魚
    {
      gameType: HeroJ7GameType.Fishing,
      displayName: GameTypeName.Fishing,
      url: imgPath.gameWheelFishingImg,
      tagColor: '#1C8DD8',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 炸彈超人
    {
      gameType: HeroJ7GameType.BomberMan,
      displayName: GameTypeName.BomberMan,
      url: imgPath.gameWheelBomberManImg,
      tagColor: '#D81C87',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 敲敲答答
    {
      gameType: HeroJ7GameType.BrickBreaker,
      displayName: GameTypeName.BrickBreaker,
      url: '',
      tagColor: '#D81C87',
      gameBoxType: GameBoxType.RoomGameBox,
    },
    // 因雄氣泡
    {
      gameType: HeroJ7GameType.BubbleDragon,
      displayName: GameTypeName.BubbleDragon,
      url: imgPath.gameWheelBubbleDragonImg,
      tagColor: '#11C7A2',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 記憶對決
    {
      gameType: HeroJ7GameType.MatchingCard,
      displayName: GameTypeName.MatchingCard,
      url: imgPath.gameWheelMatchingCardImg,
      tagColor: '#9452C7',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 蔬食防線
    {
      gameType: HeroJ7GameType.Piggy,
      displayName: GameTypeName.Piggy,
      url: imgPath.gameWheelPiggyImg,
      tagColor: '#DE4866',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 貪食蛇
    {
      gameType: HeroJ7GameType.Snake,
      displayName: GameTypeName.Snake,
      url: imgPath.gameWheelSnakeImg,
      tagColor: '#D8741C',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 垂直跑酷
    {
      gameType: HeroJ7GameType.VerticalParkour,
      displayName: GameTypeName.VerticalParkour,
      url: imgPath.gameWheelVerticalParkourImg,
      tagColor: '#D8741C',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 太空侵略者
    {
      gameType: HeroJ7GameType.SpaceInvaders,
      displayName: GameTypeName.SpaceInvaders,
      url: imgPath.gameWheelSpaceInvadersImg,
      tagColor: '#D8741C',
      gameBoxType: GameBoxType.AdlGameBox,
    },
    // 2048
    {
      gameType: HeroJ7GameType.Puzzle2048,
      displayName: GameTypeName.Puzzle2048,
      url: imgPath.gameWheelPuzzle2048Img,
      tagColor: '#D8741C',
      gameBoxType: GameBoxType.AdlGameBox,
    },
  ];

  /** 取得指定遊戲類別資料
   * @param gameType
   */
  public static getGameTypeData(gameType: HeroJ7GameType): GameTypeData | undefined {
    return this.gameTypeDataList.find((gameTypeData) => gameTypeData.gameType === gameType);
  }

  /** 取得指定遊戲所屬類資料
   * @param gameBoxType
   */
  public static getGameBox(gameBoxType: GameBoxType): GameTypeData[] {
    return this.gameTypeDataList.filter((gameTypeData) => gameTypeData.gameBoxType === gameBoxType);
  }

  /** 取得指定遊戲類別名稱
   * @param gameType
   */
  public static getGameTypeName(gameType: HeroJ7GameType): string {
    const gameTypeData = this.getGameTypeData(gameType);
    return gameTypeData ? gameTypeData.displayName : '錯誤類別';
  }
}
