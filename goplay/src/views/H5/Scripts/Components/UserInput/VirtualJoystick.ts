import * as Phaser from 'phaser';
import { EventEmitter2 } from 'eventemitter2';
import { CompassRad } from '@/views/H5/Helper/MathHelper';

/** 搖桿事件 */
export enum JoystickEvent {
  Move = 'move',
  Stop = 'stop',
}

/** 搖桿方向模式, 回傳方向的種類 */
export enum JoystickDirectionMode {
  /** 回傳左、右其中一個方向 */
  LeftRight = 'leftRight',
  /** 回傳上、下其中一個方向 */
  UpDown = 'upDown',
  /** 回傳上、下、左、右其中一個方向 */
  Four = 'four',
  /** 回傳上、下、左、右、左上、右上、左下、右下其中一個方向 */
  Eight = 'eight',
}

/** 虛擬搖桿 */
export class VirtualJoystick extends Phaser.GameObjects.Container {
  /** 偵測範圍 */
  private joystickArea: Phaser.GameObjects.Zone;
  /** 玩家拖動原點 */
  private dragOrigin: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  /** 事件發送器 */
  private eventEmitter: EventEmitter2;
  /** 最終拖動方向 */
  private currentDirection: CompassRad = CompassRad.None;
  /** 拖動距離離中心點超過這個數值才做移動 */
  private readonly detectDistance = 10;
  /** 搖桿方向模式 */
  private joystickDirectionMode: JoystickDirectionMode;

  /** 是否繪製搖桿 */
  private isDrawJoystick: boolean;
  /** 搖桿背景 */
  private joystickBackground: Phaser.GameObjects.Graphics;
  /** 搖桿手柄 */
  private joystickHandle: Phaser.GameObjects.Graphics;
  /** 搖桿背景尺寸 */
  private readonly joystickSize = 100;
  /** 搖桿背景尺寸 1/2 */
  private joystickSizeHalf: number;
  /** 搖桿背景尺寸 1/4 */
  private joystickSizeQuarter: number;

  /** 建構子
   * @param scene game scene
   * @param centerX 偵測範圍中心點x
   * @param centerY 偵測範圍中心點y
   * @param width 偵測範圍寬度
   * @param height 偵測範圍高度
   * @param joystickDirectionMode 搖桿方向模式, 影響回傳方向的種類
   * @param isDrawJoystick 是否繪製搖桿
   */
  constructor(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    joystickDirectionMode: JoystickDirectionMode,
    isDrawJoystick: boolean,
  ) {
    super(scene, 0, 0);
    this.eventEmitter = new EventEmitter2();
    this.joystickDirectionMode = joystickDirectionMode;
    this.isDrawJoystick = isDrawJoystick;

    // 創建一個區域作為搖桿的活動範圍
    this.joystickArea = this.scene.add
      .zone(centerX, centerY, width, height)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)
      .on(Phaser.Input.Events.POINTER_MOVE, this.onDrag, this)
      .on(Phaser.Input.Events.POINTER_UP, this.stopDrag, this)
      .on(Phaser.Input.Events.POINTER_OUT, this.stopDrag, this);
    this.add(this.joystickArea);

    // 搖桿繪製初始化
    this.drawJoystickInit();

    scene.add.existing(this);
  }

  /** 開始拖動 */
  private startDrag(pointer: Phaser.Input.Pointer) {
    // 設定拖動原點
    this.dragOrigin = new Phaser.Math.Vector2(pointer.x, pointer.y);
    // 顯示搖桿
    this.showJoystick();
  }

  /** 拖動中 */
  private onDrag(pointer: Phaser.Input.Pointer) {
    if (!pointer.isDown) {
      return;
    }

    // 計算拖動向量
    const dragVector = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(this.dragOrigin);
    // 若拖動距離太短，視作無效
    if (dragVector.length() < this.detectDistance) {
      this.updateDirection(JoystickEvent.Move, CompassRad.None);
      this.updateJoystickHandle(0, 0);
      return;
    }
    // 轉成單位向量
    dragVector.normalize();

    // 判斷方向
    let direction = CompassRad.None;
    switch (this.joystickDirectionMode) {
      case JoystickDirectionMode.LeftRight:
        direction = this.getDragDirectionByLeftRight(dragVector);
        break;
      case JoystickDirectionMode.UpDown:
        direction = this.getDragDirectionByUpDown(dragVector);
        break;
      case JoystickDirectionMode.Four:
        direction = this.getDragDirectionByFourWay(dragVector);
        break;
      case JoystickDirectionMode.Eight:
        direction = this.getDragDirectionByEightWay(dragVector);
        break;
      default:
        console.error('Unknown joystickDirectionMode', this.joystickDirectionMode);
        break;
    }
    // 更新方向並發送事件
    this.updateDirection(JoystickEvent.Move, direction);

    // 更新搖桿的方向位置
    this.updateJoystickHandle(dragVector.x, dragVector.y);
  }

  /** 根據左右判斷拖動方向
   * @param dragVector 拖動向量
   * @returns 左或右其中一個方向
   */
  private getDragDirectionByLeftRight(dragVector: Phaser.Math.Vector2): CompassRad {
    if (dragVector.x > 0) {
      return CompassRad.Right;
    } else {
      return CompassRad.Left;
    }
  }

  /** 根據上下判斷拖動方向
   * @param dragVector 拖動向量
   * @returns 上或下其中一個方向
   */
  private getDragDirectionByUpDown(dragVector: Phaser.Math.Vector2): CompassRad {
    if (dragVector.y > 0) {
      return CompassRad.Down;
    } else {
      return CompassRad.Up;
    }
  }

  /** 根據四方向判斷拖動方向
   * @param dragVector 拖動向量
   * @returns 上、下、左、右其中一個方向
   */
  private getDragDirectionByFourWay(dragVector: Phaser.Math.Vector2): CompassRad {
    if (Math.abs(dragVector.x) > Math.abs(dragVector.y)) {
      if (dragVector.x > 0) {
        return CompassRad.Right;
      } else {
        return CompassRad.Left;
      }
    } else {
      if (dragVector.y > 0) {
        return CompassRad.Down;
      } else {
        return CompassRad.Up;
      }
    }
  }

  /** 根據八方向判斷拖動方向
   * @param dragVector 拖動向量
   * @returns 上、下、左、右、左上、右上、左下、右下其中一個方向
   */
  private getDragDirectionByEightWay(dragVector: Phaser.Math.Vector2): CompassRad {
    // 計算角度 (轉換成度)
    const angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(0, 0, dragVector.x, dragVector.y));

    // 根據角度判斷方向
    if (angle >= -22.5 && angle < 22.5) {
      return CompassRad.Right;
    } else if (angle >= 22.5 && angle < 67.5) {
      return CompassRad.RightDown;
    } else if (angle >= 67.5 && angle < 112.5) {
      return CompassRad.Down;
    } else if (angle >= 112.5 && angle < 157.5) {
      return CompassRad.LeftDown;
    } else if (angle >= 157.5 || angle < -157.5) {
      return CompassRad.Left;
    } else if (angle >= -157.5 && angle < -112.5) {
      return CompassRad.LeftUp;
    } else if (angle >= -112.5 && angle < -67.5) {
      return CompassRad.Up;
    } else if (angle >= -67.5 && angle < -22.5) {
      return CompassRad.RightUp;
    } else {
      console.error('getDragDirectionByEightWay: angle out of range', angle);
      return CompassRad.None;
    }
  }

  /** 停止拖動 */
  public stopDrag() {
    this.updateDirection(JoystickEvent.Stop, CompassRad.None);
    // 隱藏搖桿
    this.hideJoystick();
  }

  /** 更新方向並發送事件 */
  private updateDirection(event: JoystickEvent, direction: CompassRad): void {
    if (this.currentDirection === direction) {
      return;
    }

    // 更新方向
    this.currentDirection = direction;
    // 發送事件
    this.eventEmitter.emit(event, direction);
  }

  //#region 繪製搖桿相關function
  /** 搖桿繪製初始化 */
  private drawJoystickInit(): void {
    if (this.isDrawJoystick === false) {
      return;
    }
    // 計算搖桿尺寸
    this.joystickSizeHalf = this.joystickSize / 2;
    this.joystickSizeQuarter = this.joystickSize / 4;
    // 繪製搖桿背景
    this.joystickBackground = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.2 } });
    this.joystickBackground.fillCircle(0, 0, this.joystickSizeHalf);
    this.add(this.joystickBackground);
    this.joystickBackground.setVisible(false);
    // 繪製搖桿手柄
    this.joystickHandle = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.5 } });
    this.joystickHandle.fillCircle(0, 0, this.joystickSizeQuarter);
    this.add(this.joystickHandle);
    this.joystickHandle.setVisible(false);
  }

  /** 在dragOrigin顯示搖桿 */
  private showJoystick(): void {
    if (this.isDrawJoystick === false) {
      return;
    }
    // 顯示搖桿
    this.joystickBackground.setVisible(true);
    this.joystickHandle.setVisible(true);
    // 設定搖桿位置
    this.joystickBackground.setPosition(this.dragOrigin.x, this.dragOrigin.y);
    this.joystickHandle.setPosition(this.dragOrigin.x, this.dragOrigin.y);
  }

  /** 更新搖桿的方向位置 */
  private updateJoystickHandle(x: number, y: number) {
    if (this.isDrawJoystick === false) {
      return;
    }
    this.joystickHandle.setPosition(
      this.dragOrigin.x + x * this.joystickSizeQuarter,
      this.dragOrigin.y + y * this.joystickSizeQuarter,
    );
  }

  /** 隱藏搖桿 */
  private hideJoystick(): void {
    if (this.isDrawJoystick === false) {
      return;
    }
    this.joystickBackground.setVisible(false);
    this.joystickHandle.setVisible(false);
  }
  //#endregion

  //#region 外部使用function, 註冊監聽事件或直接取得拖動方向
  /** 註冊監聽移動事件, 可與get lastDirection()搭配或擇一使用
   * @param event 事件名稱
   * @param listener 註冊callback
   */
  public onUpdateDirection(event: JoystickEvent, listener: (direction: CompassRad) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /** 取得拖動方向, 可與onUpdateDirection()搭配或擇一使用 */
  public getDirection(): CompassRad {
    return this.currentDirection;
  }
  //#endregion
}
