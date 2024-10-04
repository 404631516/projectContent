import { DefenseNumber, DefenseString } from '../Data/DefenseConfig';
import UIDialog from '../../../Scripts/Components/UIDialog';

/** 一格地圖格點的砲塔設置狀態 */
export enum DefenseMapZoneType {
  /** 不可設置砲塔 */
  NotSettable = -1,
  /** 可設置砲塔(未設置) */
  Settable = 0,
  /** 可設置砲塔(已設置) */
  AlreadySet = 1,
}

/** 一格地圖格點的砲塔設置Data */
interface WeaponTowerStateData {
  /** 砲塔設置狀態 */
  state: DefenseMapZoneType;
  /** 砲塔設置觸控範圍 */
  zone: Phaser.GameObjects.Zone | undefined;
}

/** 地圖Dialog, 指的是每個地圖格點的"砲塔設置區域", 並不是指地圖背景圖 */
export default class DefenseMapDialog extends UIDialog {
  /** 每個地圖節點的砲塔資料 */
  private mapZoneData: WeaponTowerStateData[][] = [[]];

  /** 設置地圖格點 放置砲塔資料, 生成"放置砲塔zone" */
  public setMap(mapData: number[][]) {
    // 設置mapZoneData資料
    for (let y = 0; y < mapData.length; ++y) {
      this.mapZoneData.push([]);
      for (const stateData of mapData[y]) {
        this.mapZoneData[y].push({ state: stateData, zone: undefined });
      }
    }
    // 生成"放置砲塔zone"
    for (let y = 0; y < mapData.length; ++y) {
      for (let x = 0; x < mapData[y].length; ++x) {
        if (mapData[y][x] === DefenseMapZoneType.Settable) {
          // 建立可放置的區域, 並加進mapZoneData統一管理
          this.mapZoneData[y][x].zone = this.createZone(x, y);
        }
      }
    }
  }

  /** 設定地圖資料
   * @param rank 第幾排(x)
   * @param index 第n排的第幾個數值(y)
   * @param zoneType 傳入地圖資料(0代表可放置炮塔，-1代表無法放置炮塔, 1代表已放置塔防)
   */
  public setTowerZoneType(tilePos: Phaser.Math.Vector2, zoneType: DefenseMapZoneType) {
    // 檢查排數
    if (this.mapZoneData.length <= tilePos.y) {
      return;
    }
    // 檢查列數
    if (this.mapZoneData[tilePos.y].length <= tilePos.x) {
      return;
    }

    // 設定mapZoneData state
    this.mapZoneData[tilePos.y][tilePos.x].state = zoneType;

    // zone防呆
    const zone = this.mapZoneData[tilePos.y][tilePos.x].zone;
    if (zone == null) {
      console.error('DefenseMapDialog.setTowerZoneType() error, zone not found! tilePos = ' + tilePos);
      return;
    }

    // 根據zoneType設定zone的TilePos data
    switch (zoneType) {
      case DefenseMapZoneType.Settable:
        // 已設置 -> 可設置, 設定zone的TilePos
        zone.setData(DefenseString.TilePos, { x: tilePos.x, y: tilePos.y });
        break;
      case DefenseMapZoneType.AlreadySet:
        // 可設置 -> 已設置, 清除zone的TilePos
        zone.setData(DefenseString.TilePos, undefined);
        break;
    }
  }

  protected setUI(): void {
    return;
  }

  /** 創建 砲塔佈署區域 */
  private createZone(x: number, y: number): Phaser.GameObjects.Zone {
    const zoneX = (x + 0.5) * DefenseNumber.TileSizeX + DefenseNumber.OffsetX;
    const zoneY = (y + 0.5) * DefenseNumber.TileSizeY + DefenseNumber.OffsetY;
    const zone = this.addZone(zoneX, zoneY, DefenseNumber.TileSizeX, DefenseNumber.TileSizeY);
    zone.setInteractive({ draggable: true, dropZone: true });
    // 設置TilePos data, 拖動砲塔時會判斷此值存在與否, 來決定能否設置砲塔
    zone.setData(DefenseString.TilePos, { x, y });
    return zone;
  }
}
