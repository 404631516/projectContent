import { Scene } from 'phaser';
import Object2D from '../Object2D';
import { clamp } from '@/views/H5/Helper/MathHelper';

/** 滾輪縮放攝影機zoom的component */
export default class WheelCameraComponent extends Object2D {
  /** 要操作的攝影機 */
  private camera: Phaser.Cameras.Scene2D.Camera;
  /** 攝影機zoom最小值 */
  private scaleMin: number = 0.5;
  /** 攝影機zoom最大值 */
  private scaleMax: number = 5;
  /** 每次滾輪事件發生時, zoom的變動量 */
  private scaleDiff: number = 0.2;

  /** 鎖玩家操作 */
  private isLock = false;

  /** 是否只接受來自指定camera的mouse input, 否則在gameScene任何地方皆可操作 */
  private isCameraInputOnly: boolean;

  /** 預設滾輪縮放時間 */
  private readonly wheelZoomSec = 0.1;

  /** 外部設定的action, 在zoom的tween開始之前觸發 */
  public onZoomAction?: (targetZoom: number) => void;

  constructor(scene: Scene, camera: Phaser.Cameras.Scene2D.Camera, isCameraInputOnly: boolean = false) {
    super(scene);
    // 指定camera
    this.camera = camera;
    // 是否只接受來自指定camera的滑鼠操作
    this.isCameraInputOnly = isCameraInputOnly;

    // 取得input pointer, 拿來取得滑鼠位置
    const pointer = scene.input.activePointer;
    // 滑鼠滾輪事件
    scene.input.on(Phaser.Input.Events.POINTER_WHEEL, () => {
      this.onMouseWheel(pointer);
    });
  }

  /** 滾輪縮放
   * @param event
   */
  private onMouseWheel(pointer: Phaser.Input.Pointer): void {
    // 是否有鎖玩家操作
    if (this.isLock) {
      return;
    }
    // 滑鼠是否在控制的攝影機上
    if (this.isCameraInputOnly && pointer.camera !== this.camera) {
      return;
    }
    // zoom in/out
    this.zoomOnce(pointer.deltaY < 0);
  }

  /** 鏡頭依照「預設的縮放比」縮放一次
   * @param isZoomIn 鏡頭是否拉近
   */
  public zoomOnce(isZoomIn: boolean): void {
    // zoom改變量
    let targetZoom = this.camera.zoom;
    const diff = isZoomIn ? this.scaleDiff : -this.scaleDiff;
    targetZoom += diff;
    // clamp
    targetZoom = clamp(targetZoom, this.scaleMax, this.scaleMin);
    // tween操作
    this.zoomTo(targetZoom, this.wheelZoomSec);
  }

  /** tween調整zoom
   * @param targetZoom
   * @param sec
   */
  public zoomTo(targetZoom: number, sec: number = this.wheelZoomSec): void {
    // 若input targetZoom <= 0, 則zoom不變, 或已達到目標zoom, 返回
    if (targetZoom <= 0 || targetZoom === this.camera.zoom) {
      return;
    }

    // 鎖玩家操作
    this.isLock = true;

    // 若有設定onZoomAction, 觸發之
    if (this.onZoomAction) {
      this.onZoomAction(targetZoom);
    }

    // 攝影機縮放
    this.camera.zoomTo(
      targetZoom,
      sec * 1000,
      'Linear',
      true,
      (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        // 完成9成時就可以再次觸發滾輪縮放，使縮放過程更為順暢，不卡頓
        if (progress > 0.9) {
          // 清除鎖定
          this.isLock = false;
        }
      }
    );
  }

  /** 取得鏡頭縮放比率 */
  public get cameraZoom(): number {
    return this.camera.zoom;
  }

  /** 設定鏡頭zoom in/out最大最小縮放比, 以及每次滾輪滾動時要放大/縮小多少
   * @param min camera.zoom預設為1, 此值越小則可將畫面上的物品縮越小
   * @param max camera.zoom預設為1, 此值越大則可將畫面上的物品放越大
   * @param diff 每次滾輪事件發生時, zoom的變動量
   */
  public setZoomRange(min: number, max: number, diff: number): void {
    this.scaleMin = min;
    this.scaleMax = max;
    this.scaleDiff = diff;
  }

  /** 外部設定, 是否鎖玩家操作
   * @param isLock 是否鎖玩家操作
   */
  public setLock(isLock: boolean): void {
    this.isLock = isLock;
  }
}
