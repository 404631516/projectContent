import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import UIDialog from '@/views/H5/Scripts/Components/UIDialog';
import AdornmentComponent from '../Components/AdornmentComponent';
import { AdornmentDepth, AdornmentNumber, AdornmentString } from '../Data/AdornmentConfig';
import AdornmentGameScene from '../Scenes/AdornmentGameScene';

/** 房間佈置-拆缷裝飾物ui */
export default class AdornmentTearDownDialog extends UIDialog {
  //#region UI參數
  /** 物品名 位置 */
  private readonly itemNamePositionY: number = -28;

  /** 拆缷鈕 位置 */
  private readonly tearDownBtnPositionY: number = 12;
  /** 拆缷UI 位置 */
  private readonly tearDownDialogPositionY: number = 100;
  /** 拆缷UI 最頂端位置 */
  private readonly tearDownDialogTopPositionY: number = 50;

  //#endregion UI參數

  //#region data
  /** 容器(物品名/拆缷鈕) */
  public containerNode!: Object2D;
  /** 物品名 */
  private itemNameText!: Phaser.GameObjects.Text;
  /** 拆缷鈕 */
  public tearDownBtn!: Phaser.GameObjects.Image;
  /** 取消拆缷鈕 */
  public cancelBtn!: Phaser.GameObjects.Image;

  /** 要拆缷的裝飾物 */
  public adornmentComponent!: AdornmentComponent;
  //#endregion data

  protected setUI(): void {
    this.alpha = 0;

    // 深度
    this.setDepth(AdornmentDepth.tearDownDialog);

    // 取消鈕
    this.cancelBtn = this.addImage(AdornmentString.transparentFrame, 0, 0);
    // 縮放物件, 不維持原比例, 填滿一個長方形範圍
    UIHelper.scaleToTarget(this.cancelBtn, AdornmentNumber.scrollWidth, AdornmentNumber.scrollHeight);
    this.cancelBtn.x = AdornmentNumber.scrollWidth / 2;
    this.cancelBtn.y = AdornmentNumber.scrollHeight / 2;
    // 設置互動參教-可點擊
    this.cancelBtn.setInteractive({ useHandCursor: true });
    // 設置 取消拆缷鈕 event;
    this.cancelBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.hideDialog();
    });

    // 容器-定位用
    this.containerNode = this.addObject(0, 0);

    // 底框
    this.containerNode.addImage(AdornmentString.adornmentTearDownFrame, 0, 0);

    // 物品名
    this.itemNameText = this.containerNode.addText('', 0, this.itemNamePositionY, {
      color: UIHelper.whiteString,
      fontSize: '22px',
    });

    // 拆缷鈕
    this.tearDownBtn = this.containerNode.addImage(AdornmentString.adornmentTearDownBtn, 0, this.tearDownBtnPositionY);
    this.containerNode.addText('缷下', 0, this.tearDownBtnPositionY + 2, {
      color: UIHelper.whiteString,
      fontSize: '22px',
    });
    // 設置互動參教-可點擊
    this.tearDownBtn.setInteractive({ useHandCursor: true });
    // 設置 拆缷鈕 event;
    this.tearDownBtn.on(Phaser.Input.Events.POINTER_UP, () => {
      this.tearDownAdornmentBtn();
    });
  }

  /** 顯示拆缷ui
   * @param position ui位置
   * @param adornmentComponent 要拆缷的裝飾物
   */
  public async showDialog(adornmentComponent: AdornmentComponent): Promise<void> {
    // 記錄裝飾物
    this.adornmentComponent = adornmentComponent;

    // 物品名
    this.itemNameText.text = adornmentComponent.adornmentItemName;

    // 計算裝飾物中心的座標
    const worldPosCenter = adornmentComponent.worldPosition;

    // 計算裝飾物上緣的座標
    const worldPosTop = new Phaser.Math.Vector2(worldPosCenter.x, worldPosCenter.y - this.tearDownDialogPositionY);

    // 檢查y座標是否超過畫面上緣 (以免dialog跑出畫面外)
    worldPosTop.y = Math.max(worldPosTop.y, this.tearDownDialogTopPositionY);

    // 拆缷ui要跟隨裝飾物，顯示在上方
    this.containerNode.x = worldPosTop.x;
    this.containerNode.y = worldPosTop.y;

    // 顯示dialog
    this.alpha = 1;

    // 直到dialog隱藏
    await AsyncHelper.pendingUntil(() => this.alpha === 0);
  }

  public hideDialog(): void {
    // 隱藏dialog
    this.alpha = 0;
  }

  /** 拆缷裝飾物 */
  private tearDownAdornmentBtn(): void {
    // 拆缷裝飾物
    AdornmentGameScene.instance.onRemoveAdornment(this.adornmentComponent);
    // 關閉ui
    this.hideDialog();
  }
}
