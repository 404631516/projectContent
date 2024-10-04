import { AdornmentNumber, AdornmentDepth, AdornmentString } from '../Data/AdornmentConfig';
import UIManager from '../../../Scripts/Manager/UIManager';
import LoadingDialog from '../../UIHelper/LoadingDialog';
import AdornmentManager from '../Components/AdornmentManager';
import { adornmentImgUrl } from '../Data/AdornmentResource';
import AdornmentMainDialog from '../Dialogs/AdornmentMainDialog';
import BaseGameScene from '@/views/H5/Scripts/Components/BaseGameScene';
import { StoreHelper } from '@/views/H5/Helper/StoreHelper';
import AdornmentItemDialog from '../Dialogs/AdornmentItemDialog';
import TableManager, { AdornmentItemData } from '@/manager/TableManager';
import AdornmentTearDownDialog from '../Dialogs/AdornmentTearDownDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType, CharacterType } from '@/helper/enum/PhaserGame';
import { AdornmentType } from '@/helper/enum/Adornment';
import { AdornmentGameData } from '@/helper/interface/Game';
import AdornmentComponent from '../Components/AdornmentComponent';
import { AdornmentPosition } from '@/helper/interface/Adornment';
import { Message } from 'element-ui';
import SoundPool from '../../Common/SoundPool';
import AdornmentRoomComponent from '../Components/AdornmentRoomComponent';
import { IAdornmentWeb } from '../../Common/PhaserGameStrategy';
import { AdornmentPopUpNumberTween } from '../Components/AdornmentPopUpNumberTween';

export default class AdornmentGameScene extends BaseGameScene {
  //#region data
  /** singleton */
  private static _instance: AdornmentGameScene;
  public static get instance(): AdornmentGameScene {
    return this._instance;
  }

  private adornmentManager!: AdornmentManager;

  /** 主畫面Dialog */
  private mainDialog!: AdornmentMainDialog;

  /** 道具DIALOG */
  private itemDialog!: AdornmentItemDialog;

  /** 拆缷道具DIALOG */
  private tearDownDialog!: AdornmentTearDownDialog;

  /** 上浮文字動畫 */
  private tweenTextGroup!: Phaser.GameObjects.Group;

  /** 編輯模式 */
  private isEditMode: boolean = false;

  // 音效物件池
  /** 放置裝飾物音效 */
  private putAdornmentSoundPool!: SoundPool;
  /** 拆缷裝飾物音效 */
  private tearDownAdornmentSoundPool!: SoundPool;
  /** 解鎖房間音效 */
  private unlockRoomSoundPool!: SoundPool;
  /** 一般按鈕音效 */
  public buttonSoundPool!: SoundPool;
  //#endregion data

  //#region 基本流程

  /** 遊戲結束 */
  public get isGameEnd(): boolean {
    return false;
  }

  constructor(private gameData: AdornmentGameData, private adornmentWeb: IAdornmentWeb) {
    super({ key: 'AdornmentGameScene' });
    AdornmentGameScene._instance = this;
  }

  async preload() {
    // 開啟loading dialog
    UIManager.instance.openDialog(LoadingDialog, this);

    // 擁有的英雄，要載入 房間佈置-英雄動畫圖
    this.gameData.heroList.forEach((heroID) => {
      // 取得英雄靜態表
      const heroData = TableManager.hero.findOne(heroID);
      // 防呆
      if (heroData == null) {
        console.error(`preload: load spritesheet. heroData == null. id=${heroID}`);
        return;
      }

      // 載入動畫圖-walk
      AnimationHelper.loadCharacterSprite(this, heroData, CharacterType.Hero, CharacterAnimType.Walk);

      // 載入動畫圖-idle
      AnimationHelper.loadCharacterSprite(this, heroData, CharacterType.Hero, CharacterAnimType.Idle);
    });

    // 載入裝飾物背景圖片
    TableManager.adornmentItem.getAll().forEach((itemTable) => {
      // 載入 牆/地板圖片
      switch (itemTable.adornmentType) {
        case AdornmentType.Wall:
        case AdornmentType.Floor:
          try {
            this.load.image(itemTable.nameKey, `${adornmentImgUrl}/adornmentItem/${itemTable.url}.png`);
          } catch (e) {
            // 讀檔失敗
            console.error(`Adornment Load image fail, id=${itemTable.id}, url=${itemTable.url}, e=${e}`);
          }
          break;
        default:
          break;
      }
    });
  }

  async create() {
    // 設置動畫
    this.setAnims(this.gameData.heroList);

    // 開啟主ui
    this.mainDialog = UIManager.instance.openDialog(AdornmentMainDialog, this);
    if (this.mainDialog == null) {
      console.error(`AdornmentMainDialog: openDialog, _mainDialog == null`);
      return;
    }

    // 拜訪模式的ui
    if (StoreHelper.$$store.state.AdornmentModule.isVisit) {
      this.setVisitDialog();
    }
    // 用戶自已的ui
    else {
      this.setSelfDialog(this.gameData);
    }

    // 初始化裝飾物管理器
    this.adornmentManager = new AdornmentManager(this);
    this.adornmentManager.init(this.gameData);

    // 關閉loading dialog
    UIManager.instance.closeDialog(LoadingDialog, this);

    // 設置表演文字群組
    this.tweenTextGroup = this.add.group({
      classType: AdornmentPopUpNumberTween,
      maxSize: 10,
    });

    // 初始化音效
    this.initSoundPool();

    // 使用直式螢幕提示視窗
    this.showOrientationMessage();
  }

  protected fixedUpdate(time: number, delta: number): void {
    return;
  }
  //#endregion 基本流程

  /** 設置動畫
   * @param heroList 已解鎖英雄
   */
  private setAnims(heroList: number[]): void {
    // 設置 英雄動畫
    heroList.forEach((heroID) => {
      const heroData = TableManager.hero.findOne(heroID);
      if (heroData == null) {
        console.error(`setAnims: heroData == null. id=${heroID}`);
        return;
      }

      AnimationHelper.createCharacterAnim(this, heroData, CharacterAnimType.Walk);
      AnimationHelper.createCharacterAnim(this, heroData, CharacterAnimType.Idle);
    });
  }

  /** 初始化音效 */
  private initSoundPool(): void {
    // 設置裝飾物音效
    this.putAdornmentSoundPool = new SoundPool(this, AdornmentString.onPutAdornmentSound);
    if (this.putAdornmentSoundPool == null) {
      console.error('putAdornmentSoundPool == null');
      return;
    }

    // 拆缷裝飾物音效
    this.tearDownAdornmentSoundPool = new SoundPool(this, AdornmentString.onTearDownAdornmentSound);
    if (this.tearDownAdornmentSoundPool == null) {
      console.error('tearDownAdornmentSoundPool == null');
      return;
    }

    // 解鎖房間音效
    this.unlockRoomSoundPool = new SoundPool(this, AdornmentString.onUnlockRoomSound);
    if (this.unlockRoomSoundPool == null) {
      console.error('unlockRoomSoundPool == null');
      return;
    }

    // 一般按鈕音效
    this.buttonSoundPool = new SoundPool(this, AdornmentString.onClickButtonSound);
    if (this.buttonSoundPool == null) {
      console.error('buttonSoundPool == null');
      return;
    }
  }

  /** 設定主玩家Dialog
   * @param gameData 房間佈置資料
   */
  private setSelfDialog(gameData: AdornmentGameData): void {
    // 建立用戶自已的ui
    this.mainDialog.initSelfUI();

    // 設置 佈置模式鈕 event
    this.mainDialog.editModebtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickEditModeBtn();
    });

    // 設置 商店鈕 event
    this.mainDialog.storeBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickStoreBtn();
    });

    // 設置 背包鈕 event
    this.mainDialog.backpackBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickBackpackBtn();
    });

    // 設置 同學列表鈕 event
    this.mainDialog.classmateBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickClassmateBtn();
    });

    // 建立 佈置模式的背包
    this.itemDialog = UIManager.instance.openDialog<AdornmentItemDialog>(AdornmentItemDialog, this);
    // 移動dialog
    this.itemDialog.x = AdornmentNumber.itemDialogPositionX;
    this.itemDialog.y = AdornmentNumber.itemDialogPositionY;

    // 初始道具ui
    this.itemDialog.init();
    this.itemDialog.setDepth(AdornmentDepth.itemDialog);
    // 隱藏
    this.itemDialog.alpha = 0;

    // 設置 佈置完成鈕 event;
    this.itemDialog.exitEditModeBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      // 播放音效
      this.buttonSoundPool.play();
      // 關閉佈置模式
      this.switchEditModeUI(false);
    });

    // 建立 拆缷道具DIALOG
    this.tearDownDialog = UIManager.instance.openDialog<AdornmentTearDownDialog>(AdornmentTearDownDialog, this);
  }

  /** 建立拜訪模式的ui */
  private setVisitDialog(): void {
    this.mainDialog.initVisitUI();

    // 設置 我的房間鈕 event
    this.mainDialog.selfRoomBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickSelfRoomBtn();
    });

    // 設置 同學列表鈕 event
    this.mainDialog.classmateBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.onClickClassmateBtn();
    });

    // 設置 回排行榜按鈕 event
    this.mainDialog.visitRankBtn?.on(Phaser.Input.Events.POINTER_UP, () => {
      this.adornmentWeb.goBackRankList();
    });
  }

  /** 指定座標在dialog範圍內
   * @param pointer 座標
   */
  private isInsideDialog(pointer: Phaser.Input.Pointer): boolean {
    return this.itemDialog.alpha === 1 && this.itemDialog.isInsideDialog(pointer);
  }

  /** 檢查zone交疊到背包
   * @param zone 拖放區域
   */
  public isOverlayDialog(zone: Phaser.GameObjects.Zone): boolean {
    // 取得背包ui範圍
    const dialogRect = this.itemDialog.dialogRect;
    // 取得放置的zone的範圍
    const dropZoneRect = zone.getBounds();

    // 計算重疊區域
    const intersectionRect = Phaser.Geom.Intersects.GetRectangleIntersection(dialogRect, dropZoneRect);

    // 若有重疊，略過放置流程
    return intersectionRect.isEmpty() === false;
  }

  /** 按下 佈置模式鈕 */
  private async onClickEditModeBtn(): Promise<void> {
    // 播放音效
    this.buttonSoundPool.play();
    // 開啟背包
    this.itemDialog.openDialog();
    // 啟用佈置模式
    this.switchEditModeUI(true);
  }

  /** 按下 商店鈕 */
  public async onClickStoreBtn(): Promise<void> {
    // 播放音效
    this.buttonSoundPool.play();

    // 暫停Phaser場景及事件
    this.pauseScene();

    // 開啟VUE商店UI
    await this.adornmentWeb.onOpenShop();

    // 有開啟佈置中背包時，刷新目前頁面
    if (this.itemDialog.alpha > 0) {
      this.itemDialog.refreshCurrentPage();
    }

    // 取消暫停Phaser場景及事件
    this.resumeScene();
  }

  /** 按下 背包鈕 */
  private async onClickBackpackBtn(): Promise<void> {
    // 播放音效
    this.buttonSoundPool.play();

    // 暫停Phaser場景及事件
    this.pauseScene();

    // 通知vue，開啟vue背包ui
    await this.adornmentWeb.onOpenBackpack();

    // 取消暫停Phaser場景及事件
    this.resumeScene();
  }

  /** 開啟佈置模式
   * @param itemID 裝飾物ID
   */
  public onOpenEditMode(itemID: number) {
    // 開啟背包
    this.itemDialog.openDialog();
    // 啟用佈置模式
    this.switchEditModeUI(true);
    // 切換到目標道具id的分類及頁面
    this.itemDialog.switchToTargetItemPage(itemID);
  }

  /** 按下 同學列表鈕 */
  private async onClickClassmateBtn(): Promise<void> {
    // 播放音效
    this.buttonSoundPool.play();

    // 暫停Phaser場景及事件
    this.pauseScene();
    // 開啟vue 同學列表ui
    const isVisit = await this.adornmentWeb.onOpenClassmateList();
    if (isVisit === false) {
      // 取消暫停Phaser場景及事件
      this.resumeScene();
    }
  }

  /** 按下 我的房間鈕 */
  private async onClickSelfRoomBtn(): Promise<void> {
    // 播放音效
    this.buttonSoundPool.play();

    // 回到我的房間
    this.adornmentWeb.goBackSelfHome();
  }

  /** 按下解鎖房間按鈕 */
  public async onClickUnlockRoomButton(roomComponent: AdornmentRoomComponent): Promise<void> {
    // 防止drag floor/unlock room重疊
    if (this.adornmentManager.floorLoopScroll.isDragging) {
      return;
    }
    // 放置的位置，若在其他dialog內，取消拖放
    if (this.isInsideDialog(this.input.activePointer)) {
      return;
    }

    // 暫停Phaser場景及事件
    this.pauseScene();

    try {
      // 顯示vue的詢問框: 確認解鎖房間？
      if (await this.adornmentWeb.onOpenUnlockRoomMessage()) {
        // API 解鎖房間
        await StoreHelper.$$store.dispatch('onUnlockPersonalBasePage', roomComponent.roomID);

        // 將新解鎖的房間的放置物品陣列，參照到無限循環的資料中
        const newRoomPositionList = StoreHelper.$$store.state.AdornmentModule.adornmentPositionList.get(
          roomComponent.roomID
        );

        // 防呆
        if (newRoomPositionList == null) {
          console.error(`onClickUnlockRoomButton: newRoomPositionList is null. roomID=${roomComponent.roomID}`);
        }
        // 找出無限循環中，新解鎖房間的資料
        else {
          let isFoundRoomData: boolean = false;
          for (const floorCell of this.adornmentManager.floorLoopScroll.loopCellList) {
            // 取得樓層資料
            const floorData = floorCell.getData();
            if (floorData == null) {
              continue;
            }
            const roomData = floorData.roomCellDataList.find(
              (roomCellData) => roomCellData.roomData.id === roomComponent.roomID
            );
            // 找到了
            if (roomData) {
              // 將新解鎖的房間的放置物品陣列，參照到無限循環的資料中
              roomData.putAdornmentList = newRoomPositionList;
              isFoundRoomData = true;
              break;
            }
          }

          // 防呆
          if (isFoundRoomData === false) {
            console.error(`onClickUnlockRoomButton: foundRoomData not found. roomID=${roomComponent.roomID}`);
          }
        }

        // 刷新全部房間的畫面
        this.adornmentManager.floorLoopScroll.refreshList();
        // 播放解鎖房間動畫
        roomComponent.playUnlockAnimation();
        // 播放音效
        this.unlockRoomSoundPool.play();
      }
    } catch (e) {
      // 解鎖結果失敗
      Message.error(`${e}`);
      console.error(`unlockRoomAPI: e=${e}`);
    }

    // 取消暫停Phaser場景及事件
    this.resumeScene();
  }

  /** 切換佈置模式ui
   * @param isEdit 佈置模式
   */
  private switchEditModeUI(isEdit: boolean): void {
    // 編輯模式
    this.isEditMode = isEdit;
    // 佈置中背包ui
    this.itemDialog.alpha = isEdit ? 1 : 0;
    // 主ui-切換佈置模式
    this.mainDialog.switchEditMode(isEdit);
  }

  /** 顯示拆缷裝飾物ui
   * @param adornmentComponent 裝飾物
   */
  public async onShowTearDownAdornmentUI(adornmentComponent: AdornmentComponent): Promise<void> {
    // 不是編輯模式 或 素體牆 不執行
    if (this.isEditMode === false || adornmentComponent.isEmpty) {
      return;
    }
    // 點擊位置，若在其他dialog內，取消拆缷
    if (this.isInsideDialog(this.input.activePointer)) {
      return;
    }
    // 拖曳樓層時，不要觸發拆缷裝飾物
    if (this.adornmentManager.floorLoopScroll.isDragging) {
      return;
    }

    // 鎖定拖曳樓層
    this.adornmentManager.isLockDragFloor = true;
    // 設定發亮閃爍圖片
    this.mainDialog.setTearDownLightImage(adornmentComponent, true);

    // 顯示拆缷ui
    await this.tearDownDialog.showDialog(adornmentComponent);

    // 允許拖曳樓層
    this.adornmentManager.isLockDragFloor = false;
    // 隱藏發亮閃爍圖片
    this.mainDialog.setTearDownLightImage(adornmentComponent, false);
  }

  /** 放置新裝飾物
   * @param adornmentComponent 裝飾物元件
   * @param newItemData 新裝飾物ID
   */
  public async onPlaceAdornment(adornmentComponent: AdornmentComponent, newItemData: AdornmentItemData): Promise<void> {
    // 若放置相同itemId的裝飾物，不處理
    if (adornmentComponent.itemID === newItemData.id) {
      return;
    }

    // 取得新的裝飾物動態表資料
    const itemPositionData = adornmentComponent.getNewAdornmentPosition(newItemData.id);

    // 上次總積分
    const oldTotalScore = StoreHelper.$$store.state.AdornmentModule.adornmentTotalScore;

    try {
      // API 放置裝飾物
      const newAdornmentPosition: AdornmentPosition = await StoreHelper.$$store.dispatch(
        'placeAdornmentPosition',
        itemPositionData
      );

      // 更新裝飾物
      adornmentComponent.updateAdornment(newItemData, newAdornmentPosition);

      // 刷新裝飾物資訊
      this.onAdornmentUpdate(oldTotalScore, adornmentComponent);
      // 播放音效
      this.putAdornmentSoundPool.play();
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 拆缷裝飾物
   * @param adornmentComponent 裝飾物
   */
  public async onRemoveAdornment(adornmentComponent: AdornmentComponent): Promise<void> {
    // 取得新的裝飾物動態表資料
    const itemPositionData = adornmentComponent.getNewAdornmentPosition(-1);

    // 上次總積分
    const oldTotalScore = StoreHelper.$$store.state.AdornmentModule.adornmentTotalScore;

    try {
      // API 拆缷裝飾物
      await StoreHelper.$$store.dispatch('removeAdornmentPosition', itemPositionData);

      // 清除裝飾物
      adornmentComponent.clearAdornment();

      // 刷新裝飾物資訊
      this.onAdornmentUpdate(oldTotalScore, adornmentComponent);
      // 播放音效
      this.tearDownAdornmentSoundPool.play();
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 刷新裝飾物資訊
   * @param oldTotalScore 舊積分
   * @param adornmentComponent 裝飾物
   */
  private onAdornmentUpdate(oldTotalScore: number, adornmentComponent: AdornmentComponent): void {
    // 佈置模式中刷新背包
    this.itemDialog.onAdornmentUpdate(adornmentComponent);

    // 計算裝飾物中心的座標
    const worldPosCenter = adornmentComponent.worldPosition;

    // 目前總積分
    const currentTotalScore = StoreHelper.$$store.state.AdornmentModule.adornmentTotalScore;

    // 播放獲得積分tween
    const plusScore = currentTotalScore - oldTotalScore;
    if (plusScore !== 0) {
      // 表演獲得積分文字
      const tweenText: AdornmentPopUpNumberTween = this.tweenTextGroup.get(worldPosCenter.x, worldPosCenter.y);
      if (tweenText) {
        // 播放效果
        tweenText.popUpNumberIcon(plusScore, AdornmentString.adornmentScoreIcon);
      }
    }
  }

  /** 當開啟Vue畫面時
   *  @param isOpen 是否開啟
   */
  public onOpenVueUI(isOpen: boolean): void {
    if (isOpen) {
      this.pauseScene();
    } else {
      this.resumeScene();
    }
  }
}
