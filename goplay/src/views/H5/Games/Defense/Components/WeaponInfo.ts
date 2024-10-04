import { Scene } from 'phaser';
import HorizontalLayout from '../../../Scripts/Components/HorizontalLayout';
import { Align } from '@/views/H5/Helper/MathHelper';
import { DefenseString } from '../Data/DefenseConfig';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import Localization from '../../../Scripts/Components/Localization';
import { LocalKeyType } from '../../../Scripts/Components/Localization';
import { DefenseWeaponData } from '@/manager/TableManager';
import WeaponDisplay from './WeaponDisplay';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import StoreItem from '../../UIHelper/StoreItem';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';

export default class WeaponInfo extends StoreItem<DefenseWeaponData> {
  /** 魔力花費Layout */
  private magicLayoutObject: Object2D;
  /** 等級文字 */
  private levelText: Phaser.GameObjects.Text;
  /** 是否計算數量並顯示(星球大戰表宇宙沒有數量限制) */
  private disableCount: boolean = false;

  constructor(scene: Scene, x: number, y: number, size: Size, data: DefenseWeaponData, count: number) {
    super(scene, x, y, size, data, count, Localization.getText(LocalKeyType.Common, data.contentKey));
    // 暫存是否計算數量並顯示
    this.disableCount = count === -1;
    // 本身不與input做任何互動
    this.disableInteractive();

    // 設定Icon尺寸
    this.setIconSize(size.width, size.height);

    // 設定屬性圖案
    const attributeKey = AttributeHelper.getAttributeIconImgKey(data.attribute);
    this.setExtraInfo(attributeKey, 36, 36, -20, -20);

    // 建立魔力圖案
    const icon = this.addImage(DefenseString.MagicIcon, 0, 0);
    // 建立魔力值文字
    const magicText = this.addText(data.magic.toString(), 0, 0, {
      color: '#2CEAEC',
    });

    // 建立魔力花費layout
    this.magicLayoutObject = this.addObject(0, size.height * 0.5 - 2.5);
    const magicLayout = new HorizontalLayout(this.magicLayoutObject);
    magicLayout.setAlign(Align.BottomCenter);
    magicLayout.fitElements = true;
    magicLayout.setSpacing(2.5);
    magicLayout.addElements([icon, magicText]);
    // 重算容器範圍及背景，排列容器內元件
    magicLayout.draw();

    // 建立等級文字
    this.levelText = this.addText(`Lv${data.level}`, size.width * 0.5 - 2.5, -size.height * 0.5 + 2.5);
    this.levelText.setAlign('right');
    this.levelText.setOrigin(1, 0);
  }

  /** 創建生物兵器顯示(拖曳用) */
  public createWeaponDisplay(): WeaponDisplay {
    const weaponDisplay = this.addObject(0, -10, WeaponDisplay, this.itemData);
    // 重新調整顯示順序
    this.bringToTop(weaponDisplay);
    this.bringToTop(this.magicLayoutObject);
    this.bringToTop(this.levelText);
    this.bringToTop(this.lackHintObject);
    return weaponDisplay;
  }

  /** 使用WeaponInfo，當數量充足時才顯示ExtraInfo(attribute屬性圖) */
  public useWeaponInfo(): void {
    // 不計算數量也不顯示
    if (this.disableCount) {
      return;
    }

    this.useItem();
    this.itemExtraInfo.setVisible(this.isLackItem === false);
  }

  /** 使用WeaponInfo，當數量充足時才顯示ExtraInfo(attribute屬性圖)
   * @param amount 要增加的數量
   */
  public gainWeaponInfo(amount: number): void {
    // 不計算數量也不顯示
    if (this.disableCount) {
      return;
    }

    this.gainItem(amount);
    this.itemExtraInfo.setVisible(this.isLackItem === false);
  }
}
