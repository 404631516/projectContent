import { Scene } from 'phaser';
import Object2D from '../Object2D';

/** 拖動滑鼠就會移動攝影機 */
export default class DragCameraComponent extends Object2D {
  /** 要操作的攝影機 */
  private camera: Phaser.Cameras.Scene2D.Camera;

  /** 鎖玩家操作 */
  private isLock = false;

  /** 是否只接受來自指定camera的mouse input, 否則在gameScene任何地方皆可操作 */
  private isCameraInputOnly: boolean;

  /** 滑鼠在上個frame的位置, 計算移動量用 */
  private mousePreviousLocation!: Phaser.Math.Vector2;

  constructor(scene: Scene, camera: Phaser.Cameras.Scene2D.Camera, isCameraInputOnly: boolean = false) {
    super(scene);

    // 指定camera
    this.camera = camera;
    // 是否只接受來自指定camera的滑鼠操作
    this.isCameraInputOnly = isCameraInputOnly;

    // 滑鼠移動事件
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      // 更新滑鼠位置
      this.mousePreviousLocation = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });

    // 滑鼠移動事件
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      // 滑鼠按壓期間才做處理
      if (pointer.isDown) {
        // 更新攝影機位置
        this.onMouseMove(pointer);
        // 更新滑鼠位置
        this.mousePreviousLocation = new Phaser.Math.Vector2(pointer.x, pointer.y);
      }
    });
  }

  /** 拖動滑鼠 */
  private onMouseMove(pointer: Phaser.Input.Pointer): void {
    // 是否有鎖玩家操作
    if (this.isLock) {
      return;
    }
    // 滑鼠是否在控制的攝影機上
    if (this.isCameraInputOnly && pointer.camera !== this.camera) {
      return;
    }
    // 當前滑鼠位置
    const mouseLocation: Phaser.Math.Vector2 = new Phaser.Math.Vector2(pointer.x, pointer.y);
    // 計算移動量
    const moveVector: Phaser.Math.Vector2 = mouseLocation.subtract(this.mousePreviousLocation);
    // 移動量根據當時縮放比調整
    moveVector.x /= this.camera.zoom;
    moveVector.y /= this.camera.zoom;
    // 更新攝影機位置
    this.camera.scrollX -= moveVector.x;
    this.camera.scrollY -= moveVector.y;
  }

  /** 外部設定, 是否鎖玩家操作
   * @param isLock 是否鎖玩家操作
   */
  public setLock(isLock: boolean): void {
    this.isLock = isLock;
  }
}
