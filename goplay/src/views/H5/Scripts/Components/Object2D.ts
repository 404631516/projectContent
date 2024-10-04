import { Scene } from 'phaser';
import PhaserHelper, { ParticleEmitterData } from '../../Helper/PhaserHelper';

type GameObject = Phaser.GameObjects.GameObject;
type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;
type Sprite = Phaser.GameObjects.Sprite;
type Graphics = Phaser.GameObjects.Graphics;
type Zone = Phaser.GameObjects.Zone;
type ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
type ArcadeImage = Phaser.Physics.Arcade.Image;
type ArcadeSprite = Phaser.Physics.Arcade.Sprite;

/** Object2D新增文字時的預設 */
const defaultObject2DTextStyle: TextStyle = {
  fontFamily: 'sans-serif, serif, monospace',
  fontStyle: 'normal',
  color: '#FFFFFF',
  fontSize: '20px',
  stroke: '#000000',
  strokeThickness: 3,
};

export default class Object2D extends Phaser.GameObjects.Container {
  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y);
    scene.add.existing(this);
  }

  public static textFontMetricsMap: Map<string, Phaser.Types.GameObjects.Text.TextMetrics> = new Map();

  /** 建立文字 */
  public addText(content: string, x: number, y: number, style?: TextStyle): Phaser.GameObjects.Text {
    // 已預設的文字風格為優先
    const mergedStyle: TextStyle = style ? { ...defaultObject2DTextStyle, ...style } : defaultObject2DTextStyle;
    const fontFamily = mergedStyle.fontFamily ?? 'defaultFont';
    const fontSize = mergedStyle.fontSize ?? 'defaultSize';
    const metricsKey = fontFamily + fontSize;
    // 先查找是否有暫存的metrics
    mergedStyle.metrics = Object2D.textFontMetricsMap.get(metricsKey);
    // 用metrics創建文字，增進效能
    const stringText = this.scene.add.text(x, y, content, mergedStyle);
    // 沒有的話暫存文字metrics
    if (mergedStyle.metrics == null) {
      Object2D.textFontMetricsMap.set(metricsKey, stringText.getTextMetrics());
    }
    // Origin置中
    stringText.setOrigin(0.5, 0.5);
    return this.addExistingObject(stringText);
  }

  /** 加入圖片
   * @param key 資源key(image key或ui atlas名稱)
   * @param x
   * @param y
   * @param frame 影格名(ui atlas的子圖名)
   * @param type 繼承class的建構子
   */
  public addImage<T extends Phaser.GameObjects.Image>(
    key: string,
    x: number,
    y: number,
    frame?: string | number,
    type?: new (scene: Scene, x: number, y: number, key: string, frame?: string | number) => T
  ): T {
    // 建立圖片物件
    const image = type
      ? new type(this.scene, x, y, key, frame)
      : (new Phaser.GameObjects.Image(this.scene, x, y, key, frame) as T);

    // 置中
    image.setOrigin(0.5, 0.5);

    // 將物件放入場景及本身
    return this.addExistingObject(image);
  }

  /** 加入動畫 */
  public addSprite<T extends Sprite>(
    key: string,
    x: number,
    y: number,
    type?: new (scene: Scene, x: number, y: number, key: string) => T
  ): T {
    // 建立圖片物件
    const sprite = type ? new type(this.scene, x, y, key) : (new Phaser.GameObjects.Sprite(this.scene, x, y, key) as T);

    // 置中
    sprite.setOrigin(0.5, 0.5);

    // 將物件放入場景及本身
    return this.addExistingObject(sprite);
  }

  /** 加入TileSprite */
  public addTileSprite<T extends Phaser.GameObjects.TileSprite>(
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    type?: new (scene: Scene, x: number, y: number, width: number, height: number, key: string) => T
  ) {
    // 建立圖片物件
    const tileSprite = type
      ? new type(this.scene, x, y, width, height, key)
      : (new Phaser.GameObjects.TileSprite(this.scene, x, y, width, height, key) as T);

    // 置中
    tileSprite.setOrigin(0.5, 0.5);

    // 物件放入場景及圖層
    return this.addExistingObject(tileSprite);
  }

  /** 加入組合物件 */
  public addObject<T extends Object2D>(
    x: number,
    y: number,
    type?: new (scene: Scene, x: number, y: number, ...args: any) => T,
    ...args: any
  ): T {
    // 建立圖片物件
    const obj = type ? new type(this.scene, x, y, ...args) : (new Object2D(this.scene, x, y) as T);

    // 將物件放入場景及本身
    return this.addExistingObject(obj);
  }

  /** 加入圖形 */
  public addGraphics<T extends Graphics>(x: number, y: number, type?: new (scene: Scene) => T): T {
    // 建立圖形物件
    const graphics = type ? new type(this.scene) : (new Phaser.GameObjects.Graphics(this.scene) as T);

    // 設置位置
    graphics.setPosition(x, y);

    // 將物件放入場景及本身
    return this.addExistingObject(graphics);
  }

  /** 加入感應區域 */
  public addZone<T extends Zone>(
    x: number,
    y: number,
    width?: number,
    height?: number,
    type?: new (scene: Scene, x: number, y: number, width?: number, height?: number) => T
  ): T {
    // 建立圖形物件
    const zone = type
      ? new type(this.scene, x, y, width, height)
      : (new Phaser.GameObjects.Zone(this.scene, x, y, width, height) as T);

    // 將物件放入場景及本身
    return this.addExistingObject(zone);
  }

  /** 加入粒子發射器 */
  public addParticleEmitter<T extends ParticleEmitter>(particleData: ParticleEmitterData): T {
    // 建立粒子發射器物件
    const particleEmitter = PhaserHelper.createParticleEmitter(this.scene, particleData) as T;

    // 將物件放入場景及本身
    return this.addExistingObject(particleEmitter);
  }

  /** 加入有物理性質的圖片 */
  public addPhysicsImage<T extends ArcadeImage>(
    key: string,
    x: number,
    y: number,
    isStatic: boolean = false,
    type?: new (scene: Scene, x: number, y: number, key: string) => T
  ): T {
    // 建立圖片物件
    const image = type
      ? new type(this.scene, x, y, key)
      : (new Phaser.Physics.Arcade.Image(this.scene, x, y, key) as T);

    // 置中
    image.setOrigin(0.5, 0.5);

    // 將物件放入場景及本身
    return this.addExistingPhysicsObject(image, isStatic);
  }

  /** 加入有物理性質的動畫 */
  public addPhysicsSprite<T extends ArcadeSprite>(
    key: string,
    x: number,
    y: number,
    isStatic: boolean,
    type?: new (scene: Scene, x: number, y: number, key: string) => T
  ): T {
    // 建立圖片物件
    const sprite = type
      ? new type(this.scene, x, y, key)
      : (new Phaser.Physics.Arcade.Sprite(this.scene, x, y, key) as T);

    // 置中
    sprite.setOrigin(0.5, 0.5);

    // 將物件放入場景及本身
    return this.addExistingPhysicsObject(sprite, isStatic);
  }

  /** 加入有物理性質的組合物件 */
  public addPhysicsObject<T extends Object2D>(
    x: number,
    y: number,
    isStatic: boolean,
    type?: new (scene: Scene, x: number, y: number, ...args: any) => T,
    ...args: any
  ): T {
    // 創建物件
    const obj = type ? new type(this.scene, x, y, ...args) : (new Object2D(this.scene, x, y) as T);

    // 將物件放入場景及本身
    return this.addExistingPhysicsObject(obj, isStatic);
  }

  /** 設置Object2D的水平、垂直翻轉
   * @param flipX 水平方向的翻轉狀態，true為翻轉，false為不翻轉
   * @param flipY 垂直方向的翻轉狀態，true為翻轉，false為不翻轉
   */
  public setFlip(flipX: boolean, flipY: boolean): void {
    // 假如要設置的翻轉狀態與目前翻轉狀態不同
    // ex: flipX === true(要翻轉) 且 this.scaleX > 0(未翻轉)
    // ex: flipX === false(不翻轉) 且 this.scaleX > 0(已翻轉)
    if (flipX === this.scaleX > 0) {
      // 根據flipX設置翻轉狀態
      this.scaleX = flipX ? this.scaleX * -1 : Math.abs(this.scaleX);
    }

    // 假如要設置的翻轉狀態與目前翻轉狀態不同
    // ex: flipY === true(要翻轉) 且 this.scaleY > 0(未翻轉)
    // ex: flipY === false(不翻轉) 且 this.scaleY > 0(已翻轉)
    if (flipY === this.scaleY > 0) {
      // 根據flipY設置翻轉狀態
      this.scaleY = flipY ? this.scaleY * -1 : Math.abs(this.scaleY);
    }

    // 假如有設置物理Body
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body !== undefined) {
      // 根據翻轉狀態調整物理body偏移
      body.setOffset(this.scaleX < 0 ? this.width : 0, this.scaleY < 0 ? this.height : 0);
    }
  }

  /** 將物件放入場景清單及本身Child
   * @param obj 要加入的物件
   * @returns T
   */
  private addExistingObject<T extends GameObject>(obj: T): T {
    // 將物件放入場景清單
    obj = this.scene.add.existing(obj);
    // 將物件放入本身Child
    this.add(obj);
    return obj;
  }

  /** 將物件放入場景物理清單及本身Child
   * @param obj 要加入的物件
   * @param isStatic 靜態或動態
   * @returns T
   */
  private addExistingPhysicsObject<T extends GameObject>(obj: T, isStatic: boolean): T {
    // 將物件放入場景物理清單
    obj = this.scene.physics.add.existing(obj, isStatic);
    // 將物件放入本身Child
    this.add(obj);
    return obj;
  }
}
