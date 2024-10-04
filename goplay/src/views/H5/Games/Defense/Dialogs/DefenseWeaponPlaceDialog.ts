import WeaponTower from '../Components/WeaponTower';
import { DefenseString, DefenseNumber } from '../Data/DefenseConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';
import InfoBox from '../../../Scripts/Components/InfoBox';
import WeaponInfo from '../Components/WeaponInfo';
import HorizontalLayout from '../../../Scripts/Components/HorizontalLayout';
import WeaponPlaceZone from '../Components/WeaponPlaceZone';
import StoreItemMenu from '../../UIHelper/StoreItemMenu';
import Object2D from '../../../Scripts/Components/Object2D';
import { Size } from '../../../Helper/PhaserHelper';
import DefenseGameScene from '../Scenes/DefenseGameScene';
import TableManager from '@/manager/TableManager';
import { DefenseWeaponData } from '@/manager/TableManager';
import UIManager from '@/views/H5/Scripts/Manager/UIManager';
import DefenseMapDialog, { DefenseMapZoneType } from './DefenseMapDialog';
import Slider from '@/views/H5/Scripts/Components/Slider';
import { WebGameMode } from '@/helper/enum/Common';
import UIHelper from '@/views/H5/Helper/UIHelper';
import { DefenseWeaponSetLog, TotalProps } from '@/helper/interface/Game';
import { WeaponLogOperationType } from '@/helper/enum/Weapon';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';
import TimeEventManager, { GameSpeed } from '@/views/H5/Scripts/Manager/TimeEventManager';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import WeaponDisplay from '../Components/WeaponDisplay';

export default class DefenseWeaponPlaceDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: DefenseGameScene;

  /** 砲塔拖動 觸控範圍大小 */
  private readonly dragSize: Size = {
    width: 60,
    height: 60,
  };
  /** 原始圖片大小 */
  private readonly originWeaponSize: Size = {
    width: 512,
    height: 512,
  };
  /** 選單兵器 相較於道具item框框的 額外放大比例 */
  private readonly dragWeaponScale = 1.3;
  /** 場上兵器 相較於道具item框框的 額外放大比例 */
  private readonly placedWeaponScale = 1.15;

  /** 當前魔力值 */
  private magicCountText!: Phaser.GameObjects.Text;
  /** 魔力變動值(由tween操作) */
  private magicValueChangeText!: Phaser.GameObjects.Text;
  /** 英雄血條 */
  private heroHpBar!: Slider;

  /** 遊戲加速倍率 */
  private gameSpeedText?: Phaser.GameObjects.Text;

  /** 已建立的砲塔列表, key為流水號 */
  private towers: Map<number, WeaponTower> = new Map<number, WeaponTower>();
  /** 砲塔選單裡的砲塔選項, key為砲塔id */
  private weaponInfoMap: Map<number, WeaponInfo> = new Map<number, WeaponInfo>();
  /** 設置英雄砲塔時給予的預設index */
  private heroWeaponKey = 0;
  /** 設置一般砲塔時給予的流水號index */
  private weaponKey = 1;
  /** 目前拖曳中要放置的砲塔顯示物件WeaponDisplay */
  private currentWeaponDisplay?: WeaponDisplay;

  /** 砲塔選單 */
  private menu!: StoreItemMenu;
  /** 放置區域提示 */
  private placeZone!: WeaponPlaceZone;

  /** 設置/拆除砲塔的log */
  private _weaponSetLogs: DefenseWeaponSetLog[] = [];
  public get weaponSetLogs(): DefenseWeaponSetLog[] {
    return this._weaponSetLogs;
  }

  /** 地圖Dialog */
  private get defenseMapDialog(): DefenseMapDialog {
    return UIManager.instance.assureDialog(DefenseMapDialog, this.scene);
  }

  /** 設置英雄砲塔 */
  public setHeroDefenseTower(
    heroWeaponData: DefenseWeaponData,
    targetPos: Phaser.Math.Vector2,
    heroMaxHp: number,
  ): void {
    // 建立英雄砲塔
    const heroTower = this.addObject(targetPos.x, targetPos.y, WeaponTower, heroWeaponData);
    heroTower.init(this.heroWeaponKey, undefined, new Phaser.Math.Vector2(0, 40));
    this.towers.set(this.heroWeaponKey, heroTower);
    heroTower.isBarrelRotate = false;
    // 英雄比一般砲塔大, 就跟下方選單上的砲塔一樣大
    heroTower.setScale((this.dragWeaponScale * this.dragSize.height) / this.originWeaponSize.height);
    // 設定z方向的順序
    heroTower.order = targetPos.y;

    // 設定屬性圖片
    const iconKey = AttributeHelper.getAttributeIconImgKey(heroWeaponData.attribute);
    const attributeIcon = heroTower.addImage(iconKey, -150, 200);
    attributeIcon.setScale(2);

    // 設定英雄血條
    this.heroHpBar = heroTower.addObject(0, 220, Slider, heroMaxHp);
    // 根據屬性決定血條顏色
    const hpColor = AttributeHelper.getAttributeColor(heroWeaponData.attribute);
    this.heroHpBar.setValueColor({ value: 1, color: hpColor });
    // 設定血條size
    this.heroHpBar.setBarSize(200, 50);
  }

  /** 更新英雄血量
   * @param currentHp 現有血量
   */
  public updateHeroHp(currentHp: number): void {
    this.heroHpBar?.setValue(currentHp);
  }

  public update(time: number, delta: number) {
    this.towers.forEach((tower) => {
      tower.update(time, delta);
    });
  }

  /** 點擊加速按鈕 */
  public onClickGameSpeedButton(): void {
    // 取得當前遊戲加速倍率
    const currentGameSpeed: GameSpeed = TimeEventManager.instance.getCurrentGameSpeed();
    // 根據當前加速倍率, 決定下個加速倍率
    // TODO 新增function TimeEventManager.speedUp()
    let targetSpeed: GameSpeed = GameSpeed.Normal;
    switch (currentGameSpeed) {
      case GameSpeed.Normal:
        targetSpeed = GameSpeed.Fast;
        break;
      case GameSpeed.Fast:
        targetSpeed = GameSpeed.SuperFast;
        break;
      case GameSpeed.SuperFast:
        targetSpeed = GameSpeed.Normal;
        break;
      default:
        console.error('unexpected currentGameSpeed: ' + currentGameSpeed);
        break;
    }
    // 設定新的加速倍率
    DefenseGameScene.instance.setGameSpeed(targetSpeed);
    if (this.gameSpeedText) {
      this.gameSpeedText.text = targetSpeed.toString();
    }
  }

  /** 收到來自WeaponTower的砲塔撤除通知 */
  public onTowerDestroy(weaponTower: WeaponTower): void {
    // 從砲塔清單移除
    this.towers.delete(weaponTower.key);

    // 歸還砲塔 道具數量+1
    const weaponInfo = this.weaponInfoMap.get(weaponTower.tableData.id);
    if (weaponInfo == null) {
      console.error('onTowerDestroy() error, weaponTower.weaponId = ' + weaponTower.tableData.id);
      return;
    }
    weaponInfo.gainWeaponInfo(1);

    // 找出 tilePos
    const tilePos = weaponTower.getMapDataTilePos();
    // 防呆
    if (tilePos === undefined) {
      return;
    }
    // 該區域還原為"可設置砲塔"
    this.defenseMapDialog.setTowerZoneType(tilePos, DefenseMapZoneType.Settable);
    // 記log
    this._weaponSetLogs.push({
      x: tilePos.x,
      y: tilePos.y,
      weaponId: weaponTower.tableData.id,
      operateType: WeaponLogOperationType.Destroy,
      operateAt: Date.now(),
    });
  }

  /** 更新魔力值
   * @param amount 變化值
   * @param currentEnergy 變化後的魔力值
   */
  public playEnergyUpdate(amount: number, currentEnergy: number): void {
    // 魔力變動特效 初始化
    this.magicValueChangeText.text = amount > 0 ? '+' + amount : amount.toString();
    this.magicValueChangeText.setAlpha(1);
    this.magicValueChangeText.setPosition(80, -30);
    // 執行魔力變動特效
    this.scene.add.tween({
      targets: this.magicValueChangeText,
      alpha: 0,
      y: `-=50`,
      duration: 1000,
      onComplete: () => {
        if (this.magicValueChangeText == null) {
          return;
        }
        this.scene.tweens.killTweensOf(this.magicValueChangeText);
      },
    });

    // 更新UI魔力值
    this.magicCountText.setText(`${currentEnergy}`);

    // 刷新layout
    this.menu.draw();
  }

  protected setUI(): void {
    // 現有魔力
    const icon = this.addImage(DefenseString.MagicIcon, 0, 0);
    const magicTitle = this.addText(`現有魔力`, 0, 0);
    this.magicCountText = this.addText(`${this.scene.currentEnergy}`, 0, 0, {
      fontSize: '24px',
      color: '#2CEAEC',
    });
    // 消耗魔力特效
    this.magicValueChangeText = this.addText(`${this.scene.currentEnergy}`, 0, 0, {
      fontSize: '24px',
      color: '#2CEAEC',
    });
    this.magicValueChangeText.setAlpha(0);
    // 設置parent, 使得lossMagicText跟magicTitle有共同parent, 以便校正lossMagicText的position
    const magicTitleParent = new Object2D(this.scene);
    magicTitleParent.setSize(magicTitle.width, magicTitle.height);
    magicTitleParent.add(magicTitle);
    magicTitleParent.add(this.magicValueChangeText);

    // 魔力標題排版
    const titleParent = this.addObject(this.width * 0.15, this.height - 50);
    const title = new HorizontalLayout(titleParent);
    title.fitElements = true;
    title.setSpacing(10);
    title.setPadding(5, 5);
    title.setFill(UIHelper.blackNumber, 10, 0.5);
    title.addElements([icon, magicTitleParent, this.magicCountText]);
    // 重算容器範圍及背景，排列容器內元件
    title.draw();

    // 魔力標題下方 魔力說明Text
    const magicHintText = this.addText('每放置一款生物兵器都會扣除對應的魔力值喔!', 0, 0, {
      fontSize: '12px',
      color: '#2CEAEC',
    });
    const magicHintParent = this.addObject(this.width * 0.15, this.height - 15);
    const magicHintLayout = new HorizontalLayout(magicHintParent);
    magicHintLayout.fitElements = true;
    magicHintLayout.setSpacing(10);
    magicHintLayout.setPadding(5, 5);
    magicHintLayout.setFill(UIHelper.blackNumber, 10, 0.5);
    magicHintLayout.addElements([magicHintText]);
    // 重算容器範圍及背景，排列容器內元件
    magicHintLayout.draw();

    // 可放置的標籤
    this.placeZone = this.addObject(0, 0, WeaponPlaceZone, DefenseNumber.TileSizeX, DefenseNumber.TileSizeY);
    this.placeZone.setVisible(false);

    // 建立砲塔選單
    this.menu = new StoreItemMenu(this.addObject(this.width * 0.55, this.height * 0.92), this.dragSize);

    // 設置音訊開關按鈕
    this.addImage('', this.width * 0.95, this.height * 0.9, '', MuteIcon);

    // // 遊戲加速按鈕
    // const gameSpeedIcon = this.addImage(DefenseString.SoundOffIcon, this.width * 0.05, this.height * 0.1);
    // gameSpeedIcon.setInteractive({ useHandCursor: true });
    // gameSpeedIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
    //   this.onClickGameSpeedButton();
    // });

    // // 顯示遊戲加速倍數
    // this.gameSpeedText = this.addText('1');
    // this.gameSpeedText.setFontSize(80);
    // this.gameSpeedText.setPosition(this.width * 0.1, this.height * 0.05);
  }

  /** 建立新砲塔選項或將舊有砲塔數量更新 */
  public addWeaponItems(items: TotalProps[]): void {
    // 取得遊戲種類
    const gameType = this.scene.gameMode;
    if (gameType === undefined || gameType === WebGameMode.None) {
      InfoBox.error([this.scene], '無法取得gameType');
      return;
    }
    // 判斷是否為世界大賽，世界大賽需顯示道具數量
    const isWorldContest = gameType === WebGameMode.WorldContest;

    // 建立新砲塔選項或將舊有砲塔數量更新
    for (const item of items) {
      // 假如已經有此砲塔，增加數量
      const esistWeaponInfo = this.weaponInfoMap.get(item.id);
      if (esistWeaponInfo) {
        esistWeaponInfo.gainItem(item.count);
        continue;
      }

      // 沒有的話新增砲塔
      const weaponData = TableManager.defenseWeapon.findOne(item.id);
      if (weaponData === undefined) {
        console.error('weapon table data not found! weaponId = ' + item.id);
        continue;
      }
      // 世界大賽需顯示快閃店購買的生物兵器數量，其餘不用顯示(StoreItem默認-1不顯示)
      const weaponInfo = this.addObject(0, 0, WeaponInfo, this.dragSize, weaponData, isWorldContest ? item.count : -1);
      // 加進砲塔選單，以便管理位置、顯示
      this.menu.addElement(weaponInfo);
      // 加進weaponInfoMap以便管理現有道具
      this.weaponInfoMap.set(item.id, weaponInfo);

      // 選項設置砲塔顯示/拖曳物件
      this.createDragWeaponDisPlay(weaponInfo);
    }
    // 更新砲塔選單顯示
    this.menu.draw();
  }

  /** 生成砲塔選項的顯示/拖曳物件
   * @param weaponInfo 砲塔選項
   */
  private createDragWeaponDisPlay(weaponInfo: WeaponInfo): void {
    // 建立顯示/拖曳物件
    const weaponDisplay = weaponInfo.createWeaponDisplay();

    // 建立拖動範圍, 將拖動範圍變成跟砲塔圖片一樣大
    const sizeX = this.originWeaponSize.width / this.dragWeaponScale;
    const sizeY = this.originWeaponSize.height / this.dragWeaponScale;
    weaponDisplay.setSize(sizeX, sizeY);
    // 將拖動範圍 & 砲塔 setScale, 變成指定大小
    weaponDisplay.setScale((this.dragWeaponScale * this.dragSize.height) / this.originWeaponSize.height);
    // 開啟拖曳互動功能
    weaponDisplay.setInteractive({ draggable: true, useHandCursor: true });

    // 滑鼠拖曳開始回呼: 讓原本的炮台物件變成可拖曳的物件
    weaponDisplay.once(Phaser.Input.Events.DRAG_START, (point: Phaser.Input.Pointer) => {
      // 防止同時拖動多個砲塔, 若有原本的拖曳砲塔, 則摧毀, 以第二次拖曳為主
      if (this.currentWeaponDisplay !== undefined) {
        this.destroyCurrentWeaponDisplay();
      }
      weaponInfo.showContent(false);
      // 將現在的顯示/拖曳物件(被拖動的選項砲塔圖案)拉到最上層
      weaponInfo.remove(weaponDisplay);
      // 加到本身(Dialog)底下並記錄
      this.add(weaponDisplay);
      this.currentWeaponDisplay = weaponDisplay;
      weaponDisplay.setPosition(point.x, point.y);

      // 選項重新生成一個新的顯示/拖曳物件
      this.createDragWeaponDisPlay(weaponInfo);
    });

    // 滑鼠拖曳回呼: 物件跟隨鼠標
    weaponDisplay.on(Phaser.Input.Events.DRAG, (point: Phaser.Input.Pointer) => {
      weaponInfo.showContent(false);
      weaponDisplay.setPosition(point.x, point.y);
    });

    // 滑鼠拖曳結束回呼: 將原本拖曳的物件摧毀
    weaponDisplay.once(Phaser.Input.Events.DRAG_END, () => {
      // 將拖曳砲塔摧毀並清除暫存
      this.destroyCurrentWeaponDisplay();
      // 避免道具內容顯示出來
      weaponInfo.showContent(false);
    });

    // 滑鼠開始回呼: 結束拖曳時觸發放置炮台物件並將原本拖曳的物件摧毀
    weaponDisplay.once(Phaser.Input.Events.DROP, (pointer: any, zone: any) => {
      // 將拖曳砲塔摧毀並清除暫存
      this.destroyCurrentWeaponDisplay();
      // 取得可放置砲塔的位置資料，若沒有代表不是在可放置的位置
      const tilePos = zone.getData(DefenseString.TilePos);
      if (tilePos === undefined) {
        return;
      }
      // 檢查該砲塔是否有基本數量,沒有則從魔力值扣除
      if (this.scene.gameMode === WebGameMode.WorldContest && weaponInfo.isLackItem) {
        InfoBox.warn([this.scene], '道具數量不足');
        return;
      }
      // 若積分未達不能放置塔
      if (this.scene.currentEnergy < weaponInfo.itemData.magic) {
        const magicNotEnoughMsg = '魔力值不足, 需有' + weaponInfo.itemData.magic + '魔力值才能設置喔!';
        InfoBox.warn([this.scene], magicNotEnoughMsg);
        return;
      }

      // 建立砲塔
      const placedWeapon: WeaponTower = this.addObject(zone.x, zone.y - 15, WeaponTower, weaponInfo.itemData);
      if (placedWeapon == null) {
        return;
      }
      // 設定砲塔資料
      placedWeapon.init(this.weaponKey, tilePos, new Phaser.Math.Vector2(0, 21));
      // 存進砲塔清單
      this.towers.set(this.weaponKey, placedWeapon);
      // 砲塔流水號增加
      this.weaponKey++;
      // 場上砲塔大小
      placedWeapon.setScale((this.placedWeaponScale * this.dragSize.height) / this.originWeaponSize.height);

      // 扣除砲塔數量
      weaponInfo.useWeaponInfo();

      // 扣除魔力
      this.scene.updateEnergy(-weaponInfo.itemData.magic);
      // 更改z方向的順序
      placedWeapon.order = tilePos.y;
      this.refreshTowerOrders();

      // 通知DefenseMapDialog更新資料, 該區域改為"已設置砲塔"
      this.defenseMapDialog.setTowerZoneType(tilePos, DefenseMapZoneType.AlreadySet);

      // 記log
      this._weaponSetLogs.push({
        x: tilePos.x,
        y: tilePos.y,
        weaponId: weaponInfo.itemData.id,
        operateType: WeaponLogOperationType.Set,
        operateAt: Date.now(),
      });
    });

    // 滑鼠拖曳進入Drop Zone回呼:
    weaponDisplay.on(Phaser.Input.Events.DRAG_ENTER, (pointer: any, zone: any) => {
      // 取得可放置砲塔的位置資料，若沒有代表不是在可放置的位置
      const tilePos = zone.getData(DefenseString.TilePos);
      if (tilePos === undefined || this.placeZone === undefined) {
        return;
      }
      // 顯示可以放置的提示
      this.bringToTop(this.placeZone);
      this.bringToTop(weaponDisplay);
      this.placeZone.setPosition(zone.x, zone.y);
      this.placeZone.setVisible(true);
    });

    // 滑鼠拖曳離開Drop Zone回呼:
    weaponDisplay.on(Phaser.Input.Events.DRAG_LEAVE, () => {
      weaponInfo.showContent(false);
      this.placeZone.setVisible(false);
    });

    // 滑鼠進入回呼:
    weaponDisplay.on(Phaser.Input.Events.POINTER_OVER, () => weaponInfo.showContent(true));

    // 滑鼠離開回呼:
    weaponDisplay.on(Phaser.Input.Events.POINTER_OUT, () => weaponInfo.showContent(false));
  }

  /** 將拖曳砲塔摧毀並清除暫存 */
  public destroyCurrentWeaponDisplay(): void {
    this.currentWeaponDisplay?.destroy();
    this.currentWeaponDisplay = undefined;
    // 因拖曳砲塔已被摧毀，放置區域提示不顯示
    this.placeZone.setVisible(false);
  }

  /** 刷新砲塔的前後順序 */
  private refreshTowerOrders(): void {
    // 轉成array
    const towerArray = Array.from(this.towers.values());

    // 排序
    towerArray.sort((a: WeaponTower, b: WeaponTower) => {
      return a.order - b.order;
    });

    // 刷新畫面z的順序
    towerArray.forEach((tower) => {
      this.bringToTop(tower);
    });

    // menu最高
    if (this.menu) {
      this.bringToTop(this.menu.container);
    }
  }
}
