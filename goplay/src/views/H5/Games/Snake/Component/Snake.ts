import { Vector } from 'matter';
import { SnakeDepth, SnakeMovePeriod, SnakeNumber, SnakeString } from '../Data/SnakeConfig';
import SnakeGameScene from '../Scenes/SnakeGameScene';

export default class Snake {
  /** game scene */
  private snakeScene: SnakeGameScene;
  /** 蛇身圖片array */
  public body: Phaser.Physics.Arcade.Sprite[] = [];
  /** 蛇身方向array */
  private directions: Phaser.Math.Vector2[] = [];
  /** 最後輸入的移動方向, 輸入時push, update時刪除, 最多只會存入一個值, 之所以做成array是為了方便push & shift */
  private moveEvents: Phaser.Math.Vector2[] = [];
  /** 玩家輸入移動方向的鎖, 蛇身更新後解鎖 */
  private keyLock: boolean = false;
  /** 蛇是否活著 */
  private alive: boolean = true;
  /** 蛇是否活著 */
  public isAlive(): boolean {
    return this.alive;
  }
  /** 蛇身下次前進時間點(毫秒) */
  private moveTime: number = 0;
  /** 蛇身前進週期(毫秒) */
  private movePeriod: SnakeMovePeriod = SnakeMovePeriod.Normal;
  /** 變速功能結束時間點, 時間到時改回正常速度 */
  private speedBackToNormalTime: number = 0;
  /** 蛇身當前移動方向 */
  private direction: Phaser.Math.Vector2 = Phaser.Math.Vector2.RIGHT;

  /** constructor
   * @param snakeScene game scene
   * @param gridX 蛇頭x格子座標
   * @param gridY 蛇頭y格子座標
   */
  constructor(snakeScene: SnakeGameScene, gridX: number, gridY: number) {
    this.snakeScene = snakeScene;
    this.initSnake(gridX, gridY);
  }

  /** 生成貪食蛇
   * @param x 蛇頭x格子座標
   * @param y 蛇頭y格子座標
   */
  private initSnake(gridX: number, gridY: number): void {
    // 計算蛇頭座標
    const headPosX = SnakeNumber.GameRangeLeftTopX + gridX * SnakeNumber.GridSize + SnakeNumber.GridSize / 2;
    const headPosY = SnakeNumber.GameRangeLeftTopY + gridY * SnakeNumber.GridSize + SnakeNumber.GridSize / 2;
    // 蛇頭初始化
    const snakeHead = this.snakeScene.physics.add.sprite(headPosX, headPosY, SnakeString.SnakeRight);
    snakeHead.setDisplaySize(SnakeNumber.GridSize, SnakeNumber.GridSize);
    snakeHead.setDepth(SnakeDepth.SnakeHead);
    this.body.push(snakeHead);
    // 蛇身初始化
    const snakeTail = this.snakeScene.physics.add.sprite(
      headPosX - SnakeNumber.GridSize,
      headPosY,
      SnakeString.TailLeft,
    );
    snakeTail.setDisplaySize(SnakeNumber.GridSize, SnakeNumber.GridSize);
    this.body.push(snakeTail);
    // 紀錄初始蛇頭方向
    this.directions.unshift(this.direction.clone());
  }

  /** 改變蛇頭面向
   * @param vector 方向向量
   * @param animation 動畫名稱
   */
  public faceDirection(vector: Phaser.Math.Vector2): void {
    const oppositeVector = new Phaser.Math.Vector2(-vector.x, -vector.y);
    if (this.keyLock === false && this.direction.equals(oppositeVector) === false) {
      this.moveEvents.push(vector);
      this.keyLock = true;
    }
  }

  /** update
   * @param time 遊戲開始所經過時間
   * @returns 蛇身是否有前進
   */
  public update(currentTime: number): boolean {
    // 若蛇死亡, 則不更新
    if (this.alive === false) {
      return false;
    }
    // 若移動時間到了
    if (currentTime >= this.moveTime) {
      // 若有輸入移動方向
      this.keyLock = false;
      if (this.moveEvents.length > 0) {
        this.direction = this.moveEvents.shift()!;
        // 設定蛇頭方向
        this.setSnakeHeadDirection(this.direction);
      }
      // 蛇身前進
      this.move();
      // 設定下次移動時間 TODO 企劃考慮, 是否要蛇身愈長, 移動速度愈快
      if (this.movePeriod !== SnakeMovePeriod.Normal && currentTime >= this.speedBackToNormalTime) {
        this.movePeriod = SnakeMovePeriod.Normal;
        // TODO 關閉加減速特效
      }
      this.moveTime = currentTime + this.movePeriod;
      return true;
    }
    return false;
  }

  /**
   * 設定蛇頭貼圖
   * @param direction 蛇頭方向
   */
  private setSnakeHeadDirection(direction: Phaser.Math.Vector2): void {
    switch (direction) {
      case Phaser.Math.Vector2.RIGHT:
        this.body[0].setTexture(SnakeString.SnakeRight);
        break;
      case Phaser.Math.Vector2.LEFT:
        this.body[0].setTexture(SnakeString.SnakeLeft);
        break;
      case Phaser.Math.Vector2.UP:
        this.body[0].setTexture(SnakeString.SnakeUp);
        break;
      case Phaser.Math.Vector2.DOWN:
        this.body[0].setTexture(SnakeString.SnakeDown);
        break;
      default:
        console.error('setSnakeHeadDirection error', direction);
        break;
    }
  }

  /** 設定變速功能
   * @param movePeriod 蛇身前進週期
   * @param currentTime 當前遊戲時間
   * @param duration 變速功能持續時間
   */
  public setMovePeriod(movePeriod: SnakeMovePeriod, currentTime: number, duration: number): void {
    this.movePeriod = movePeriod;
    this.speedBackToNormalTime = currentTime + duration;
    // TODO 加減速特效
  }

  /** 蛇身前進一次 */
  private move(): void {
    const snakeHead = this.body[0];
    const oldHeadPosition = new Phaser.Math.Vector2(snakeHead.x, snakeHead.y);
    // 記錄蛇頭方向, 順便shift其他蛇身方向
    this.directions.unshift(this.direction.clone());
    snakeHead.x += this.direction.x * SnakeNumber.GridSize;
    snakeHead.y += this.direction.y * SnakeNumber.GridSize;
    // 若蛇頭超出邊界, 則遊戲結束
    if (this.isSnakeHeadOutOfBounds(snakeHead)) {
      this.onSnakeHitWall();
      return;
    }
    // 更新蛇身位置 & 貼圖
    this.updateBody(oldHeadPosition);
    // 更新蛇尾貼圖
    this.updateTailTexture();
  }

  /** 確認蛇頭是否超出邊界
   * @param snakeHead 蛇頭
   * @returns 是否超出邊界
   */
  private isSnakeHeadOutOfBounds(snakeHead: Phaser.Physics.Arcade.Sprite): boolean {
    return (
      snakeHead.x > SnakeNumber.GameRangeRightBottomX ||
      snakeHead.x < SnakeNumber.GameRangeLeftTopX ||
      snakeHead.y > SnakeNumber.GameRangeRightBottomY ||
      snakeHead.y < SnakeNumber.GameRangeLeftTopY
    );
  }

  /** 更新所有蛇身位置 & 貼圖
   * @param oldHeadPosition
   */
  private updateBody(oldHeadPosition: Phaser.Math.Vector2): void {
    for (let i = 1; i < this.body.length; i++) {
      const oldBodyPosition = new Phaser.Math.Vector2(this.body[i].x, this.body[i].y);
      const oldBodyDirection = this.directions[i];

      this.body[i].setPosition(oldHeadPosition.x, oldHeadPosition.y);
      oldHeadPosition.x = oldBodyPosition.x;
      oldHeadPosition.y = oldBodyPosition.y;

      this.setBodyPartTexture(i, oldBodyDirection);
    }
  }

  /** 設定單個蛇身的貼圖
   * @param index 蛇身index
   * @param oldBodyDirection 這格蛇身更新前的舊方向
   */
  private setBodyPartTexture(index: number, oldBodyDirection: Phaser.Math.Vector2): void {
    if (oldBodyDirection.equals(this.directions[index - 1]) === false) {
      const prevDirection = `${this.directions[index - 1].x},${this.directions[index - 1].y}`;
      const currDirection = `${oldBodyDirection.x},${oldBodyDirection.y}`;
      const textureMap: { [key: string]: string } = {
        '1,0,0,-1': SnakeString.BodyUpRight,
        '0,1,-1,0': SnakeString.BodyUpRight,
        '-1,0,0,1': SnakeString.BodyRightUp,
        '0,-1,1,0': SnakeString.BodyRightUp,
        '0,1,1,0': SnakeString.BodyRightDown,
        '-1,0,0,-1': SnakeString.BodyRightDown,
        '0,-1,-1,0': SnakeString.BodyDownRight,
        '1,0,0,1': SnakeString.BodyDownRight,
      };

      const directionKey = `${prevDirection},${currDirection}`;
      this.body[index].setTexture(textureMap[directionKey]);
    } else {
      this.body[index].setTexture(oldBodyDirection.y !== 0 ? SnakeString.BodyVertical : SnakeString.BodyHorizontal);
    }
  }

  /** 更新蛇尾貼圖 */
  private updateTailTexture(): void {
    const tailIndex = this.body.length - 1;
    if (tailIndex > 0) {
      const prevDirection = this.directions[tailIndex - 1];
      const textureMap: { [key: string]: string } = {
        '0,-1': SnakeString.TailDown,
        '0,1': SnakeString.TailUp,
        '-1,0': SnakeString.TailRight,
        '1,0': SnakeString.TailLeft,
      };

      const directionKey = `${prevDirection.x},${prevDirection.y}`;
      this.body[tailIndex].setTexture(textureMap[directionKey]);
    }
  }

  /** 蛇身成長 */
  public grow(): void {
    const newPart = this.snakeScene.physics.add.sprite(
      -SnakeNumber.GridSize,
      -SnakeNumber.GridSize,
      SnakeString.TailRight,
    );
    newPart.setDisplaySize(SnakeNumber.GridSize, SnakeNumber.GridSize);
    // 蛇頭吃到蛇身時onSnakeHit()
    this.snakeScene.physics.add.collider(this.body[0], newPart, this.onSnakeHit, undefined, this);
    this.body.push(newPart);
  }

  /** 蛇身縮小 */
  public shrink(): void {
    // TODO 蛇身縮短特效
    if (this.body.length <= 2) {
      return;
    }
    this.body[this.body.length - 1].destroy();
    this.body.pop();
    this.directions.pop();
    this.moveEvents.pop();
  }

  /** 蛇頭撞牆 */
  private onSnakeHitWall(): void {
    // 蛇頭此時已超出邊界外, 退回原位
    // 吃到蛇身時, 蛇身已前進, 所以蛇頭不用退回原位
    this.body[0].x -= this.direction.x * SnakeNumber.GridSize;
    this.body[0].y -= this.direction.y * SnakeNumber.GridSize;
    this.onSnakeHit();
  }

  /** 撞牆或撞到身體 */
  private onSnakeHit(): void {
    // 蛇死亡
    this.alive = false;
    // disable掉除了蛇頭以外的所有蛇身, 避免下次update時蛇身繼續前進
    this.body.forEach((part, index) => {
      if (index > 0) {
        if (part.body) {
          part.body.enable = false;
        }
      }
    });
    // 通知gameScene
    this.snakeScene.onSnakeHit();
  }

  /**
   * 重生
   */
  public revive(): void {
    // 蛇復活
    this.alive = true;
    // 重啟蛇身碰撞偵測
    this.body.forEach((part, index) => {
      if (index > 0) {
        if (part.body) {
          part.body.enable = true;
        }
      }
    });
    // 清空玩家輸入之蛇身方向指令
    this.moveEvents = [];
    // 蛇身長度太長的話, 會超出遊戲畫面, 故重生時縮小至指定長度
    if (this.body.length > SnakeNumber.ReviveMaxSnakeLength) {
      // 刪除超過長度的蛇身
      for (let i = this.body.length - 1; i >= SnakeNumber.ReviveMaxSnakeLength; i--) {
        this.body[i].destroy();
        this.body.pop();
        this.directions.pop();
      }
    }
    // 蛇身長度不變, 蛇尾從指定位置開始螺旋往外排列
    this.generateSpiralBody(10, 3);
  }

  /** 蛇身長度不變, 蛇尾從指定位置開始螺旋往外排列
   * @param centerX 重生中心x座標(grid)
   * @param centerY 重生中心y座標(grid)
   */
  private generateSpiralBody(centerX: number, centerY: number): void {
    const bodyLength = this.body.length;
    // 座標位置
    let x = centerX;
    let y = centerY;
    // 蛇身延展步數
    let step = 1;
    // 方向
    let dx = 1;
    let dy = 0;
    // 當前步數
    let currentStep = 0;
    let index = bodyLength - 1;

    // 從中心開始順時針往外計算蛇身位置, 中心點為蛇尾
    for (let i = 0; i < bodyLength; i++) {
      // 設定蛇身位置
      this.body[index].setPosition(
        SnakeNumber.GameRangeLeftTopX + x * SnakeNumber.GridSize + SnakeNumber.GridSize / 2,
        SnakeNumber.GameRangeLeftTopY + y * SnakeNumber.GridSize + SnakeNumber.GridSize / 2,
      );
      // 設定蛇身方向
      this.directions[index - 1] = new Phaser.Math.Vector2(dx, dy);
      // 設定蛇頭接下來的移動方向
      if (index === 1) {
        this.direction = new Phaser.Math.Vector2(dx, dy);
      }

      index--;
      x += dx;
      y += dy;
      currentStep++;

      if (currentStep === step) {
        currentStep = 0;
        [dx, dy] = [-dy, dx]; // 方向變換順時針
        if (dy === 0) {
          step++; // 每兩次變換增加步數
        }
      }
    }

    // 設定蛇頭方向
    let headDirection = Phaser.Math.Vector2.ZERO;
    if (this.direction.x === 0) {
      headDirection = this.direction.y === 1 ? Phaser.Math.Vector2.DOWN : Phaser.Math.Vector2.UP;
    } else {
      headDirection = this.direction.x === 1 ? Phaser.Math.Vector2.RIGHT : Phaser.Math.Vector2.LEFT;
    }
    this.setSnakeHeadDirection(headDirection);
    // 設定蛇身貼圖
    for (let i = 1; i < this.body.length; i++) {
      const oldBodyDirection = this.directions[i];
      this.setBodyPartTexture(i, oldBodyDirection);
    }
    // 設定蛇尾貼圖
    this.updateTailTexture();
  }
}
