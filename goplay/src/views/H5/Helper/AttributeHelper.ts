import imgPath from '@/config/imgPath/imgPath';
import { Scene } from 'phaser';

/** 屬性 */
export enum AttributeType {
  /** 恆星 */
  Sun = 1,
  /** 彗星 */
  Star = 2,
  /** 黑洞 */
  BlackHole = 3,
  /** 超新星 */
  Supernova = 4,
}

/** 決定屬性是否相剋或相抵 */
export enum AttributeRelation {
  /** 相抵 */
  Disadvantage = -1,
  /** 不剋不抵 */
  Equal = 0,
  /** 相剋 */
  Advantage = 1,
}

/** 屬性資料 */
interface AttributeData {
  /** 屬性 */
  attributeType: AttributeType;
  /** 屬性顏色 */
  color: number;
  /** 圖片路徑 */
  iconUrl: string;
}

export default class AttributeHelper {
  /** 屬性資料列表 */
  private static readonly attributeDataList: AttributeData[] = [
    // 恆星
    {
      attributeType: AttributeType.Sun,
      color: 0xebd039,
      iconUrl: imgPath.sunIconBaseUrl,
    },
    // 彗星
    {
      attributeType: AttributeType.Star,
      color: 0x52eaef,
      iconUrl: imgPath.starIconBaseUrl,
    },
    // 黑洞
    {
      attributeType: AttributeType.BlackHole,
      color: 0xf25ff5,
      iconUrl: imgPath.blackholeIconBaseUrl,
    },
    // 超新星
    {
      attributeType: AttributeType.Supernova,
      color: 0xff4848,
      iconUrl: imgPath.supernovaIconBaseUrl,
    },
  ];

  /** 載入所有屬性Icon
   * @param scene 遊戲場景
   */
  public static loadAttributeIcons(scene: Scene): void {
    this.attributeDataList.forEach((attributeData) => {
      scene.load.image(this.getAttributeIconImgKey(attributeData.attributeType), attributeData.iconUrl);
    });
  }

  /** 屬性相剋的關係(attr1 to attr2)
   * @param attr1 攻擊的屬性
   * @param attr2 被攻擊的屬性
   * @returns
   */
  public static attributeRelationship(attr1: AttributeType, attr2: AttributeType): AttributeRelation {
    // 同屬性算優勢, 否則算平手
    if (attr1 === attr2) {
      return AttributeRelation.Advantage;
    }
    return AttributeRelation.Equal;
  }

  /** 取得屬性顏色
   * @param attributeType
   */
  public static getAttributeColor(attributeType: AttributeType): number {
    return this.getAttributeData(attributeType)?.color ?? -1;
  }

  /** 根據屬性, 取得對應圖片key
   * @param attributeType
   */
  public static getAttributeIconImgKey(attributeType: AttributeType): string {
    return AttributeType[attributeType] + `Icon`;
  }

  /** 根據屬性, 取得對應圖片Url
   * @param attributeType
   */
  public static getAttributeIconImgUrl(attributeType: AttributeType): string {
    return this.getAttributeData(attributeType)?.iconUrl ?? '';
  }

  /** 取得屬性資料
   * @param attributeType
   */
  private static getAttributeData(attributeType: AttributeType): AttributeData | undefined {
    const attributeData = this.attributeDataList.find((data) => data.attributeType === attributeType);
    if (attributeData === undefined) {
      console.error(`getAttributeData Error: unknown attributeType=${attributeType}`);
    } else {
      return attributeData;
    }
  }
}
