import { Align } from '@/views/H5/Helper/MathHelper';
import { Size } from '@/views/H5/Helper/PhaserHelper';
import HorizontalLayout from '@/views/H5/Scripts/Components/HorizontalLayout';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import AntiTDHeroItem from '../Component/Item/AntiTDHeroItem';
import AntiTDItem from '../Component/Item/AntiTDItem';
import { AntiTDNumber, AntiTDString } from '../Data/AntiTDConfig';
import AntiTDGameScene, { AntiTDHeroUnitData } from '../Scenes/AntiTDGameScene';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import { AntiTDHero } from '../Component/Battle/AntiTDBattleUnit';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** ItemDialog包含所有需要與鼠標互動的UI元件 */
export default class AntiTDItemDialog extends UIDialog {
  //#region declare、readonly、getter
  /** 逆塔防遊戲場景 */
  public declare scene: AntiTDGameScene;
  /** 使用英雄道具1~5的按鍵碼 */
  private readonly itemKeyMap = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
  /** 切換英雄道具集的按鍵碼 */
  private readonly switchItemKeys = ['R', 'CTRL', 'SPACE'];
  /** 英雄道具尺寸 */
  private readonly heroItemSize: Size = { width: 120, height: 70 };
  /** 英雄道具列表位置 */
  private readonly heroItemLayoutPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(186, this.displayHeight - 40);
  /** 英雄道具列表對齊方式 */
  private readonly heroItemLayoutAlign: Align = Align.LeftCenter;
  /** 英雄道具列表顏色 */
  private readonly heroItemLayoutColor: number = 0;
  /** 英雄道具列表半徑 */
  private readonly heroItemLayoutRadius: number = 0;
  /** 英雄道具列表透明度 */
  private readonly heroItemLayoutAlpha: number = 0;
  /** 英雄道具列表元件間隔 */
  private readonly heroItemLayoutSpacing: number = 7.5;
  /** 英雄道具列表元件與容器間隔 */
  private readonly heroItemLayoutPadding: number = 10;
  /** 靜音按鈕位置 */
  private readonly muteIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this.width - 40, this.height - 40);
  /** 靜音按鈕縮放 */
  private readonly muteIconSize: number = 70;
  /** 背景框顏色 */
  private readonly bgFrameColor = 0x18eb42;
  /** 背景框線粗 */
  private readonly bgFrameLineWidth = 2;
  /** 背景框高度 */
  private readonly bgFrameHeight = 76.5;
  /** 背景框圓角半徑 */
  private readonly bgFrameRadius = 10;
  /** 切換按鍵元件位置Y */
  private readonly switchKeyPosY: number = this.height - 45;
  /** 切換按鍵元件寬度 */
  private readonly switchKeySize: Size = { width: 66, height: 50 };
  /** 切換按鍵背景縮放 */
  private readonly switchKeyBgScale: number = 0.85;
  /** 切換按鍵圖示位置 */
  private readonly switchKeyIconPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-14, -3);
  /** 切換按鍵圖示縮放 */
  private readonly switchKeyIconScale: number = 0.85;
  /** 切換按鍵說明文字 */
  private readonly switchKeyText: string = Localization.getText(LocalKeyType.Common, 'antiTD_item_switch');
  /** 切換按鍵說明文字位置 */
  private readonly switchKeyTextPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(15, -3);
  /** 切換按鍵說明文字風格 */
  private readonly switchKeyTextStyle: TextStyle = { fontSize: '12px', strokeThickness: 0 };
  /** 道具UI最上緣的螢幕位置Y */
  public readonly itemDialogScreenTopEdge: number = this.heroItemLayoutPosition.y - this.heroItemSize.height / 2;
  /** 靜音按鈕最左緣的螢幕位置Y */
  public readonly muteIconScreenLeftEdge: number = this.muteIconPos.x - this.muteIconSize / 2;
  /** 英雄道具最右緣的螢幕位置Y */
  private _heroItemsScreenRightEdge: number = 0;
  public get heroItemsScreenRightEdge(): number {
    return this._heroItemsScreenRightEdge;
  }
  /** 背景框位置 */
  private readonly bgFramePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    this.heroItemLayoutPosition.x,
    this.itemDialogScreenTopEdge - 5
  );
  //#endregion declare、readonly、getter

  //#region 暫存
  /** 道具資料Map<道具Id, 客製化道具格式> */
  private heroItemMap: Map<number, AntiTDHeroItem> = new Map<number, AntiTDHeroItem>();
  //#endregion 暫存

  //#region Phaser function
  update(...args: any[]): void {
    // 英雄隊長位置
    const leaderX = this.scene.heroTeamLeader.x;
    const leaderY = this.scene.heroTeamLeader.y;

    // UI一半寬高
    const halfWidth = this.displayWidth / 2;
    const halfHeight = this.displayHeight / 2;

    // 世界寬高
    const worldWidth = this.scene.physics.world.bounds.width;
    const worldHeight = this.scene.physics.world.bounds.height;

    // 世界邊界
    const worldLeft = -worldWidth / 2;
    const worldRight = worldWidth / 2;
    const worldTop = -worldHeight / 2;
    const worldBottom = worldHeight / 2;

    // 是否超出世界邊界
    const isBeyondWorldLeft = leaderX - worldLeft < halfWidth;
    const isBeyondWorldRight = worldRight - leaderX < halfWidth;
    const isBeyondWorldTop = leaderY - worldTop < halfHeight - AntiTDNumber.CameraOffsetY;
    const isBeyondWorldBottom = worldBottom - leaderY < halfHeight + AntiTDNumber.CameraOffsetY;

    // 當英雄都不超過橫向邊界時，UI跟隨英雄橫向位置移動
    if (isBeyondWorldLeft === false && isBeyondWorldRight === false) {
      this.setX(this.scene.heroTeamLeader.x - halfWidth);
    }
    // 英雄超過左邊界，因鏡頭被限制在邊界，以左邊界當相對位置
    else if (isBeyondWorldLeft) {
      this.setX(worldLeft);
    }
    // 英雄超過右邊界，因鏡頭被限制在邊界，以右邊界當相對位置
    else if (isBeyondWorldRight) {
      this.setX(worldRight - this.displayWidth);
    }

    // 當英雄都不超過縱向邊界時，UI跟隨英雄縱向位置移動
    if (isBeyondWorldTop === false && isBeyondWorldBottom === false) {
      this.setY(this.scene.heroTeamLeader.y - halfHeight + AntiTDNumber.CameraOffsetY);
    }
    // 英雄超過上邊界，因鏡頭被限制在邊界，以上邊界當相對位置
    else if (isBeyondWorldTop) {
      this.setY(worldTop);
    }
    // 英雄超過下邊界，因鏡頭被限制在邊界，以下邊界當相對位置
    else if (isBeyondWorldBottom) {
      this.setY(worldBottom - this.displayHeight);
    }
  }
  //#endregion Phaser function

  protected setUI(): void {
    // 靜音按鈕要與鼠標互動，因次一起放在ItemDialog裡
    const muteIcon = this.addImage('', this.muteIconPos.x, this.muteIconPos.y, '', MuteIcon);
    muteIcon.setScale(this.muteIconSize / muteIcon.width);
  }

  //#region ItemDialog功能
  /** 初始化
   * @param heroUnitDataList 會出場的英雄資料列表
   */
  public init(heroUnitDataList: AntiTDHeroUnitData[]): void {
    // 設置英雄道具列表
    const layoutObject = this.addObject(this.heroItemLayoutPosition.x, this.heroItemLayoutPosition.y);
    const itemMenu = new HorizontalLayout(layoutObject);
    itemMenu.setAlign(this.heroItemLayoutAlign);
    itemMenu.setFill(this.heroItemLayoutColor, this.heroItemLayoutRadius, this.heroItemLayoutAlpha);
    itemMenu.setSpacing(this.heroItemLayoutSpacing);
    itemMenu.setPadding(this.heroItemLayoutPadding, this.heroItemLayoutPadding);
    itemMenu.setElementSize(this.heroItemSize.width, this.heroItemSize.height);

    // 設置英雄道具並添加至列表
    heroUnitDataList.forEach((heroUnitData: AntiTDHeroUnitData, index: number) => {
      // 創建英雄道具元件
      const heroItem = this.addObject(
        0,
        0,
        AntiTDHeroItem,
        heroUnitData,
        index === 0,
        this.heroItemSize,
        this.itemKeyMap[index]
      );

      // 將英雄道具加至Layout
      itemMenu.addElement(heroItem);
      // 記錄到暫存
      this.heroItemMap.set(heroUnitData.data.id, heroItem);
    });

    // 更新道具列表顯示
    itemMenu.draw();

    // 設置切換按鍵元件
    const switchKey = this.addObject(
      this.heroItemLayoutPosition.x + itemMenu.width + this.switchKeySize.width / 2,
      this.switchKeyPosY
    );
    switchKey.setSize(this.switchKeySize.width, this.switchKeySize.height);

    // 設置切換按鍵背景
    const switchKeyBg = switchKey.addImage(AntiTDString.SwitchKeyBg, 0, 0);
    switchKeyBg.setScale(this.switchKeyBgScale);
    // 設置切換按鍵圖示
    const switchKeyIcon = switchKey.addImage(
      AntiTDString.SwitchKeyIcon,
      this.switchKeyIconPos.x,
      this.switchKeyIconPos.y
    );
    switchKeyIcon.setScale(this.switchKeyIconScale);

    // 設置切換按鍵說明文字
    switchKey.addText(this.switchKeyText, this.switchKeyTextPos.x, this.switchKeyTextPos.y, this.switchKeyTextStyle);

    // 綁定切換道具集鍵盤事件
    this.switchItemKeys.forEach((key: string) =>
      this.scene.input.keyboard!.on(`keydown-${key}`, this.switchHeroItems.bind(this))
    );
    // 綁定切換道具集點擊事件
    switchKey.setInteractive({ useHandCursor: true });
    switchKey.on(Phaser.Input.Events.POINTER_DOWN, this.switchHeroItems.bind(this));

    // 設置背景邊框(隨道具元件寬度變動)
    const bgFrame = this.addGraphics(0, 0);
    bgFrame.lineStyle(this.bgFrameLineWidth, this.bgFrameColor);
    bgFrame.strokeRoundedRect(
      this.bgFramePos.x,
      this.bgFramePos.y,
      itemMenu.width,
      this.bgFrameHeight,
      this.bgFrameRadius
    );

    // 讓道具元件顯示在背景框之上
    this.bringToTop(layoutObject);
    // 計算英雄道具在螢幕上右緣(用於關閉滑鼠移動控制)
    this._heroItemsScreenRightEdge = this.heroItemLayoutPosition.x + itemMenu.width + this.switchKeySize.width;
  }

  /** 判斷pointer是否在UI之上
   * @param pointer pointer
   * @returns 是否在UI之上
   */
  public isPointerAboveUI(pointer: Phaser.Input.Pointer): boolean {
    return (
      (pointer.y > this.itemDialogScreenTopEdge && pointer.x < this.heroItemsScreenRightEdge) ||
      (pointer.y > this.itemDialogScreenTopEdge && pointer.x > this.muteIconScreenLeftEdge)
    );
  }

  /** 更新英雄道具狀態
   * @param heroTeam 英雄隊伍
   * @param currentEnergy 現有能量值
   */
  public updateHeroItems(heros: AntiTDHero[], currentEnergy: number): void {
    heros.forEach((hero: AntiTDHero) => {
      const heroItem = this.heroItemMap.get(hero.unitId);
      heroItem?.updateDisplay(hero, currentEnergy);
    });
  }

  /** 切換英雄道具 */
  public switchHeroItems(): void {
    this.heroItemMap.forEach((heroItem: AntiTDHeroItem) => {
      heroItem.switchItem();
    });
  }

  /** 顯示狀態圖示
   * @param hero 對應的英雄
   * @param itemNameKey 圖示Key
   */
  public showHeroItemStateIcon(hero: AntiTDHero, itemNameKey: string): void {
    const heroItem = this.heroItemMap.get(hero.unitId);
    heroItem?.showStateIcon(itemNameKey);
  }

  /** 關閉狀態圖示
   * @param hero 對應的英雄
   * @param itemNameKey 圖示Key
   */
  public hideHeroItemStateIcon(hero: AntiTDHero, itemNameKey: string): void {
    const heroItem = this.heroItemMap.get(hero.unitId);
    heroItem?.hideStateIcon(itemNameKey);
  }

  /** 清除狀態圖示
   * @param hero 對應的英雄
   */
  public clearHeroItemStateIcon(hero: AntiTDHero): void {
    const heroItem = this.heroItemMap.get(hero.unitId);
    heroItem?.clearStateIcon();
  }

  /** 設置對應道具Highlight
   * @param item 道具
   * @param isHighlight 要設置的Highlight
   */
  public setHighlight(item: AntiTDItem, isHighlight: boolean): void {
    item.setHighlight(isHighlight);
  }

  /** 在功能執行完前設置對應道具Highlight
   * @param item 道具
   * @param pendingFunc 等待要執行的功能，之後取消設置的Highlight
   */
  public async setHighlightPendingUntil(item: AntiTDItem, pendingFunc: Promise<void>): Promise<void> {
    item.setHighlight(true);
    item.setBlock(true);
    // 等待條件達成
    await pendingFunc;
    // 取消設置的Highlight
    item.setHighlight(false);
    item.setBlock(false);
  }

  /** 設置對應道具倒數冷卻時間
   * @param item 道具
   */
  public setCountDownPendingUntil(item: AntiTDItem): void {
    // 取得冷卻時間
    let second = item.itemData.cooldown;
    if (second < 0) {
      console.error(`second: ${second} 秒數錯誤，不應該小於0。請確認資料是否有誤`);
    }

    // 冷卻時間等於0，不須冷卻
    if (second === 0) {
      return;
    }

    // 無條件進位顯示
    item.setBlock(true);
    item.setBlockText(Math.ceil(second).toString());

    // 每0.1秒檢查一次，但倒數只顯示個位數，不顯示小數點
    const timeEvent = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        second -= 0.1;
        if (second <= 0) {
          // 關閉道具阻擋
          item.setBlock(false);
          // 清除阻擋文字
          item.setBlockText('');
          // 摧毀timeEvent
          timeEvent.destroy();
          return;
        }

        // 無條件進位顯示
        item.setBlockText(Math.ceil(second).toString());
      },
      repeat: -1,
    });
  }
  //#endregion ItemDialog功能
}
