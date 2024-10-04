import { Scene } from 'phaser';
import { AntiTDItemData, CombatItemData } from '@/manager/TableManager';
import { Size } from '../../../../Helper/PhaserHelper';
import StoreItem from '../../../UIHelper/StoreItem';
import { AntiTDString } from '../../Data/AntiTDConfig';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 逆塔防道具 */
export default class AntiTDItem extends StoreItem<CombatItemData> {
  /** 道具圖示尺寸offset */
  private readonly iconSizeOffset: Size = { width: -5, height: -5 };
  /** 覆蓋文字風格 */
  private readonly coverTextStyle: TextStyle = { fontSize: '13px' };
  /** 道具等級尺寸offset */
  private readonly iconLevelSizeOffset: Size = { width: -2.5, height: -2.5 };
  /** Highlight尺寸offset */
  private readonly highlightSizeOffset: Size = { width: 5, height: 5 };
  /** 額外資訊圖標尺寸offset */
  private readonly extraInfoSizeOffset: Size = { width: -16, height: -16 };
  /** 額外資訊圖標位置加乘offset */
  private readonly extraInfoPosMultiplyOffset: number = -0.4;

  /** 是否為空道具 */
  public get isEmpty(): boolean {
    return this.itemData.id === 0;
  }
  constructor(
    scene: Scene,
    x: number,
    y: number,
    size: Size,
    data: AntiTDItemData,
    content: string = '',
    coverText: string = ''
  ) {
    super(scene, x, y, size, data, -1, content);

    // icon
    this.setIconSize(size.width + this.iconSizeOffset.width, size.height + this.iconSizeOffset.height);
    // 設定背景
    this.setBackground(true);
    // 設定外框
    this.setFrame(true);
    // 額外資訊圖標
    if (data.heroItemType) {
      this.setExtraInfo(
        `${AntiTDString.ItemTypeIcon}${data.heroItemType}`,
        size.width + this.extraInfoSizeOffset.width,
        size.height + this.extraInfoSizeOffset.height,
        size.width * this.extraInfoPosMultiplyOffset,
        size.height * this.extraInfoPosMultiplyOffset
      );
    }
    // 道具等級
    this.setItemLevel(
      data.itemLevel ?? -1,
      size.width + this.iconLevelSizeOffset.width,
      size.height + this.iconLevelSizeOffset.height,
      0,
      0
    );
    // 設置highLight圖片
    this.setHighlightIconSize(
      size.width + this.highlightSizeOffset.width,
      size.height + this.highlightSizeOffset.height
    );
    // 覆蓋在道具上的文字
    this.addText(coverText, 0, 0, this.coverTextStyle);
  }
}
