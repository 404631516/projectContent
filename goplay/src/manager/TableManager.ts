import TableData from './TableData';
//#region 匯入json
import BossTableData from '@/table/BossData.json'; // 魔王角色列表
import BossTalkData from '@/table/BossTalkData.json'; // 魔王賽對話表
import HeroExpTableData from '@/table/HeroExpData.json'; // 英雄經驗值對照表
import HeroTableData from '@/table/HeroData.json'; // 英雄列表
import HeroUnlockPointTableData from '@/table/HeroUnLockPoint.json'; // 英雄積分進度
import DefenseWeaponTableData from '@/table/DefenseWeaponData.json'; // 生物兵器列表
import DefenseBarrelTableData from '@/table/DefenseBarrelData.json'; // 生物兵器砲管
import DefenseBombTableData from '@/table/DefenseBombData.json'; // 生物兵器炮彈
import HeroLevelTableData from '@/table/HeroLevelData.json'; // 英雄各模式等級對應表
import DefenseEnemyTableData from '@/table/DefenseEnemyData.json'; // 塔防敵人
import ShootBombTableData from '@/table/ShootBombData.json'; // 射擊砲彈
import ShootTargetTableData from '@/table/ShootTargetData.json'; // 射擊目標
import HamsterTableData from '@/table/HamsterData.json'; // 地鼠
import HamsterStateTableData from '@/table/HamsterStateData.json'; // 地鼠出現的階段
import HamsterDisplayTableData from '@/table/HamsterDisplayData.json'; // 地鼠顯示的圖片
import HamsterEquipTableData from '@/table/HamsterEquipData.json'; // 地鼠裝備
import HamsterAttackTableData from '@/table/HamsterAttackData.json'; // 地鼠攻擊道具
import HamsterDefenseItemTableData from '@/table/HamsterDefenseItemData.json'; // 防禦地鼠的道具
import HamsterHitItemTableData from '@/table/HamsterHitItemData.json'; // 攻擊地鼠的道具
import BejeweledBombTableData from '@/table/BejeweledBombData.json'; // 攻擊地鼠的道具
import FishingSettingTableData from '@/table/FishingSettingData.json'; // 釣魚設定的參數
import FishingWaveTableData from '@/table/FishingWaveData.json'; // 釣魚波數的參數
import FishingItemTableData from '@/table/FishingItemData.json'; // 釣魚遊戲的道具
import FishingFishTableData from '@/table/FishingFishData.json'; // 釣魚遊戲的魚
import ParkourSettingTableData from '@/table/ParkourSettingData.json'; // 跑酷設定的參數
import ParkourItemTableData from '@/table/ParkourItemData.json'; // 跑酷遊戲的道具
import ParkourMapObjectTableData from '@/table/ParkourMapObjectData.json'; // 跑酷地圖的物件
import ParkourMapTableData from '@/table/ParkourMapData.json'; // 跑酷遊戲的地圖
import ParkourWaveTableData from '@/table/ParkourWaveData.json'; // 跑酷遊戲的波數
import BomberManSettingTableData from '@/table/BomberManSettingData.json'; // 炸彈超人遊戲的參數
import BomberManItemTableData from '@/table/BomberManItemData.json'; // 炸彈超人遊戲的道具
import BomberManStageTableData from '@/table/BomberManStageData.json'; // 炸彈超人遊戲的關卡
import BomberManEnemyTableData from '@/table/BomberManEnemyData.json'; // 炸彈超人遊戲的敵人
import CombatEffectTableData from '@/table/CombatEffectData.json'; // 戰鬥特效
import CombatAudioTableData from '@/table/CombatAudioData.json'; // 戰鬥音效
import AntiTDEnemyTableData from '@/table/AntiTDEnemyData.json'; // 逆塔防敵人
import AntiTDEnemyTeamTableData from '@/table/AntiTDEnemyTeamData.json'; // 逆塔防敵人隊伍
import AntiTDItemTableData from '@/table/ItemAntiTDData.json'; // 逆塔防道具
import AntiTDMapTableData from '@/table/AntiTDMapData.json'; // 逆塔防的地圖
import BrickBreakerEffectTableData from '@/table/BrickBreakerEffectData.json'; // 坦克大戰特效
import BrickBreakerTableData from '@/table/BrickBreakerMapData.json'; // 坦克大戰地圖
import BrickBreakerMapItemTableData from '@/table/BrickBreakerMapItemData.json'; // 坦克大戰地圖物件
import PiggyItemTableData from '@/table/PiggyItemData.json'; // 小豬的道具
import PiggyAudioTableData from '@/table/PiggyAudioData.json'; // 小豬的音效
import PiggyEnemyTableData from '@/table/PiggyEnemyData.json'; // 小豬敵人
import PiggyWaveTableData from '@/table/PiggyWaveData.json'; // 小豬波次
import PiggyEnemyPatternTableData from '@/table/PiggyEnemyPatternData.json'; // 小豬模板
import SnakeItemTableData from '@/table/SnakeItemData.json'; // 貪食蛇的道具
import SnakeFoodTableData from '@/table/SnakeFoodData.json'; // 貪食蛇的食物
import SubjectDatas from '@/table/SubjectData.json';
import TwCountyName from '@/table/TwCountyName.json';
import StoreItemTableData from '@/table/StoreItem.json'; // 商店顯示的物品
import AdornmentItemTableData from '@/table/AdornmentItemData.json'; // 個人基地的裝飾物
import AdornmentLevelTableData from '@/table/AdornmentLevelData.json'; // 個人基地的等級
import AdornmentRoomTableData from '@/table/AdornmentRoomData.json'; // 個人基地的房間
import HeroUniverseMapTableData from '@/table/HeroUniverseMapData.json'; // 因雄宇宙的地圖
import HeroUniversePortalEffectTableData from '@/table/HeroUniversePortalEffectData.json'; // 因雄宇宙的傳送門特效
import HeroUniversePortalRedirectTableData from '@/table/HeroUniversePortalRedirectData.json'; // 因雄宇宙的傳送門重新導向
import HeroUniverseNpcEffectTableData from '@/table/HeroUniverseNpcEffectData.json'; // 因雄宇宙的Npc特效
import HeroUniverseNpcTableData from '@/table/HeroUniverseNpcData.json'; // 因雄宇宙的Npc
import HeroUniverseNpcDialogTableData from '@/table/HeroUniverseNpcDialogData.json'; // 因雄宇宙的Npc對話
import VerticalParkourSettingTableData from '@/table/VerticalParkourSettingData.json'; // 垂直跑酷的設定
import VerticalParkourObstacleWaveTableData from '@/table/VerticalParkourObstacleWaveData.json'; // 垂直跑酷的波數
import VerticalParkourItemTableData from '@/table/VerticalParkourItemData.json'; //  垂直跑酷遊戲的道具
import SpaceInvadersItemTableData from '@/table/SpaceInvadersItemData.json'; // 太空侵略者的道具
import SpaceInvadersSettingTableData from '@/table/SpaceInvadersSettingData.json'; // 太空侵略者的遊戲設定
import SpaceInvadersWaveTableData from '@/table/SpaceInvadersWaveData.json'; // 太空侵略者的波數
import SpaceInvadersMovementPatternTableData from '@/table/SpaceInvadersMovementPatternData.json'; // 太空侵略者的敵人移動模式
import SpaceInvadersEnemyTableData from '@/table/SpaceInvadersEnemyData.json'; // 太空侵略者的敵人移動模式
import Puzzle2048ItemTableData from '@/table/Puzzle2048ItemData.json'; //  垂直跑酷遊戲的道具
import BubbleDragonItemTableData from '@/table/BubbleDragonItemData.json'; // 泡泡龍
import MatchingCardSettingTableData from '@/table/MatchingCardSettingData.json'; // 翻翻牌遊戲的參數
import MatchingCardPatternTableData from '@/table/MatchingCardPatternData.json'; // 翻翻牌遊戲的模式
import MatchingCardObstructTableData from '@/table/MatchingCardObstructData.json'; // 翻翻牌遊戲的干擾
import MatchingCardItemTableData from '@/table/MatchingCardItemData.json'; // 翻翻牌遊戲的道具
import TestSettingTableData from '@/table/TestSettingData.json'; // 測試設定的參數
import TestWaveTableData from '@/table/TestWaveData.json'; // 測試波數的參數
import TestFishTableData from '@/table/TestFishData.json'; // 測試遊戲的魚
import TestItemTableData from '@/table/TestItemData.json'; // 測試的道具
import ContestLockPasswordInfoTableData from '@/table/ContestLockPasswordInfo.json'; // 賽事鎖定通關密語
import ContestRewardPasswordInfoTableData from '@/table/ContestRewardPasswordInfo.json'; // 賽事獎勵通關密語
import { MapItemType, EnemyMoveType, BomberManItemFunction } from '@/views/H5/Games/BomberMan/Data/BomberManConfig';
import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';
import {
  BattleUnitAttackMode,
  InteractionType,
  ItemFunction,
  SpawnOnHitType,
  ProjectileFunction,
  MinionFunction,
} from '@/helper/enum/Combat';
import { AdornmentRoomSizeType } from '@/views/H5/Games/PersonalBase/Data/AdornmentConfig';
import { AdornmentType } from '@/helper/enum/Adornment';
import { BrickBreakMapItemType } from '@/helper/enum/BrickBreak';
import { CharacterColorType } from '@/helper/enum/PhaserGame';
import { AttributeType } from '@/views/H5/Helper/AttributeHelper';
import { CountyType } from '@/helper/enum/Common';
import { GemBombType } from '@/views/H5/Games/Bejeweled/Components/GemsManager';
import { AntiTDEnemyTeamMoveDirection, AntiTDEnemyTeamMoveMode, AntiTDItemType } from '@/helper/enum/AntiTD';
import { PiggyItemType, PiggyPatternOrderType, PiggyWaveDifficulty } from '@/views/H5/Games/Piggy/Data/PiggyConfig';
import {
  MatchingCardDifficulty,
  MatchingCardItemFunction,
  MatchingCardObstructType,
} from '@/views/H5/Games/MatchingCardGame/Data/MatchingCardConfig';
import { SnakeFoodFunctionType } from '@/views/H5/Games/Snake/Data/SnakeConfig';
import {
  SpaceInvadersEnemyMovementPattern,
  SpaceInvadersEnemyPatrolType,
  SpaceInvadersItemFunctionType,
} from '@/views/H5/Games/SpaceInvaders/Data/SpaceInvadersConfig';
//#endregion

//#endregion

//#region 星際論壇
const subjectTable: SubjectData[] = Object.values(SubjectDatas);
//#endregion

//#region 台灣區域資料
const countyTable: CountyData[] = Object.values(TwCountyName);
//#endregion

//#region 魔王賽相關
const bossTable: BossItemData[] = Object.values(BossTableData);
const bossTalkTable: BossTalkInfo[] = Object.values(BossTalkData);
//#endregion

//#region 英雄相關
const heroTable: HeroData[] = Object.values(HeroTableData);
const heroExpTable: HeroExpData[] = Object.values(HeroExpTableData);
const heroUnlockPointTable: HeroUnlockPointData[] = Object.values(HeroUnlockPointTableData);
const heroLevelTable: HeroLevelData[] = Object.values(HeroLevelTableData);
//#endregion

//#region 塔防/生物兵器
const defenseWeaponTable: DefenseWeaponData[] = Object.values(DefenseWeaponTableData);
const defenseBarrelTable: DefenseBarrelData[] = Object.values(DefenseBarrelTableData);
const defenseBombTable: DefenseBombData[] = Object.values(DefenseBombTableData);
const defenseEnemyTable: DefenseEnemyData[] = Object.values(DefenseEnemyTableData);
//#endregion

//#region 打地鼠
const hamsterTable: HamsterData[] = Object.values(HamsterTableData);
const hamsterStateTable: HamsterStateData[] = Object.values(HamsterStateTableData);
const hamsterDisplayTable: HamsterDisplayData[] = Object.values(HamsterDisplayTableData);
const hamsterEquipTable: HamsterEquipData[] = Object.values(HamsterEquipTableData);
const hamsterAttackTable: HamsterAttackData[] = Object.values(HamsterAttackTableData);
const hamsterDefenseItemTable: HamsterDefenseItemData[] = Object.values(HamsterDefenseItemTableData);
const hamsterHitItemTable: HamsterHitItemData[] = Object.values(HamsterHitItemTableData);
//#endregion

//#region 消消樂
const bejeweledBombTable: BejeweledBombData[] = Object.values(BejeweledBombTableData);
//#endregion

//#region 射擊
const shootBombTable: ShootBombData[] = Object.values(ShootBombTableData);
const shootTargetTable: ShootTargetData[] = Object.values(ShootTargetTableData);
//#endregion

//#region 跑酷
const parkourSettingTable: ParkourSettingData[] = Object.values(ParkourSettingTableData);
const parkourItemTable: ParkourItemData[] = Object.values(ParkourItemTableData);
const parkourMapTable: ParkourMapData[] = Object.values(ParkourMapTableData);
const parkourWaveTable: ParkourWaveData[] = Object.values(ParkourWaveTableData);
const parkourMapObjectTable: ParkourMapObjectData[] = Object.values(ParkourMapObjectTableData);
//#endregion

//#region 釣魚
const fishingSettingTable: FishingSettingData[] = Object.values(FishingSettingTableData);
const fishingWaveTable: FishingWaveData[] = Object.values(FishingWaveTableData);
const fishingItemTable: FishingItemData[] = Object.values(FishingItemTableData);
const fishingFishTable: FishingFishData[] = Object.values(FishingFishTableData);
//#endregion

//#region 炸彈人
const bomberManSettingTable: BomberManSettingData[] = Object.values(BomberManSettingTableData);
const bomberManItemTable: BomberManItemData[] = Object.values(BomberManItemTableData);
const bomberManStageTable: BomberManStageData[] = Object.values(BomberManStageTableData);
const bomberManEnemyTable: BomberManEnemyData[] = Object.values(BomberManEnemyTableData);
//#endregion

//#region 戰鬥系統
const combatEffectTable: EffectData[] = Object.values(CombatEffectTableData);
const combatAudioTable: AudioData[] = Object.values(CombatAudioTableData);
//#endregion

//#region 逆塔防
const antiTDEnemyTable: AntiTDEnemyData[] = Object.values(AntiTDEnemyTableData);
const antiTDEnemyTeamTable: AntiTDEnemyTeamData[] = Object.values(AntiTDEnemyTeamTableData);
const antiTDItemTable: AntiTDItemData[] = Object.values(AntiTDItemTableData);
const antiTDMapTable: TileMapData[] = Object.values(AntiTDMapTableData);
//#endregion

//#region 坦克大戰
const brickBreakerEffectTable: EffectData[] = Object.values(BrickBreakerEffectTableData);
const brickBreakerMapTable: BrickBreakerMapData[] = Object.values(BrickBreakerTableData);
const brickBreakerMapItemTable: BrickBreakerMapItemData[] = Object.values(BrickBreakerMapItemTableData);
//#endregion

//#region 小豬
const piggyItemTable: PiggyItemData[] = Object.values(PiggyItemTableData);
const piggyAudioTable: AudioData[] = Object.values(PiggyAudioTableData);
const piggyEnemyTable: PiggyEnemyData[] = Object.values(PiggyEnemyTableData);
const piggyWaveTable: PiggyWaveData[] = Object.values(PiggyWaveTableData);
const piggyEnemyPatternTable: PiggyEnemyPatternData[] = Object.values(PiggyEnemyPatternTableData);
//#endregion

//#region 貪食蛇
const snakeItemData: SnakeItemData[] = Object.values(SnakeItemTableData);
const snakeFoodTable: SnakeFoodData[] = Object.values(SnakeFoodTableData);
//#endregion

//#region 房間佈置
const adornmentItemTable: AdornmentItemData[] = Object.values(AdornmentItemTableData);
const adornmentLevelTable: AdornmentLevelData[] = Object.values(AdornmentLevelTableData);
const adornmentRoomTable: AdornmentRoomData[] = Object.values(AdornmentRoomTableData);
//#endregion

//#region 因雄宇宙
const heroUniverseMapTable: HeroUniverseTileMapData[] = Object.values(HeroUniverseMapTableData);
const heroUniversePortalEffectTable: EffectData[] = Object.values(HeroUniversePortalEffectTableData);
const heroUniversePortalRedirectTable: HeroUniversePortalRedirectData[] = Object.values(
  HeroUniversePortalRedirectTableData,
);
const heroUniverseNpcEffectTable: EffectData[] = Object.values(HeroUniverseNpcEffectTableData);
const heroUniverseNpcTable: HeroUniverseNpcData[] = Object.values(HeroUniverseNpcTableData);
const heroUniverseNpcDialogTable: HeroUniverseNpcDialogData[] = Object.values(HeroUniverseNpcDialogTableData);
//#endregion

//#region 垂直跑酷
const verticalParkourSettingTable: VerticalParkourSettingData[] = Object.values(VerticalParkourSettingTableData);
const verticalParkourObstacleWaveTable: VerticalParkourObstacleWaveData[] = Object.values(
  VerticalParkourObstacleWaveTableData,
);
const verticalParkourItemTable: VerticalParkourItemData[] = Object.values(VerticalParkourItemTableData);
//#endregion

//#region 太空侵略者
const spaceInvadersItemData: SpaceInvadersItemData[] = Object.values(SpaceInvadersItemTableData);
const spaceInvadersSettingData: SpaceInvadersSettingData[] = Object.values(SpaceInvadersSettingTableData);
const spaceInvadersWaveData: SpaceInvadersWaveData[] = Object.values(SpaceInvadersWaveTableData);
const spaceInvadersMovementPatternData: SpaceInvadersMovementPatternData[] = Object.values(
  SpaceInvadersMovementPatternTableData,
);
const spaceInvadersEnemyData: SpaceInvadersEnemyData[] = Object.values(SpaceInvadersEnemyTableData);
//#endregion

//#region 2048
const puzzle2048ItemTable: Puzzle2048ItemData[] = Object.values(Puzzle2048ItemTableData);
//#endregion

const bubbleDragonItemTable: BubbleDragonItemData[] = Object.values(BubbleDragonItemTableData);

//#region 翻翻牌
const matchingCardSettingTable: MatchingCardSettingData[] = Object.values(MatchingCardSettingTableData);
const matchingCardPatternTable: MatchingCardPatternData[] = Object.values(MatchingCardPatternTableData);
const matchingCardObstructTable: MatchingCardObstructData[] = Object.values(MatchingCardObstructTableData);
const matchingCardItemTable: MatchingCardItemData[] = Object.values(MatchingCardItemTableData);
//#endregion

//#region 測試
const testSettingTable: TestSettingData[] = Object.values(TestSettingTableData);
const testWaveTable: TestWaveData[] = Object.values(TestWaveTableData);
const testFishTable: TestFishData[] = Object.values(TestFishTableData);
const testItemTable: TestItemData[] = Object.values(TestItemTableData);
//#endregion

// 商店
const storeItemTableData: StoreItemData[] = Object.values(StoreItemTableData);

// 賽事鎖定通關密語
const contestLockPasswordInfoTableData: ContestLockPasswordInfoData[] = Object.values(ContestLockPasswordInfoTableData);
// 賽事獎勵通關密語
const contestRewardPasswordInfoTableData: ContestRewardPasswordInfoData[] = Object.values(
  ContestRewardPasswordInfoTableData,
);

/** 靜態表Manager */
export default class TableManager {
  public static subject: Readonly<TableData<SubjectData>> = new TableData(subjectTable);
  /** 台灣區域資料 */
  public static county: Readonly<TableData<CountyData>> = new TableData(countyTable);
  /** 魔王資料 */
  public static boss: Readonly<TableData<BossItemData>> = new TableData(bossTable);
  public static bossTalk: Readonly<TableData<BossTalkInfo>> = new TableData(bossTalkTable);
  /** 英雄資料 */
  public static hero: Readonly<TableData<HeroData>> = new TableData(heroTable);

  /** 英雄經驗值資料 */
  public static heroExp: Readonly<TableData<HeroExpData>> = new TableData(heroExpTable);

  /** 英雄解鎖資料 */
  public static heroUnlockPoint: Readonly<TableData<HeroUnlockPointData>> = new TableData(heroUnlockPointTable);

  /** 生物兵器資料 */
  public static defenseWeapon: Readonly<TableData<DefenseWeaponData>> = new TableData(defenseWeaponTable);
  /** 生物兵器砲管資料 */
  public static defenseBarrel: Readonly<TableData<DefenseBarrelData>> = new TableData(defenseBarrelTable);
  /** 生物兵器炮彈資料 */
  public static defenseBomb: Readonly<TableData<DefenseBombData>> = new TableData(defenseBombTable);

  /** 英雄等級對砲塔等級對應表 */
  public static heroLevel: Readonly<TableData<HeroLevelData>> = new TableData(heroLevelTable);

  /** 塔防敵人資料 */
  public static defenseEnemy: Readonly<TableData<DefenseEnemyData>> = new TableData(defenseEnemyTable);

  /** 射擊砲彈資料 */
  public static shootBomb: Readonly<TableData<ShootBombData>> = new TableData(shootBombTable);
  /** 射擊目標資料 */
  public static shootTarget: Readonly<TableData<ShootTargetData>> = new TableData(shootTargetTable);

  /** 地鼠資料 */
  public static hamster: Readonly<TableData<HamsterData>> = new TableData(hamsterTable);
  /** 地鼠出現的狀態資料 */
  public static hamsterState: Readonly<TableData<HamsterStateData>> = new TableData(hamsterStateTable);
  /** 地鼠圖片資料 */
  public static hamsterDisplay: Readonly<TableData<HamsterDisplayData>> = new TableData(hamsterDisplayTable);
  /** 地鼠裝備資料 */
  public static hamsterEquip: Readonly<TableData<HamsterEquipData>> = new TableData(hamsterEquipTable);
  /** 地鼠攻擊資料 */
  public static hamsterAttack: Readonly<TableData<HamsterAttackData>> = new TableData(hamsterAttackTable);
  /** 防禦地鼠攻擊的道具資料 */
  public static hamsterDefense: Readonly<TableData<HamsterDefenseItemData>> = new TableData(hamsterDefenseItemTable);
  /** 防禦地鼠攻擊的道具資料 */
  public static hamsterHit: Readonly<TableData<HamsterHitItemData>> = new TableData(hamsterHitItemTable);

  /** 消消樂炸彈的道具資料 */
  public static bejeweledBomb: Readonly<TableData<BejeweledBombData>> = new TableData(bejeweledBombTable);

  /** 釣魚遊戲參數 */
  public static fishingSetting: Readonly<TableData<FishingSettingData>> = new TableData(fishingSettingTable);
  /** 釣魚波數參數 */
  public static fishingWave: Readonly<TableData<FishingWaveData>> = new TableData(fishingWaveTable);
  /** 釣魚道具資料 */
  public static fishingItem: Readonly<TableData<FishingItemData>> = new TableData(fishingItemTable);
  /** 釣魚的魚參數 */
  public static fishingFish: Readonly<TableData<FishingFishData>> = new TableData(fishingFishTable);

  /** 跑酷遊戲設定 */
  public static parkourSetting: Readonly<TableData<ParkourSettingData>> = new TableData(parkourSettingTable);
  /** 跑酷道具資料 */
  public static parkourItem: Readonly<TableData<ParkourItemData>> = new TableData(parkourItemTable);
  /** 跑酷地圖資料 */
  public static parkourMap: Readonly<TableData<ParkourMapData>> = new TableData(parkourMapTable);
  /** 跑酷地圖物件 */
  public static parkourMapObject: Readonly<TableData<ParkourMapObjectData>> = new TableData(parkourMapObjectTable);
  /** 跑酷波數資料 */
  public static parkourWave: Readonly<TableData<ParkourWaveData>> = new TableData(parkourWaveTable);

  /** 炸彈超人遊戲參數 */
  public static bomberManSetting: Readonly<TableData<BomberManSettingData>> = new TableData(bomberManSettingTable);
  /** 炸彈超人道具資料 */
  public static bomberManItem: Readonly<TableData<BomberManItemData>> = new TableData(bomberManItemTable);
  /** 炸彈超人關卡資料 */
  public static bomberManStage: Readonly<TableData<BomberManStageData>> = new TableData(bomberManStageTable);
  /** 炸彈超人敵人資料 */
  public static bomberManEnemy: Readonly<TableData<BomberManEnemyData>> = new TableData(bomberManEnemyTable);

  /** 戰鬥系統特效 */
  public static combatEffect: Readonly<TableData<EffectData>> = new TableData(combatEffectTable);
  /** 戰鬥系統音效 */
  public static combatAudio: Readonly<TableData<AudioData>> = new TableData(combatAudioTable);

  /** 逆塔防敵人 */
  public static antiTDEnemy: Readonly<TableData<AntiTDEnemyData>> = new TableData(antiTDEnemyTable);
  /** 逆塔防敵人隊伍 */
  public static antiTDEnemyTeam: Readonly<TableData<AntiTDEnemyTeamData>> = new TableData(antiTDEnemyTeamTable);
  /** 逆塔防道具 */
  public static antiTDItem: Readonly<TableData<AntiTDItemData>> = new TableData(antiTDItemTable);
  /** 逆塔防地圖 */
  public static antiTDMap: Readonly<TableData<TileMapData>> = new TableData(antiTDMapTable);

  /** 坦克大戰特效 */
  public static brickBreakerEffect: Readonly<TableData<EffectData>> = new TableData(brickBreakerEffectTable);
  /** 坦克大戰地圖 */
  public static brickBreakerMap: Readonly<TableData<BrickBreakerMapData>> = new TableData(brickBreakerMapTable);
  /** 坦克大戰地圖物件 */
  public static brickBreakerMapItem: Readonly<TableData<BrickBreakerMapItemData>> = new TableData(
    brickBreakerMapItemTable,
  );

  /** 小豬音效 */
  public static piggyAudio: Readonly<TableData<AudioData>> = new TableData(piggyAudioTable);
  /** 小豬道具 */
  public static piggyItem: Readonly<TableData<PiggyItemData>> = new TableData(piggyItemTable);
  /** 小豬敵人 */
  public static piggyEnemy: Readonly<TableData<PiggyEnemyData>> = new TableData(piggyEnemyTable);
  /** 小豬波次 */
  public static piggyWave: Readonly<TableData<PiggyWaveData>> = new TableData(piggyWaveTable);
  /** 小豬敵人生成模板 */
  public static piggyEnemyPattern: Readonly<TableData<PiggyEnemyPatternData>> = new TableData(piggyEnemyPatternTable);

  /** 貪食蛇道具 */
  public static snakeItem: Readonly<TableData<SnakeItemData>> = new TableData(snakeItemData);
  /** 貪食蛇食物 */
  public static snakeFood: Readonly<TableData<SnakeFoodData>> = new TableData(snakeFoodTable);

  /** 太空侵略者道具 */
  public static spaceInvadersItem: Readonly<TableData<SpaceInvadersItemData>> = new TableData(spaceInvadersItemData);
  /** 太空侵略者設定 */
  public static spaceInvadersSetting: Readonly<TableData<SpaceInvadersSettingData>> = new TableData(
    spaceInvadersSettingData,
  );
  /** 太空侵略者波數參數 */
  public static spaceInvadersWave: Readonly<TableData<SpaceInvadersWaveData>> = new TableData(spaceInvadersWaveData);
  /** 太空侵略者移動模式參數 */
  public static spaceInvadersMovementPattern: Readonly<TableData<SpaceInvadersMovementPatternData>> = new TableData(
    spaceInvadersMovementPatternData,
  );
  /** 太空侵略者敵人 */
  public static spaceInvadersEnemy: Readonly<TableData<SpaceInvadersEnemyData>> = new TableData(spaceInvadersEnemyData);

  /** 房間佈置的裝飾物 */
  public static adornmentItem: Readonly<TableData<AdornmentItemData>> = new TableData(adornmentItemTable);
  /** 房間佈置的等級 */
  public static adornmentLevel: Readonly<TableData<AdornmentLevelData>> = new TableData(adornmentLevelTable);
  /** 房間佈置的房間 */
  public static adornmentRoom: Readonly<TableData<AdornmentRoomData>> = new TableData(adornmentRoomTable);

  /** 因雄宇宙地圖 */
  public static heroUniverseMap: Readonly<TableData<HeroUniverseTileMapData>> = new TableData(heroUniverseMapTable);
  /** 因雄宇宙傳送門特效 */
  public static heroUniversePortalEffect: Readonly<TableData<EffectData>> = new TableData(
    heroUniversePortalEffectTable,
  );
  /** 因雄宇宙傳送門重新導向 */
  public static heroUniversePortalRedirect: Readonly<TableData<HeroUniversePortalRedirectData>> = new TableData(
    heroUniversePortalRedirectTable,
  );
  /** 因雄宇宙Npc特效 */
  public static heroUniverseNpcEffect: Readonly<TableData<EffectData>> = new TableData(heroUniverseNpcEffectTable);
  /** 因雄宇宙Npc */
  public static heroUniverseNpc: Readonly<TableData<HeroUniverseNpcData>> = new TableData(heroUniverseNpcTable);
  /** 因雄宇宙Npc對話 */
  public static heroUniverseNpcDialog: Readonly<TableData<HeroUniverseNpcDialogData>> = new TableData(
    heroUniverseNpcDialogTable,
  );

  /** 垂直跑酷設定 */
  public static verticalParkourSetting: Readonly<TableData<VerticalParkourSettingData>> = new TableData(
    verticalParkourSettingTable,
  );
  /** 垂直跑酷怪物波數 */
  public static verticalParkourObstacleWave: Readonly<TableData<VerticalParkourObstacleWaveData>> = new TableData(
    verticalParkourObstacleWaveTable,
  );
  /** 垂直跑酷道具 */
  public static verticalParkourItem: Readonly<TableData<VerticalParkourItemData>> = new TableData(
    verticalParkourItemTable,
  );

  /** 2048道具 */
  public static puzzle2048Item: Readonly<TableData<Puzzle2048ItemData>> = new TableData(puzzle2048ItemTable);

  public static bubbleDragonItem: Readonly<TableData<BubbleDragonItemData>> = new TableData(bubbleDragonItemTable);

  /** 翻翻牌遊戲的敵人 */
  public static matchingCardSetting: Readonly<TableData<MatchingCardSettingData>> = new TableData(
    matchingCardSettingTable,
  );
  public static matchingCardPattern: Readonly<TableData<MatchingCardPatternData>> = new TableData(
    matchingCardPatternTable,
  );
  public static matchingCardObstruct: Readonly<TableData<MatchingCardObstructData>> = new TableData(
    matchingCardObstructTable,
  );
  public static matchingCardItem: Readonly<TableData<MatchingCardItemData>> = new TableData(matchingCardItemTable);

  /** 測試遊戲參數 */
  public static testSetting: Readonly<TableData<TestSettingData>> = new TableData(testSettingTable);
  /** 測試波數參數 */
  public static testWave: Readonly<TableData<TestWaveData>> = new TableData(testWaveTable);
  /** 測試的魚參數 */
  public static testFish: Readonly<TableData<TestFishData>> = new TableData(testFishTable);
  /** 測試的道具 */
  public static testItem: Readonly<TableData<TestItemData>> = new TableData(testItemTable);

  /** 商店 */
  public static storeItem: Readonly<TableData<StoreItemData>> = new TableData(storeItemTableData);

  /** 賽事鎖定通關密語 */
  public static contestLockPasswordInfo: Readonly<TableData<ContestLockPasswordInfoData>> = new TableData(
    contestLockPasswordInfoTableData,
  );
  /** 賽事獎勵通關密語 */
  public static contestRewardPasswordInfo: Readonly<TableData<ContestRewardPasswordInfoData>> = new TableData(
    contestRewardPasswordInfoTableData,
  );
}

/** 地圖資料 */
export interface TileMapData {
  id: number;
  nameKey: string;
  url: string;
}

/** 音效資料 */
export interface AudioData {
  id: number;
  /** 名稱，供方便查找 */
  nameKey: string;
  /** 音檔位址 */
  url: string;
}

/** 小遊戲道具資料 */
export interface ItemData {
  /** 道具ID */
  id: number;
  /** Resource Key & 多國Key */
  nameKey: string;
  /** 道具說明多國Key */
  contentKey: string;
  /** 道具圖片路徑 */
  url: string;
  /** 快閃店價格 */
  energy: number;
}

/** 戰鬥道具資料 */
export interface CombatItemData extends ItemData, PriceData {
  /** 道具價格(前端沒用到) */
  itemPrice: number;
  /** 道具等級 */
  itemLevel: number;
  /** 消耗魔力 */
  magic: number;
  /** 冷卻時間 */
  cooldown: number;
  /** 道具功能 */
  itemFunction: ItemFunction;
  /** 生成物件功能(如果有) */
  spawnObjectFunction: ProjectileFunction | MinionFunction;
  /** 生成物件尺寸(如果有) */
  spawnObjectSize: number;
  /** 生成物件速度(如果有) */
  spawnObjectSpeed: number;
  /** 生成物件角度(弧度)(如果有) */
  spawnObjectAngle: number;
  /** 生成物件穿透數(如果有) */
  spawnObjectPenetration: number;
  /** 生成物件存活秒數(如果有) */
  spawnObjectSurvivalTime: number;
  /** 生成物件數量(如果有) */
  spawnObjectAmount: number;
  /** 常駐特效Id清單(不縮放) */
  continuousEffectWithoutScaleIdList: number[];
  /** 常駐特效Id清單 */
  continuousEffectIdList: number[];
  /** 施放特效Id清單 */
  channelEffectIdList: number[];
  /** 特效Id清單 */
  effectIdList: number[];
  /** 填滿特效Id清單 */
  fillEffectIdList: number[];
  /** 擊中特效Id清單 */
  onHitEffectIdList: number[];
  /** 擊中障礙物特效Id清單 */
  onHitObstacleEffectIdList: number[];
  /** 音效Id */
  audioId: number;
  /** 偵測範圍 */
  range: number;
  /** 互動數值變化 */
  interactionValue: number;
  /** 是否為百分比攻擊 */
  isPercentage: boolean;
  /** 道具互動類型(魔力、攻擊力、速度等) */
  interactionType: InteractionType;
  /** 互動數值變化2 */
  interactionValue2: number;
  /** 是否為百分比攻擊2 */
  isPercentage2: boolean;
  /** 道具互動類型(魔力、攻擊力、速度等)2 */
  interactionType2: InteractionType;
  /** 道具持續時間 */
  activeDuration: number;
  /** 道具持續時，發動間隔 */
  activeInterval: number;
  /** 道具互動持續時間 */
  interactionTime: number;
  /* 擊中生成類型 */
  spawnOnHitType: SpawnOnHitType;
  /** 擊中後產生的新道具 */
  spawnOnHitItemId: number;
  /** 前置解鎖Id */
  unlockId: number;
}

/** 價格資料 */
export interface PriceData {
  /** 金幣價格 */
  goldCost: number;
  /** 晶球價格 */
  crystalCost: number;
}

/** 特效資料 */
export interface EffectData {
  id: number;
  /** 名稱，供方便查找 */
  nameKey: string;
  /** 是否顯示在角色圖層之上 */
  aboveCharacter: boolean;
  /** 染色 */
  tint: number;
  /** 動畫速率 */
  frameRate: number;
  /** 動畫尺寸，統一都正方形 */
  frameSize: number;
  /** 起始縮放 */
  fromScale: number;
  /** 目標縮放 */
  toScale: number;
  /** 起始Y */
  fromY: number;
  /** 目標Y */
  toY: number;
  /** 起始X */
  fromX: number;
  /** 目標X */
  toX: number;
  /** 起始角度 */
  fromAngle: number;
  /** 目標角度 */
  toAngle: number;
  /** 起始透明度 */
  fromAlpha: number;
  /** 目標透明度 */
  toAlpha: number;
  /** 來回播放 */
  yoyo: boolean;
  /** 動畫時長 */
  duration: number;
  /** 重複播放 */
  repeat: number;
  /** 關鍵幀(到達關鍵幀才發動攻擊) */
  keyTime: number;
  /** 動畫實際碰撞大小(一定小或等於frameSize) */
  bodySize: number;
  /** 圖片位址 */
  url: string;
}

/** 角色靜態表基本資料 */
export interface BaseCharacterData {
  /** 角色ID */
  id: number;
  /** 角色名稱 */
  nameKey: string;
  /** 圖片路徑 */
  url: string;
  /** 角色顏色類別 */
  colorType: CharacterColorType;
  /** 角色屬性 */
  attribute: AttributeType;
}

/** 英雄靜態表資料格式 */
export interface HeroData extends BaseCharacterData {
  /** 介紹頁說明(前端沒用到) */
  introKey: string;
  /** 介紹頁圖片路徑(前端沒用到) */
  introUrl: string;

  /** 英雄血量 */
  hp: number;
  /** 科目 */
  subject: number;
  /** 身高比例，以牛魔王(1)為準 */
  heightScale: number;

  /** 射擊對應炸彈 */
  shootBonusBombId: number;
  /** 消消樂對應炸彈 */
  bejeweledBonusBombId: number;
  /** 塔防對應砲台id */
  defenseWeaponId: number;

  /** 逆塔防血量 */
  antiTDHp: number;
  /** 逆塔防移動速度 */
  antiTDSpeed: number;
  /** 逆塔防對應道具Id(212) */
  antiTDItemId: number;
  /** 逆塔防防禦力 */
  antiTDDefense: number;
  /** 逆塔防道具種類(物理、詛咒等) */
  antiTDItemTypes: string;
  /** 逆塔防人物大小縮放 */
  antiTDSizeScale: number;

  /** 翻翻牌-英雄圖上方位置 */
  matchingCardHeroImageTop: number;
  /** 翻翻牌-英雄圖左方位置 */
  matchingCardHeroImageLeft: number;
  /** 翻翻牌-英雄圖縮放 */
  matchingCardHeroImageScale: number;
}

/** 英雄經驗值靜態表資料格式 */
export interface HeroExpData {
  id: number;
  level: number;
  maxExp: number;
}

/** 英雄解鎖靜態表資料格式 */
export interface HeroUnlockPointData {
  /** 等級 */
  id: number;
  /** 因為server那邊大寫,因此不改小寫 */
  UnLockPoint: number;
}

/** 生物兵器靜態表資料格式 */
export interface DefenseWeaponData extends ItemData {
  level: number;
  attribute: number;
  attack: number;
  attackRange: number;
  attackSpeed: number;
  goldCost: number;
  crystalCost: number;
  magic: number;
  barrelId: number;
  bombId: number;
  isPlanetWar: number;
  unlockId: number;
  heroId: number;
}

/** 生物兵器砲管靜態表資料格式 */
export interface DefenseBarrelData {
  id: number;
  nameKey: string;
  url: string;
}

/** 生物兵器砲彈靜態表資料格式 */
export interface DefenseBombData {
  id: number;
  nameKey: string;
  url: string;
}

/** 英雄等級對塔防砲塔/星球大戰等級對應表 */
export interface HeroLevelData {
  id: number;
  heroLevel: number;
  planetWarLevel: number;
  defenseWeaponLevel: number;
}

/** 塔防敵人資料 */
export interface DefenseEnemyData extends BaseCharacterData {
  hp: number;
  attack: number;
  speed: number;
  magic: number;
  score: number;
  width: number;
  height: number;
}

/** 消消樂炸彈資料 */
export interface BejeweledBombData extends ItemData {
  /** 中文名稱 */
  name: string;
  /** 炸彈類型 */
  itemFunction: GemBombType;
}

/** 射擊砲彈資料 */
export interface ShootBombData extends ItemData {
  sprite: string;
  attack: number;
  width: number;
  height: number;
}

/** 射擊目標資料 */
export interface ShootTargetData {
  id: number;
  nameKey: string;
  hp: number;
  url: string;
}

/** 地鼠狀態資料 */
export interface HamsterStateData {
  id: number;
  nameKey: string;
  normalCount: number;
  raidCount: number;
  enemyCount: number;
  countMin: number;
  countMax: number;
  appearMin: number;
  appearMax: number;
}

/** 地鼠靜態資料 */
export interface HamsterData {
  id: number;
  hits: number;
  type: number;
  appearTime: number;
  displayKey: string;
  dieDisplayKey: string;
  attackTime: number;
  attackId: number;
  damageRatio: number;
  defenseId: number;
  equipId: number;
  equipPosX: number;
  equipPosY: number;
}

/** 地鼠圖片資料 */
export interface HamsterDisplayData {
  id: number;
  nameKey: string;
  url: string;
  dieNameKey: string;
  dieUrl: string;
}

/** 地鼠裝備資料 */
export interface HamsterEquipData {
  id: number;
  nameKey: string;
  url: string;
}

/** 地鼠攻擊資料 */
export interface HamsterAttackData {
  id: number;
  nameKey: string;
  url: string;
}

/** 英雄防禦資料 */
export interface HamsterDefenseItemData extends ItemData {
  /** 中文名稱 */
  name: string;
}

/** 攻擊地鼠資料 */
export interface HamsterHitItemData extends ItemData {
  spriteKey: string; // 動圖的nameKey
  hits: number;
}

/** 釣魚道具資料 */
export interface FishingItemData extends ItemData {
  /** 道具持續時間秒數 */
  duration: number;
  /** 道具對應類別 */
  itemFunction: number;
  /** 傾盆大魚專用參數: 掉落魚的種類、機率 */
  appearTypeList: number[];
  /** 加速、漁網專用參數: 加速倍數、漁網大小倍數 */
  multiply: number;
}

/** 釣魚遊戲設定參數資料 */
export interface FishingSettingData {
  id: number;
  /** 目標得分，超過即獲勝 */
  targetScore: number;
  /** 最大能量值 */
  maxEnergy: number;
  /** 英雄基礎速度 */
  heroMoveSpeed: number;
  /** 釣魚線基礎速度 */
  fishingLineSpeed: number;
  /** 釣魚網基礎速度 */
  fishingNetSpeed: number;
  /** 魔力值基礎消耗 */
  baseConsumption: number;
  /** 魔力值漸進消耗 */
  progressiveConsumption: number;
  /** 每達到多少漁獲量，增加一次魔力值漸進消耗 */
  catchAmountGap: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;
}

/** 釣魚遊戲魚資料 */
export interface FishingFishData {
  id: number;
  /** 名稱 */
  nameKey: string;
  /** 描述 */
  contentKey: string;
  /** 特效 */
  fishFx: number;
  /** 環保加成類別 */
  environmentalAddition: number;
  /** 得分 */
  score: number;
  /** 恢復能量 */
  energy: number;
  /** 魚跳躍的力道 */
  jumpForce: number;
  /** 魚跳躍橫向加速度最大值 */
  maxJumpSpeed: number;
  /** 游泳時速度區間 */
  minSwimSpeed: number;
  maxSwimSpeed: number;
  /** 弦波的振幅(上下的幅度) */
  sineAmplitude: number;
  /** 弦波的週期(上下一次要多久)，秒 */
  sinePeriod: number;
  /** 縮放比例 */
  scale: number;
  /** 圖片位址，目前魚統一尺寸，119*119 */
  url: string;
}

/** 釣魚遊戲波數資料 */
export interface FishingWaveData {
  id: number;
  /** 全域魚游泳速度加乘 */
  speedMultiply: number;
  /** 可出現種類及機率(數字列表) */
  appearTypeList: number[];
  /** 每秒生成的數量 */
  amountPerSecond: number;
  /** 持續時間，秒 */
  duration: number;
  /** 結束後與下一波的間隔時間，秒 */
  delayAfterFinish: number;
}

/** 跑酷遊戲設定 */
export interface ParkourSettingData {
  id: number;
  /** 最大能量值 */
  maxEnergy: number;
  /** 倒數秒數，s為單位 */
  countDown: number;
  /** 每秒固定得分量(會乘上速度倍數) */
  gainScorePerSecond: number;
  /** 目標得分量 */
  targetScore: number;
  /** 掉落到螢幕外時扣的魔力值 */
  fallDamage: number;
  /** 英雄跳躍力道 */
  heroJumpForce: number;
  /** 英雄移動速度 */
  heroRunSpeed: number;
  /** 英雄飛行速度 */
  heroFlySpeed: number;
  /** 英雄重生速度 */
  heroRespawnSpeed: number;
  /** 英雄重生回復速度 */
  heroRespawnRecoverySpeed: number;
  /** 魔力值基礎消耗 */
  baseConsumption: number;
  /** 魔力值漸進消耗 */
  progressiveConsumption: number;
  /** 每達到多少鑽石量，增加一次魔力值漸進消耗 */
  diamondAmountGap: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;
}

/** 跑酷道具資料 */
export interface ParkourItemData extends ItemData {
  /** 速度道具專用，速度加成 */
  multiply: number;
  /** 道具持續時間，秒 */
  duration: number;
  /** 道具對應類別 */
  itemFunction: number;
}

/** 跑酷地圖波數參數 */
export interface ParkourWaveData {
  id: number;
  /** 會出現的地圖及機率(數字列表) */
  mapList: number[];
  /** 跑過幾張地圖才會結束這一波 */
  mapAmount: number;
}

/** 跑酷地圖資料 */
export interface ParkourMapData {
  id: number;
  /** 地圖左半Key */
  leftHalfNameKey: string;
  /** 地圖右半Key */
  rightHalfNameKey: string;
}

/** 跑酷地圖物件參數 */
export interface ParkourMapObjectData {
  id: number;
  /** 名子Key */
  nameKey: string;
  /** 內容Key */
  contentKey: string;
  /** 物件類別 */
  tileType: string;
  /** 物件分數 */
  score: number;
  /** 物件魔力值 */
  energy: number;
  /** 物件圖源 */
  url: string;
}

//#region bomber
/** 炸彈超人-遊戲靜態表 */
export interface BomberManSettingData {
  /** 遊戲id(未使用) */
  id: number;

  //#region 分數
  /** 目標得分，超過即獲勝 */
  targetScore: number;
  /** 剩餘魔力轉換成分數比率(分數/魔力) */
  energyScoreRatio: number;

  /** 炸毀牆得分 */
  destroyWallScore: number;
  /** 撿取道具得分 */
  pickItemScore: number;
  //#endregion 分數

  //#region 能量
  /** 能量流逝事件的間隔秒數 */
  energyDropIntervalSec: number;
  /** 每秒增加的能量流逝 */
  energyDropIncresePerInterVal: number;
  /** 最大能量值 */
  maxEnergyAmount: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;

  /** 英雄碰觸敵人損失能量(負數) */
  heroHitEnemyDamage: number;
  /** 英雄碰觸爆風損失能量(負數) */
  heroHitBlastDamage: number;
  /** 英雄放置炸彈消耗能量(負數) */
  heroPutBombCost: number;
  /** 殺敵獲得能量 */
  killEnemyGainEnergy: number;
  /** 炸毀牆加能量 */
  destroyWallGainEnergy: number;
  //#endregion 能量

  //#region 英雄
  /** 英雄出生點格子座標x(0~n) */
  heroSpawnTileX: number;
  /** 英雄出生點格子座標y(0~n) */
  heroSpawnTileY: number;
  /** 英雄預設的炸彈爆風lv */
  heroBaseBlastLv: number;
  /** 預設的炸彈數量lv */
  heroBaseBombCountLv: number;
  /** 玩家基本移動速度(格/秒) */
  heroBaseMoveSpeed: number;
  //#endregion 英雄

  //#region 敵人
  /** 下一波提示秒數 */
  nextWavePromptSec: number;
  /** 英雄附近幾格內，不生成敵人(單位:格子座標tile) */
  spawnEnemyDistance: number;
  /** 殺敵數轉換成金錢比率(金錢/殺敵數) */
  killEnemyCoinRatio: number;
  //#endregion 敵人

  //#region 地圖物件參數
  /** 英雄附近幾格內，不生成地圖物件(單位:格子座標tile) */
  spawnMapObjectDistance: number;

  /** 炸彈引爆秒數 */
  bombExplosionSec: number;
  //#endregion 地圖物件參數
}

/** 炸彈超人-道具資料 */
export interface BomberManItemData extends ItemData {
  /** 物品功能類型 */
  itemFunction: BomberManItemFunction;
  /** 地圖專用的道具 */
  isMapItem: MapItemType;
  /** 獲得道具後，增加道具lv */
  plusItemLv: number;
  /** 使用道具後，持續秒數 */
  duration: number;
}

/** 炸彈超人-關卡資料 */
export interface BomberManStageData {
  /** 關卡id */
  id: number;
  /** 地圖編號: 用來對應不同的地圖 */
  mapJsonId: number;
  /** 關卡可用秒數 */
  countDownSec: number;

  /** 波次間隔秒數(提示秒數nextWavePromptSec後才生成下一波)(-1: 等清完敵人才出) */
  waveIntervalSec: number;

  /** 每波次的登場敵人id
   * ex: 1,2,3 表示3波
   */
  waveEnemyIDList: number[];
  /** 每波次的登場敵人數量
   * ex: 3,3,5 表示3波
   */
  waveEnemyCountList: number[];

  /** 可摧毀牆的密度(0.0~1.0)
   * 牆的數量 要 > 玩家兌換道具的數量上限
   */
  wallDensity: number;

  /** 地圖專用道具id清單 */
  bonusItemIDList: number[];
}

/** 炸彈超人-敵人資料 */
export interface BomberManEnemyData extends BaseCharacterData {
  /** 殺敵得分 */
  killEnemyScore: number;

  /** 敵人走路速率 下限(格/秒) */
  enemyMoveSpeedMin: number;
  /** 敵人走路速率 上限(格/秒) */
  enemyMoveSpeedMax: number;

  /** 敵人移動方式 (未指定時，隨機抽選) */
  enemyMoveType: EnemyMoveType;
  /** 敵人移動時偏好方向(沿牆走:左/右; 遇牆轉:左/右) */
  enemyMovePreferArrow: PathDirectionType;
}
//#endregion bomber

//#region antiTD
/** 逆塔防道具資料 */
export interface AntiTDItemData extends CombatItemData {
  /** 道具種類(物理、詛咒等) */
  heroItemType: AntiTDItemType;
}

/** 逆塔防敵人資料，因敵人有大量資料與英雄相同，因此直接繼承HeroData */
export interface AntiTDEnemyData extends HeroData {
  /** 打倒後增加的魔力 */
  magic: number;
  /** 打倒後的分數 */
  score: number;
}

/** 逆塔防敵人隊伍資料 */
export interface AntiTDEnemyTeamData {
  id: number;
  /** 隊伍長度 */
  teamLength: number;
  /** 特定隊長，0表示不指定 */
  leaderEnemyId: number;
  /** 可能出現的敵人id，ex:[1,2,2,2,3] */
  enemiesId: string;
  /** 攻擊模式 */
  attackMode: BattleUnitAttackMode;
  /** 是否忽略障礙物(飛行系敵人) */
  ignoreObstacle: boolean;
  /** 移動模式 */
  moveMode: AntiTDEnemyTeamMoveMode;
  /** 移動模式參考點X1 */
  movePointX1: number;
  /** 移動模式參考點Y1 */
  movePointY1: number;
  /** 移動模式參考點X2 */
  movePointX2: number;
  /** 移動模式參考點Y2 */
  movePointY2: number;
  /** 移動模式偏移X */
  movePointOffsetX: number;
  /** 移動模式偏移Y */
  movePointOffsetY: number;
  /** 移動方向 */
  moveDirection: AntiTDEnemyTeamMoveDirection;
  /** 對應生成點Ids */
  spawnPointIds: string;
}
//#endregion

//#region brickBreaker
/** 坦克大戰地圖資料 */
export interface BrickBreakerMapData {
  /** 地圖ID */
  id: number;
  /** 地圖名稱 */
  mapName: string;
}

/** 坦克大戰地圖物件資料 */
export interface BrickBreakerMapItemData {
  /** 物件ID */
  id: number;
  /** 物件名稱 */
  nameKey: string;
  /** 物件類型 */
  itemType: BrickBreakMapItemType;
  /** 物件說明 */
  contentKey: string;
  /** 物件圖片檔名 */
  imgUrl: string;
}
//#endregion

//#region piggy
/** 小豬道具資料繼承CombatItemData */
export interface PiggyItemData extends CombatItemData {
  /** 小豬道具種類 */
  piggyItemType: PiggyItemType;
}

/** 小豬敵人資料繼承HeroData */
export interface PiggyEnemyData extends HeroData {
  /** 打倒後增加的魔力 */
  magic: number;
  /** 打倒後的分數 */
  score: number;
  /** 近戰道具 */
  meleeItemId: number;
  /** 近戰攻擊次數 */
  meleeTimes: number;
}

/** 小豬波數資料 */
export interface PiggyWaveData {
  id: number;
  /** 全域敵人速度加乘 */
  enemySpeedMultiply: number;
  /** 敵人出現種類及機率(數字列表) */
  enemyAppearType: number[];
  /** 模板出現種類及機率(數字列表) */
  patternList: number[];
  /** 模板是否照順序 */
  patternOrderType: PiggyPatternOrderType;
  /** 模板間間隔，秒 */
  patternInterval: number;
  /** 結束後與下一波的間隔時間，秒 */
  waveInterval: number;
  /** 難度 */
  difficulty: PiggyWaveDifficulty;
}

/** 小豬敵人模板資料 */
export interface PiggyEnemyPatternData {
  id: number;
  /** 敵人生成資料列表 */
  spawnDataList: PiggySpawnData[];
}

/** 小豬敵人生成資料 */
export interface PiggySpawnData {
  /** 絕對時間，秒 */
  time: number;
  /** 生成的所有點位 */
  spawnPointList: number[];
}
//#endregion

//#region snake
/** 貪食蛇道具資料 */
export interface SnakeItemData extends ItemData {
  /** 生成的食物種類 */
  generateSnakeFoodId: number;
}

/** 貪食蛇食物資料 */
export interface SnakeFoodData {
  id: number;
  /** 名稱 */
  nameKey: string;
  /** 描述 */
  contentKey: string;
  /** 得分 */
  score: number;
  /** 吃下食物時觸發的特殊功能 */
  functionType: SnakeFoodFunctionType;
  /** 是否屬於垃圾食物 */
  isJunkFood: boolean;
  /** 場上出現秒數 */
  appearSeconds: number;
  /** 圖片位址 */
  url: string;
}
//#endregion

//#region spaceInvaders
/** 太空侵略者道具資料 */
export interface SpaceInvadersItemData extends ItemData {
  /** 功能種類 */
  functionType: SpaceInvadersItemFunctionType;
}

/** 太空侵略者遊戲設定資料 */
export interface SpaceInvadersSettingData {
  /** id */
  id: number;
  /** 玩家預設血量 */
  playerDefaultHealth: number;
  /** 目標分數 */
  targetScore: number;
  /** 玩家普通攻擊間隔時間(毫秒) */
  normalAttackInterval: number;
  /** 玩家在遊戲開始的座標Y值 */
  playerStartPositionY: number;
  /** 玩家的直線移動速度 */
  playerVelocity: number;
  /** 使用道具使敵人速度減慢 的減慢比例 */
  slowDownTimeScale: number;
  /** 使用道具使敵人速度減半 的持續時間(秒) */
  slowDownEnemiesSeconds: number;
  /** 敵人射擊間隔時間 最小值(毫秒) */
  enemyFireIntervalMin: number;
  /** 敵人射擊間隔時間 最大值(毫秒) */
  enemyFireIntervalMax: number;
  /** 敵人子彈速度 */
  enemyBulletSpeed: number;
  /** 玩家子彈速度 */
  playerBulletSpeed: number;
  /** 摧毀敵人所增加的分數 */
  scorePerEnemy: number;
  /** 受傷時的無敵時間(秒) */
  invincibleTimeOnHit: number;
  /** 無敵道具持續時間(秒) */
  invincibleTimeUseItem: number;
  /** 圓形爆炸半徑 */
  circleExplodeRange: number;
  /** 直線爆炸寬度 */
  lineExplodeWidth: number;
}

/** 太空侵略者波數資料 */
export interface SpaceInvadersWaveData {
  id: number;
  /** 進場時間點(秒) */
  time: number;
  /** 敵人移動模式 */
  movementPattern: SpaceInvadersEnemyMovementPattern;
  /** 敵人類型 */
  enemyId: number;
  /** 敵人生成數量 */
  enemyCount: number;
  /** 敵人駐足場中的秒數(有些移動模式此值無效) */
  patrolSeconds: number;
  /** 敵人駐足場中時的巡邏方式 */
  patrolType: SpaceInvadersEnemyPatrolType;
  /** 敵人移動速度(倍率) */
  enemySpeed: number;
  /** 敵人體型大小(倍率) */
  enemySize: number;
}

/** 太空侵略者敵人移動模式設定值 */
export interface SpaceInvadersMovementPatternData {
  /** 流水號 */
  id: number;
  /** 說明 */
  describe: string;
  /** 敵人生成座標-範圍左上x值 */
  spawnRangeMinX: number;
  /** 敵人生成座標-範圍左上y值 */
  spawnRangeMinY: number;
  /** 敵人生成座標-範圍右下x值 */
  spawnRangeMaxX: number;
  /** 敵人生成座標-範圍右下y值 */
  spawnRangeMaxY: number;
  /** 敵人停留座標-範圍左上x值 */
  patrolRangeMinX: number;
  /** 敵人停留座標-範圍左上y值 */
  patrolRangeMinY: number;
  /** 敵人停留座標-範圍右下x值 */
  patrolRangeMaxX: number;
  /** 敵人停留座標-範圍右下y值 */
  patrolRangeMaxY: number;
  /** 敵人退場座標-範圍左上x值 */
  exitRangeMinX: number;
  /** 敵人退場座標-範圍左上y值 */
  exitRangeMinY: number;
  /** 敵人退場座標-範圍右下x值 */
  exitRangeMaxX: number;
  /** 敵人退場座標-範圍右下y值 */
  exitRangeMaxY: number;
}

/** 太空侵略者敵人資料 */
export interface SpaceInvadersEnemyData {
  /** 敵人ID */
  id: number;
  /** 名稱 */
  nameKey: string;
  /** 血量 */
  hp: number;
  /** 受傷圖案對應圖片寬度之比例 */
  hurtScaleToWidth: number;
}

//#endregion

/** 魔王資料 */
export interface BossItemData {
  /** 魔王ID */
  id: number;
  /** 魔王名稱 */
  bossName: string;
  /** 魔王Key*/
  bossNameKey: string;
  /** 魔王圖片 */
  imgUrl: string;

  /** 翻翻牌-魔王縮放 */
  matchingCardScale: number;
  /** 翻翻牌-魔王左方位置 */
  matchingCardLeft: number;
  /** 翻翻牌-魔王上方位置 */
  matchingCardTop: number;
}

/** 魔王表演對話組類型 */
export enum BossTalkInfoType {
  Opening = 1,
  Ending = 2,
  Common = 3,
}

/** 魔王賽對話資料 */
export interface BossTalkInfo {
  /** 對話ID */
  id: number;
  /** 台詞 */
  msg: BossMsgData[];
  /** 台詞 */
  type: BossTalkInfoType;
}

/** BossMsgData 說話者enum */
export enum BossMsgDataRoleType {
  Hero = 1,
  Boss = 2,
}

/** 魔王賽對話台詞 */
export interface BossMsgData {
  /** 講話者 */
  roleType: BossMsgDataRoleType;
  /** 台詞Key */
  key: string;
}

// 學科
export interface SubjectData {
  id: number;
  subject_groupings_id: number;
  subject_groupings_name: string;
}

/** 台灣區域資料 */
export interface CountyData {
  /** 區域名稱 */
  countyName: string;
  /** 區域代號 */
  codeName: string;
  /** 區域ID */
  id: CountyType;
}

//#region Adornment
/** 房間佈置的裝飾物-靜態表 */
export interface AdornmentItemData extends ItemData, PriceData {
  /** 裝飾物類別 */
  adornmentType: AdornmentType;
  /** 佈置積分 */
  adornmentScore: number;
  /** 物品寬度 */
  itemWidth: number;
  /** 物品高度 */
  itemHeight: number;
  /** 物品y軸偏移 */
  itemOffsetY: number;
}

/** 房間佈置的等級-靜態表 */
export interface AdornmentLevelData {
  /** 房間佈置等級 */
  id: number;
  /** 升級需要英雄總積分 */
  nextLevelPoint: number;
  /** 解鎖大房間額度 */
  unlockBigRoomQuota: number;
  /** 解鎖小房間額度 */
  unlockSmallRoomQuota: number;
}

/** 房間佈置的房間-靜態表 */
export interface AdornmentRoomData {
  /** 房間佈置等級 */
  id: number;
  /** 層數 */
  floor: number;
  /** 格數(左1中2右3) */
  slot: number;
  /** 房間大小 */
  roomSize: AdornmentRoomSizeType;
}

//#endregion Adornment

//#region 翻翻牌

// 翻翻牌-參數
export interface MatchingCardSettingData {
  /** 遊戲id(未使用) */
  id: number;

  //#region 分數
  /** 目標配對正確數，超過即獲勝 */
  targetMatchCount: number;

  /** 卡牌配對成功得分 */
  cardMatchScore: number;
  //#endregion 分數

  //#region 能量
  /** 最大能量值 */
  maxEnergyAmount: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;

  /** 卡牌配對失敗損失能量(負數) */
  cardNotMatchLossEnergy: number;
  /** 避免配對失敗處罰額度 */
  avoidNotMatchPenaltyQuota: number;
  /** 能量值基礎消耗 */
  baseConsumption: number;
  /** 能量值漸進消耗 */
  progressiveConsumption: number;
  /** 每達到多少配對數，增加一次能量值漸進消耗 */
  matchCountGap: number;

  /** 卡牌配對成功獲得能量 */
  cardMatchGainEnergy: number;
  //#endregion 能量

  /** 遊戲總時間(秒) */
  totalGameTimeSec: number;
  /** 下一波提示秒數 */
  nextWavePromptSecond: number;
  /** 配對失敗後等待時間 */
  notMatchWaitSecond: number;

  /** 起始看牌秒數 */
  initViewSecond: number;
  /** 點擊卡牌扣除鎖定秒數 */
  clickCardMinusLockSecond: number;
}

/** 模式資料 */
export interface MatchingCardPatternData {
  /** 模式ID */
  id: number;
  /** 難度 */
  difficulty: MatchingCardDifficulty;
  /** 牌數 */
  cardCount: number;
  /** 花色數 */
  cardTypeCount: number;
  /** 干擾ID清單 */
  obstructIDList: number[];
  /** 出現干擾的機率(0~1) */
  obstructRate: number;
}

/** 干擾資料 */
export interface MatchingCardObstructData {
  /** 干擾ID */
  id: number;
  /** 干擾方式 */
  obstructType: MatchingCardObstructType;
  /** 干擾持續秒數 */
  obstructDurationSec: number;
  /** 干擾的卡牌張數 */
  obstructCardCount: number;
}

/** 翻翻牌-道具資料 */
export interface MatchingCardItemData extends ItemData {
  /** 物品功能類型 */
  itemFunction: MatchingCardItemFunction;
  /** 使用道具後，增減數值 */
  value: number;
  /** 使用道具後，持續秒數 */
  duration: number;
  /** 冷卻秒數 */
  cooldownSec: number;
}
//#endregion 翻翻牌

/** 商店物品 */
export interface StoreItemData {
  /** 編號 */
  id: number;
  /** 商店ID */
  storeId: number;
  /** 道具ID */
  itemId: number;
}

//#region 泡泡龍道具
export interface BubbleDragonItemData extends ItemData {
  /** 道具等級 */
  itemLevel: number;
  /** 道具功能 */
  itemFunction: number;
  /** 泡泡團片 */
  bubbleImage: string;
}
//#endregion

//#region 測試
/** 測試設定參數資料 */
export interface TestSettingData {
  id: number;
  /** 目標得分，超過即獲勝 */
  targetScore: number;
  /** 最大能量值 */
  maxEnergy: number;
  /** 英雄基礎速度 */
  heroMoveSpeed: number;
  /** 釣魚線基礎速度 */
  fishingLineSpeed: number;
  /** 釣魚網基礎速度 */
  fishingNetSpeed: number;
  /** 魔力值基礎消耗 */
  baseConsumption: number;
  /** 魔力值漸進消耗 */
  progressiveConsumption: number;
  /** 每達到多少漁獲量，增加一次魔力值漸進消耗 */
  catchAmountGap: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;
}

/** 測試魚資料 */
export interface TestFishData {
  id: number;
  /** 名稱 */
  nameKey: string;
  /** 描述 */
  contentKey: string;
  /** 特效 */
  fishFx: number;
  /** 環保加成類別 */
  environmentalAddition: number;
  /** 得分 */
  score: number;
  /** 恢復能量 */
  energy: number;
  /** 魚跳躍的力道 */
  jumpForce: number;
  /** 魚跳躍橫向加速度最大值 */
  maxJumpSpeed: number;
  /** 游泳時速度區間 */
  minSwimSpeed: number;
  maxSwimSpeed: number;
  /** 弦波的振幅(上下的幅度) */
  sineAmplitude: number;
  /** 弦波的週期(上下一次要多久)，秒 */
  sinePeriod: number;
  /** 縮放比例 */
  scale: number;
  /** 圖片位址，目前魚統一尺寸，119*119 */
  url: string;
}

/** 測試遊戲波數資料 */
export interface TestWaveData {
  id: number;
  /** 全域魚游泳速度加乘 */
  speedMultiply: number;
  /** 可出現種類及機率(數字列表) */
  appearTypeList: number[];
  /** 每秒生成的數量 */
  amountPerSecond: number;
  /** 持續時間，秒 */
  duration: number;
  /** 結束後與下一波的間隔時間，秒 */
  delayAfterFinish: number;
}

export interface TestItemData extends ItemData {
  /** 道具持續時間秒數 */
  duration: number;
  /** 道具對應類別 */
  itemFunction: number;
  /** 傾盆大魚專用參數: 掉落魚的種類、機率 */
  appearTypeList: number[];
  /** 加速、漁網專用參數: 加速倍數、漁網大小倍數 */
  multiply: number;
}
//#endregion

//#region 賽事通關密語
/** 賽事鎖定通關密語 */
export interface ContestLockPasswordInfoData {
  id: number;
  /** 賽事名稱 */
  contestName: string;
  /** 通關密語 */
  password: string;
}
/** 賽事獎勵通關密語 */
export interface ContestRewardPasswordInfoData {
  id: number;
  /** 賽事名稱 */
  contestName: string;
  /** 通關密語 */
  password: string[];
  /** 使用通關密語的網址前的文字描述 */
  urlPrefixText: string;
  /** 使用通關密語的網址 */
  url: string;
  /** 使用通關密語的網址後的文字描述 */
  urlSuffixText: string;
  /** 使用通關密語的規則說明網址 */
  rulesUrl: string;
}
//#endregion

//region 因雄宇宙
/** 因雄宇宙地圖資料 */
export interface HeroUniverseTileMapData extends TileMapData {
  /** 地圖名稱 */
  name: string;
  /** 背景地圖路徑 */
  backgroundUrl: string;
  /** 地圖Tileset路徑 */
  tilesetUrl: string;
}

/** 因雄宇宙傳送門重新導向資料 */
export interface HeroUniversePortalRedirectData {
  id: number;
  url: string;
}

/** 因雄宇宙Npc資料 */
export interface HeroUniverseNpcData {
  id: number;
  name: string;
  effectId: number;
}

/** 因雄宇宙Npc對話資料 */
export interface HeroUniverseNpcDialogData {
  /** 對話ID，以Npc Id開頭 */
  id: number;
  /** 台詞 */
  dialog: string;
}
//endregion 因雄宇宙

//#region 垂直跑酷
/** 垂直跑酷設定 */
export interface VerticalParkourSettingData {
  id: number;
  /** 英雄移動速度 */
  heroMoveSpeed: number;
  /** 目標得分 */
  targetScore: number;
  /** 怪物造成的傷害 */
  obstacleDamage: number;
  /** 寶箱生成間隔 */
  treasureInterval: number;
  /** 寶箱解鎖時間 */
  treasureUnlockTime: number;
  /** 寶箱獲得的能量 */
  treasureEnergy: number;
  /** 寶箱獲得的分數 */
  treasureScore: number;
  /** 鑰匙生成間隔 */
  keyInterval: number;
  /** 金幣生成間隔 */
  coinInterval: number;
  /** 金幣分數 */
  coinScore: number;
  /** 魔力值基礎消耗 */
  baseConsumption: number;
  /** 魔力值漸進消耗 */
  // TODO: 跟企劃確認
  progressiveConsumption: number;
  /** 魔力值低於此門檻會觸發續命 */
  reviveEnergy: number;
}

/** 垂直跑酷波次資料 */
export interface VerticalParkourObstacleWaveData {
  id: number;
  /** 波次開始的時間 */
  time: number;
  /** 生成的怪物間隔 */
  interval: number;
}

/** 垂直跑酷道具資料 */
export interface VerticalParkourItemData extends ItemData {
  /** 道具參數，秒、個、半徑 */
  value: number;
  /** 道具對應類別 */
  itemFunction: number;
}
//#endregion 垂直跑酷

//#region 2048
/** 2048道具資料 */
export interface Puzzle2048ItemData extends ItemData {
  /** 道具參數，秒、個、半徑 */
  value: number;
  /** 道具對應類別 */
  itemFunction: number;
}
