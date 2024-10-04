import { Scene } from 'phaser';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import TableManager, { DefenseWeaponData, HeroData } from './TableManager';
import { HeroAttributeTypeData, HeroListData } from '@/helper/interface/Hero';
import ImgPath from '@/config/imgPath/imgPath';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
import config from '@/config/setting';
import PhaserHelper from '@/views/H5/Helper/PhaserHelper';

/** 英雄圖片類別 */
export enum HeroImgType {
  /** 預設 */
  Default = '',
  /** 卡牌 */
  Card = '_card',
  /** 半身像 */
  Half = '_half',
  /** 首頁 */
  Home = '_home',
  /** 遊戲內頭像(方) */
  Ingame = '_ingame',
  /** 遊戲內頭像(圓) */
  Head = '_head',
  /**全身 */
  Full = '_full',
  /** 翻翻牌 */
  MatchingCard = '_matchingCard',
}

export type ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig;

export default class HeroManager {
  /** 取得英雄靜態資料
   * @param heroId 英雄ID TODO改用TableManager
   */
  public static getHeroData(heroId: number): Readonly<HeroData> | undefined {
    return TableManager.hero.findOne(heroId);
  }

  /** 換算經驗值對應的等級
   * @param exp 英雄經驗值
   */
  public static getHeroLevel(exp: number) {
    let currentLvIndex = 0;
    const heroExpTable = TableManager.heroExp.getAll();

    for (let i = 0; i < heroExpTable.length; i++) {
      if (exp <= heroExpTable[i].maxExp) {
        currentLvIndex = i;
        break;
      }
      // 超過最後一筆的經驗值就以最後一筆的等級處理
      if (i === heroExpTable.length - 1) {
        currentLvIndex = i;
      }
    }
    const level = heroExpTable[currentLvIndex].level;
    return level;
  }

  /** 建立預設英雄資料列表 */
  public static getDefaultHeroListData(): HeroListData[] {
    const heroTableData = TableManager.hero.getAll();
    const heroInfos = heroTableData.map<HeroListData>((tableData) => {
      return {
        hid: -1,
        heroId: tableData.id,
        name: tableData.nameKey,
        url: tableData.url,
        totalExp: 0,
        level: 1,
        locked: true,
        online: false,
        attribute: tableData.attribute,
        equipItemIds: [],
      } as HeroListData;
    });

    return heroInfos;
  }

  /** 根據英雄等級尋找對應砲塔Id */
  public static getHeroWeaponData(heroData: HeroData, heroLevel: number): Readonly<DefenseWeaponData> | undefined {
    // 取得英雄等級對砲塔等級對應表
    const heroLevels = TableManager.heroLevel.getAll();
    // 換算英雄等級區間
    let targetWeaponLevel = -1;
    for (let i = 0; i < heroLevels.length; ++i) {
      if (heroLevel <= heroLevels[i].heroLevel) {
        targetWeaponLevel = heroLevels[i].defenseWeaponLevel;
        break;
      }
      // 超過最後一筆的等級就以最後一筆的砲塔等級處理
      if (i === heroLevels.length - 1) {
        targetWeaponLevel = heroLevels[i].defenseWeaponLevel;
        break;
      }
    }
    // 防呆, 找不到等級區間的情況
    if (targetWeaponLevel === -1) {
      console.error(
        `HeroManager.getDefenseWeaponId() error, targetWeaponLevel not found! heroId = ${heroData.id}, heroLevel = ${heroLevel}`,
      );
      return undefined;
    }

    // 取得該英雄的對應武器, 該英雄本身不一定有專有武器, 有可能是與其他英雄共用
    const firstWeapon = TableManager.defenseWeapon.findOne(heroData.defenseWeaponId);
    if (firstWeapon === undefined) {
      console.error(`HeroManager.getHeroWeaponId() error, firstWeapon undefined! heroId = ${heroData.id}`);
      return undefined;
    }

    // 取得該武器的對應英雄Id
    const targetHeroId = firstWeapon.heroId;

    // 根據英雄id & 指定砲塔等級 尋找對應砲塔
    const allWeapons = TableManager.defenseWeapon.getAll();
    const targetWeapon = allWeapons.find((weapon) => {
      return targetHeroId === weapon.heroId && targetWeaponLevel === weapon.level;
    });

    // 找不到對應砲塔, 印錯誤訊息
    if (targetWeapon === undefined) {
      console.error(
        `HeroManager.getDefenseWeaponId() error, weapon not found! heroId = ${heroData.id}, heroLevel = ${heroLevel}`,
      );
    }
    return targetWeapon;
  }

  /** 取得英雄頭像路徑
   * @param heroListData 英雄線上資料
   * @param heroImgType 英雄圖像類型
   * @returns 圖像位置
   */
  public static getHeroImgUrl(heroListData: HeroListData, heroImgType: HeroImgType): string {
    const heroData = this.getHeroData(heroListData.heroId);
    if (heroData == null) {
      return '';
    }
    return this.getHeroImgUrlByHeroData(heroData, heroImgType);
  }

  /** 取得英雄頭像路徑
   * @param heroData 英雄資料
   * @param heroImgType 英雄圖像類型
   */
  private static getHeroImgUrlByHeroData(heroData: HeroData, heroImgType: HeroImgType): string {
    return PhaserHelper.ensureVersionedResourceUrl(
      `${ImgPath.heroBaseUrl}${heroData.url}/${heroData.url}${heroImgType}.png`,
    );
  }

  /** 取得英雄頭像路徑
   * @param heroId 英雄ID
   * @param heroImgType 英雄圖像類型
   * @returns 圖像位置
   */
  public static getHeroImgUrlByHeroId(heroId: number, heroImgType: HeroImgType): string {
    const heroData = this.getHeroData(heroId);
    if (heroData == null) {
      return '';
    }
    return this.getHeroImgUrlByHeroData(heroData, heroImgType);
  }

  /** 取得英雄卡片路徑
   * @param heroUrl
   * @returns
   */
  public static getHeroCardUrl(heroUrl: string): string {
    return require(`@/assets/images/hero/${heroUrl}.png`);
  }

  /** 載入英雄圖片資源(Phaser Game使用) */
  public static loadHeroImages(scene: Scene): void {
    TableManager.hero.getAll().forEach((data) => {
      scene.load.image(data.nameKey, this.getHeroImgUrlByHeroData(data, HeroImgType.Default));
    });
  }

  /** 載入特定類型的英雄圖片資源 */
  public static loadHeroImagesByImgType(scene: Scene, heroImgType: HeroImgType): void {
    TableManager.hero.getAll().forEach((data) => {
      scene.load.image(`${data.nameKey}${heroImgType}`, this.getHeroImgUrlByHeroData(data, heroImgType));
    });
  }

  /** 取得英雄屬性資料
   * @param heroListData 英雄資料
   */
  public static getHeroAttributeTypeData(heroListData: HeroListData): HeroAttributeTypeData {
    // 初始化資料
    return {
      heroAttributeName: Localization.getText(LocalKeyType.Common, 'attribute_' + heroListData.attribute),
      heroAttributeUrl: AttributeHelper.getAttributeIconImgUrl(heroListData.attribute),
    };
  }

  /** 取得英雄對話資料
   * @param contentKey 英雄對話文字key
   * @param defaultKey 預設對話key
   */
  public static getHeroTalkContent(contentKey: string, defaultKey: string): string {
    // 取得HERO專屬對話
    const talkContent = Localization.getText(LocalKeyType.Common, contentKey);

    // 未填寫對話時
    if (talkContent === contentKey) {
      console.error(`getHeroTalkContent: 未填英雄對話，請檢查. contentKey=${contentKey}`);
      // 需要掩飾錯誤時, 顯示預設對話
      if (config.isCoverUp) {
        return Localization.getText(LocalKeyType.Common, defaultKey);
      }
      // 顯示提示字
      else {
        return 'NoTalkData';
      }
    }

    return talkContent;
  }
}

interface HeroUnlockPointWebInfo {
  id: number;
  count: number;
  unlockPoint: number;
}
