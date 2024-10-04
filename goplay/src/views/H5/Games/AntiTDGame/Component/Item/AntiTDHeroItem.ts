import { Align } from '@/views/H5/Helper/MathHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import Slider from '@/views/H5/Scripts/Components/Slider';
import { Scene } from 'phaser';
import { AntiTDString } from '../../Data/AntiTDConfig';
import AntiTDGameScene, { AntiTDHeroUnitData } from '../../Scenes/AntiTDGameScene';
import AntiTDItem from './AntiTDItem';
import AntiTDItemComponent from './AntiTDItemComponent';
import HorizontalLayout from '@/views/H5/Scripts/Components/HorizontalLayout';
import { HeroImgType } from '@/manager/HeroManager';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
import { AntiTDHero } from '../Battle/AntiTDBattleUnit';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** 逆塔防英雄道具 */
export default class AntiTDHeroItem extends Object2D {
  protected setUI(): void {
    /** */
  }

  //#region declare、readonly
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** 背景顏色 */
  private readonly bgColor: number = UIHelper.blackNumber;
  /** 背景透明度 */
  private readonly bgAlpha: number = 0.8;
  /** 元件本身尺寸 */
  private readonly originalSize: Size = { width: 120, height: 70 };
  /** 屬性Icon */
  protected attributeIcon: Phaser.GameObjects.Image;
  /** 血條位置 */
  private readonly hpBarPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-30, 24);
  /** 血條尺寸 */
  private readonly hpBarSize: Size = { width: 30, height: 10 };
  /** 血條外框顏色 */
  private readonly hpBarFrameColor: number = 0xffffff;
  /** 血條背景顏色 */
  private readonly hpBarBackColor: number = 0x222222;
  /** 血條外框透明度 */
  private readonly hpBarFrameAlpha: number = 0.8;
  /** 血條背景透明度 */
  private readonly hpBarBackAlpha: number = 0.8;
  /** 血條外框Stroke */
  private readonly hpBarStroke: number = 1;
  /** 血條外框Padding */
  private readonly hpBarPadding: number = 2;
  /** 血條外框圓角Radius */
  private readonly hpBarRadius: number = 2;
  /** 背景位置 */
  private readonly bgPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  /** 英雄圖示位置 */
  private readonly heroIconPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-34, -7);
  /** 英雄圖示尺寸 */
  private readonly heroIconSize: Size = { width: 38, height: 38 };
  /** 道具元件位置 */
  private readonly itemComponentPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(13, -3);
  /** 道具元件尺寸 */
  private readonly itemComponentSize: Size = { width: 40, height: 60 };
  /** 狀態圖示Layout位置 */
  private readonly stateIconLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-26, -48);
  /** 狀態圖示尺寸 */
  private readonly stateIconSize: Size = { width: 20, height: 20 };
  /** 狀態圖示間隔 */
  private readonly stateIconLayoutSpacing: number = 2;
  /** 狀態圖示最大顯示數量 */
  private readonly maxCurrentStateIcon: number = 4;
  /** 格擋圖形位置 */
  private readonly blockGraphicPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  /** 初始阻擋顏色 */
  private readonly blockGraphicInitColor: number = UIHelper.blackNumber;
  /** 阻擋文字初始多國key */
  private readonly blockTextInitKey: string = 'antiTD_heroNotUnlock';
  /** 阻擋文字初始Iconkey */
  private readonly blockIconInitKey: string = AntiTDString.Lock;
  /** 阻擋文字多國key */
  private readonly blockTextKey: string = 'antiTD_heroNotAlive';
  /** 阻擋文字風格 */
  private readonly blockTextStyle: TextStyle = { strokeThickness: 0, fontSize: '14px' };
  /** 阻擋顏色 */
  private readonly blockGraphicColor: number = 0xff4848;
  /** 阻擋透明度 */
  private readonly blockGraphicAlpha: number = 0.8;
  /** 按鍵圖示位置 */
  private readonly keyIconPositiong: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-40, -40);
  /** 按鍵圖示縮放 */
  private readonly keyIconScale = 0.85;
  //#endregion declare、readonly

  //#region 元件
  /** 血條 */
  private hpBar!: Slider;
  /** 格擋圖形 */
  private blockGraphic: Phaser.GameObjects.Graphics;
  /** 阻擋icon */
  private blockIcon: Phaser.GameObjects.Image;
  /** 阻擋文字 */
  private blockText: Phaser.GameObjects.Text;
  /** 英雄圖示 */
  private heroIcon: Phaser.GameObjects.Image;
  /** 道具元件 */
  private itemComponent!: AntiTDItemComponent;
  /** 狀態圖示Layout */
  private stateIconLayout: HorizontalLayout;
  /** 狀態圖示 */
  private stateIconImageGroup: Phaser.GameObjects.Group;
  /** 狀態圖示Keys */
  private currentStateIconKeys: string[] = [];
  /**  道具切換狀態 */
  private isSwitched: boolean = false;
  //#endregion 元件

  constructor(
    scene: Scene,
    x: number,
    y: number,
    heroUnitData: AntiTDHeroUnitData,
    isLeader: boolean,
    size: Size,
    bindKey: string
  ) {
    super(scene, x, y);

    // 設置本身尺寸
    this.setSize(this.originalSize.width, this.originalSize.height);

    // 設置背景
    const bg = this.addGraphics(this.bgPosition.x, this.bgPosition.y);
    bg.fillStyle(this.bgColor, this.bgAlpha);
    bg.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 5);

    // 設置英雄圖標
    this.heroIcon = this.addImage(
      `${heroUnitData.data.nameKey}${HeroImgType.Ingame}`,
      this.heroIconPosition.x,
      this.heroIconPosition.y
    );
    this.heroIcon.setDisplaySize(this.heroIconSize.width, this.heroIconSize.height);

    // 初始化屬性Icon
    this.attributeIcon = this.addImage(AttributeHelper.getAttributeIconImgKey(heroUnitData.data.attribute), 0, 0);
    this.attributeIcon.setScale(0.25);
    this.attributeIcon.setX(-this.hpBarSize.width / 2 - (this.attributeIcon.displayWidth * 0.4) / 2);

    // 初始化血條
    this.hpBar = this.addObject(this.hpBarPosition.x, this.hpBarPosition.y, Slider, -1, -1);
    this.hpBar.setBarSize(
      this.hpBarSize.width,
      this.hpBarSize.height,
      this.hpBarStroke,
      this.hpBarPadding,
      this.hpBarRadius
    );
    this.hpBar.setColor(this.hpBarFrameColor, this.hpBarBackColor, this.hpBarFrameAlpha, this.hpBarBackAlpha);
    this.hpBar.setValueColor({ value: 1, color: AttributeHelper.getAttributeColor(heroUnitData.data.attribute) });
    this.hpBar.add(this.attributeIcon);
    this.hpBar.draw();

    // 設置狀態圖示群組
    this.stateIconImageGroup = this.scene.add.group({ classType: Phaser.GameObjects.Image });

    // 設置狀態圖示Layout
    this.stateIconLayout = new HorizontalLayout(
      this.addObject(this.stateIconLayoutPosition.x, this.stateIconLayoutPosition.y)
    );
    this.stateIconLayout.setAlign(Align.LeftCenter);
    this.stateIconLayout.setSpacing(this.stateIconLayoutSpacing);
    this.stateIconLayout.setElementSize(this.stateIconSize.width, this.stateIconSize.height);
    // 重算容器範圍及背景，排列容器內元件
    this.stateIconLayout.draw();

    // 設置道具元件
    this.itemComponent = this.addObject(
      this.itemComponentPosition.x,
      this.itemComponentPosition.y,
      AntiTDItemComponent,
      this.itemComponentSize,
      heroUnitData.equipItemDataList
    );

    // 綁定點擊事件
    this.itemComponent.setOnDownCallBack(`keydown-${bindKey}`, () => {
      this.onClickItem(heroUnitData.data.id, this.itemComponent.item);
    });

    // 設置鍵盤圖示
    const keyIcon = this.addImage(
      `${AntiTDString.ItemKey}${bindKey}`,
      this.keyIconPositiong.x,
      this.keyIconPositiong.y
    );
    keyIcon.setScale(this.keyIconScale);

    // 設置阻擋圖形
    this.blockGraphic = this.addGraphics(this.blockGraphicPosition.x, this.blockGraphicPosition.y);
    this.blockGraphic.fillStyle(this.blockGraphicInitColor, this.blockGraphicAlpha);
    this.blockGraphic.fillRect(-this.width / 2, -this.height / 6, this.width, this.height / 3);
    this.blockGraphic.setVisible(false);
    this.blockGraphic.setVisible(isLeader ? false : true);

    // 設置阻擋icon
    this.blockIcon = this.addImage(this.blockIconInitKey, -50, 0);
    this.blockIcon.setVisible(isLeader ? false : true);

    // 設置阻擋文字
    this.blockText = this.addText(
      Localization.getText(LocalKeyType.Common, this.blockTextInitKey),
      0,
      0,
      this.blockTextStyle
    );
    this.blockText.setVisible(isLeader ? false : true);

    this.setDisplaySize(size.width, size.height);
  }

  /** 當點擊道具
   * @param heroId 英雄id
   * @param item 道具
   */
  private onClickItem(heroId: number, item: AntiTDItem): void {
    // 假如道具介面被阻擋(角色死亡)，返回
    if (this.blockGraphic.visible === true) {
      return;
    }

    // 使用道具
    this.scene.useItem(heroId, item);
  }

  /** 更新顯示狀態
   * @param hero 英雄
   * @param currentEnergy 現有魔力值
   */
  public updateDisplay(hero: AntiTDHero, currentEnergy: number): void {
    const heroAlive = hero.isAlive;
    if (this.hpBar.isEmpty && heroAlive) {
      // 復活，關閉UI阻擋
      this.blockGraphic.setVisible(false);
      this.blockText.setVisible(false);
      this.blockIcon.setVisible(false);
      // 復活時更新道具切換
      this.itemComponent.switchItem(this.isSwitched, 0);
    } else if (this.hpBar.isEmpty === false && heroAlive === false) {
      // 死亡，設置成已退出戰場
      this.blockGraphic.setVisible(true);
      this.blockGraphic.fillStyle(this.blockGraphicColor, this.blockGraphicAlpha);
      this.blockGraphic.fillRect(-this.width / 2, -this.height / 6, this.width, this.height / 3);

      this.blockText.setVisible(true);
      this.blockText.setText(Localization.getText(LocalKeyType.Common, this.blockTextKey));
    }

    // 更新UI血條顯示
    this.hpBar.setValue(hero.hp, hero.fullHp);

    // 更新UI魔力數值顯示，若魔力不足或英雄死亡、未解鎖，則魔力消耗數字顯示紅色
    this.itemComponent.showAvailable(heroAlive ? currentEnergy : 0);
  }

  /** 顯示狀態圖示
   * @param itemNameKey 圖示Key
   */
  public showStateIcon(itemNameKey: string): void {
    this.currentStateIconKeys.push(itemNameKey);

    // 狀態圖示小於最大顯示數量
    if (this.currentStateIconKeys.length < this.maxCurrentStateIcon) {
      const image = this.stateIconImageGroup.get();
      image.setActive(true);
      image.setTexture(itemNameKey);
      image.setDisplaySize(this.stateIconSize.width, this.stateIconSize.height);
      this.stateIconLayout.addElement(image);
    }
    // 狀態圖示超過最大顯示數量，只顯示較新的狀態圖示
    else {
      this.stateIconLayout.removeAllElements(true);
      const stateIconKeys = this.currentStateIconKeys.slice(-this.maxCurrentStateIcon);
      stateIconKeys.forEach((stateIconKey: string) => {
        const image = this.stateIconImageGroup.get();
        image.setActive(true);
        image.setTexture(stateIconKey);
        image.setDisplaySize(this.stateIconSize.width, this.stateIconSize.height);
        this.stateIconLayout.addElement(image);
      });
    }
    this.stateIconLayout.draw();
  }

  /** 關閉狀態圖示
   * @param itemNameKey 圖示Key
   */
  public hideStateIcon(itemNameKey: string): void {
    const index = this.currentStateIconKeys.findIndex((stateIconKey: string) => stateIconKey === itemNameKey);
    if (index === -1) {
      return;
    }

    this.currentStateIconKeys.splice(index, 1);

    // 只顯示較新的狀態圖示
    this.stateIconLayout.removeAllElements(true);
    const stateIconKeys = this.currentStateIconKeys.slice(-this.maxCurrentStateIcon);
    stateIconKeys.forEach((stateIconKey: string) => {
      const image = this.stateIconImageGroup.get();
      image.setActive(true);
      image.setTexture(stateIconKey);
      image.setDisplaySize(this.stateIconSize.width, this.stateIconSize.height);
      this.stateIconLayout.addElement(image);
    });
    this.stateIconLayout.draw();
  }

  /** 清除狀態圖示
   * @param key 圖示Key
   */
  public clearStateIcon(): void {
    this.currentStateIconKeys = [];
    this.stateIconLayout.removeAllElements(true);
    this.stateIconLayout.draw();
  }

  /** 切換使用中道具 */
  public switchItem(): void {
    // 更新道具切換狀態
    this.isSwitched = this.isSwitched === false;

    // 假如道具介面被阻擋(角色死亡)，不執行切換道具
    if (this.blockGraphic.visible === true) {
      return;
    }
    // 執行切換道具
    this.itemComponent.switchItem(this.isSwitched);
  }
}
