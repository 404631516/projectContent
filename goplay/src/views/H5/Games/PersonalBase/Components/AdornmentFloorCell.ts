import { AdornmentFloorCellData } from '../Data/AdornmentInterface';
import { LoopCell } from '@/views/H5/Scripts/Components/LoopScroll/LoopCell';
import AdornmentRoomComponent from './AdornmentRoomComponent';
import { AdornmentNumber, AdornmentRoomUnlockType, AdornmentString } from '../Data/AdornmentConfig';
import { AdornmentItemData } from '@/manager/TableManager';

/** 樓層清單 的 樓層 */
export default class AdornmentFloorCell extends LoopCell<AdornmentFloorCellData> {
  //#region data

  /** 樓層裡的 房間cell清單 */
  private roomComponentList: AdornmentRoomComponent[] = [];
  /** 樓板/地基圖片 */
  private floorSlabImage!: Phaser.GameObjects.Image;

  //#endregion data

  /** 自動更新樓層
   * @param time 時間
   * @param delta 差值(MS)
   */
  public update(time: number, delta: number): void {
    // 房間cell清單
    this.roomComponentList.forEach((roomComponent) => {
      roomComponent.update(time, delta);
    });
  }

  /** 清除資料 */
  public clearData(): void {
    // 房間cell清單
    this.roomComponentList.forEach((roomComponent) => {
      roomComponent.clearRoom();
    });
  }

  /** 設定樓層資料
   * @param floorData 樓層資料
   */
  public setInfo(floorData: AdornmentFloorCellData): void {
    // 預設樓板
    if (this.floorSlabImage == null) {
      this.floorSlabImage = this.addImage(AdornmentString.floorSlab, 0, 0);
    }

    // 地基
    if (floorData.isBottom) {
      // 更換圖片
      this.floorSlabImage.setTexture(AdornmentString.bottomFloorBg);
      // 位置
      this.floorSlabImage.x = AdornmentNumber.bottomFloorBGPosX;
      this.floorSlabImage.y = 0;
      // 放大
      this.floorSlabImage.scaleX = AdornmentNumber.scrollWidth / this.floorSlabImage.width;

      // 隱藏各房間
      this.roomComponentList.forEach((roomComponent) => {
        roomComponent.alpha = 0;
      });
      return;
    }
    // 建立樓板
    else {
      // 更換圖片
      this.floorSlabImage.setTexture(AdornmentString.floorSlab);
      // 位置
      this.floorSlabImage.x = AdornmentNumber.scrollWidth / 2;
      this.floorSlabImage.y = AdornmentNumber.floorSlabPosY;
      // 水平放大
      this.floorSlabImage.scaleX = AdornmentNumber.scrollWidth / this.floorSlabImage.width;
    }

    let posX = 0;
    // 更新各房間
    floorData.roomCellDataList.forEach((roomCellData) => {
      const roomIndex = roomCellData.roomData.slot - 1;

      // 取得/建立樓層的房間
      let roomComponent = this.roomComponentList[roomIndex];
      if (roomComponent == null) {
        roomComponent = this.addObject(posX, 0, AdornmentRoomComponent);
        this.roomComponentList.push(roomComponent);
      } else {
        roomComponent.alpha = 1;
      }

      // 房間座標
      roomComponent.x = posX;
      // 最後一間房間
      const isLast = roomCellData.roomData.slot === floorData.roomCellDataList.length;
      // 更新房間
      roomComponent.setRoomInfo(roomCellData, isLast);
      posX += roomComponent.width;
    });
  }

  /** 刷新資料 */
  public refresh(): void {
    // 更新各房間
    this.roomComponentList.forEach((roomComponent) => {
      roomComponent.switchUnlockHint();
    });
  }

  /** 切換佈置模式
   * @param isEdit 是佈置模式
   * @param itemTableData 是佈置模式
   */
  public switchPutItemArea(isEdit: boolean, itemTableData: AdornmentItemData): void {
    this.roomComponentList.forEach((roomComponent) => {
      // 已解鎖房間 才 顯示可放置區
      if (roomComponent.unlockType === AdornmentRoomUnlockType.Unlock) {
        roomComponent.switchPutItemArea(isEdit, itemTableData);
      }
    });
  }
}
