import { Scene } from 'phaser';
import Object2D from '../Scripts/Components/Object2D';
import { CompassRad } from './MathHelper';
import { phaserResourceHashes } from '@/data/phaserResourceHashes';
import Helper, { ErrorId } from './Helper';
import config from '@/config/setting';

export type ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
export type ParticleEmitterConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

/** 尺寸 */
export interface Size {
  width: number;
  height: number;
}

/** 區間 */
export interface MinMax {
  min: number;
  max: number;
}

/** 粒子發射器資料 */
export interface ParticleEmitterData {
  /** 粒子圖Key */
  imageKey: string;
  /** 粒子圖對應到的發射器Config Name */
  name: string;
  /** 發射器Configs: 儲存所有該小遊戲中使用到的發射器Config資料 */
  jsonKey: string;
}

export default class PhaserHelper {
  /** 預設重力 */
  public static readonly gravity = 980;

  /** 讀取粒子發射器Config
   * @description 如需手動載入Emitter Config，統一用此function載入，確保格式一致性。
   * @param scene 遊戲場景
   * @param particleEmitterData 粒子發射器資料
   * @returns ParticleEmitterConfig
   */
  public static loadParticleEmitterConfig(
    scene: Scene,
    particleEmitterData: ParticleEmitterData,
  ): ParticleEmitterConfig {
    // 讀取Json檔案
    const particleEmitterConfigs = scene.cache.json.get(particleEmitterData.jsonKey) as ParticleEmitterConfig[];

    // 嘗試讀取對應的資料
    let particleConfig = particleEmitterConfigs.find(
      (particleEmitterConfig) => particleEmitterConfig.name === particleEmitterData.name,
    );
    if (particleConfig === undefined) {
      particleConfig = {};
      console.error(`載入 ${particleEmitterData.jsonKey} 所對應的Json檔錯誤。請檢查檔名、路徑或格式是否正確`);
    }

    return particleConfig;
  }

  /** 創建粒子發射器
   * @param scene  遊戲場景
   * @param particleEmitterData 粒子發射器資料
   * @returns ParticleEmitter
   */
  public static createParticleEmitter(scene: Scene, particleEmitterData: ParticleEmitterData): ParticleEmitter {
    // 從json config檔案讀取對應資料，取得ParticleEmitterConfig
    const particleConfig = this.loadParticleEmitterConfig(scene, particleEmitterData);

    // 創建ParticleEmitterManager並產生預設Emitter
    return scene.add.particles(0, 0, particleEmitterData.imageKey, particleConfig);
  }

  /** 由於Phaser不支持中文自動換行, 所以自行插入\n來換行 */
  public static setWordWrap(text: Phaser.GameObjects.Text, width: number): void {
    let str = text.text;
    // 計算行數
    const lineCount = Math.floor(str.length / width);
    // 從後加到前
    for (let i = lineCount; i > 0; --i) {
      const position = i * width;
      str = [str.slice(0, position), '\n', str.slice(position)].join('');
    }
    // 將換行後的字串存回Text
    text.text = str;
  }

  /** 獲取距離最近的Object2D
   * @param x 位置X
   * @param y 位置Y
   * @param object2DList 要比較的Object2D清單
   * @returns 最近的Object2D或Undefined
   */
  public static getRangeNearestObject2D(x: number, y: number, object2DList: Object2D[]): Object2D | undefined {
    let target: Object2D | undefined;
    let nearestDistance = Infinity;

    // 取距離最近
    object2DList.forEach((object2D: Object2D) => {
      const distance = Phaser.Math.Distance.Between(x, y, object2D.x, object2D.y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        target = object2D;
      }
    });

    return target;
  }

  /** 取得字串繪製範圍
   * @param text 文字內容
   * @param fontFamily 字型
   */
  public static getTextMetrics(text: string, fontFamily: string): TextMetrics | undefined {
    // 用html5指令canvas，指定文字/字型去計算實際文字範圍
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context == null) {
      console.error(`getTextMetrics: context == null.`);
      return;
    }

    // 設定相同font/size
    context.font = fontFamily;
    // 從左上計算
    context.textBaseline = 'top';
    context.textAlign = 'left';

    // 計算範圍
    return context.measureText(text);
  }

  /** 取得方向件組合出的方向弧度
   * @param cursorKeys 方向鍵
   * @returns 方向弧度
   * @description 水平或垂直同時按下則置中，不處理
   */
  public static getCursorKeyDirectionRad(cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys): CompassRad {
    const isUpPressed = cursorKeys.up.isDown;
    const isDownPressed = cursorKeys.down.isDown;
    const isLeftPressed = cursorKeys.left.isDown;
    const isRightPressed = cursorKeys.right.isDown;

    // 檢查垂直方向是否只有一個方向按下(不可同時按下)
    const isVerticalValid = (isUpPressed && isDownPressed === false) || (isUpPressed === false && isDownPressed);
    // 檢查水平方向是否只有一個方向按下(不可同時按下)
    const isHorizontalValid =
      (isLeftPressed && isRightPressed === false) || (isLeftPressed === false && isRightPressed);

    // 無效的按鍵組合，都沒按下或同時全部按下
    if (isVerticalValid === false && isHorizontalValid === false) {
      return CompassRad.None;
    }

    // 垂直方向無效，只處理左右
    if (isVerticalValid === false) {
      if (isLeftPressed) {
        return CompassRad.Left;
      } else if (isRightPressed) {
        return CompassRad.Right;
      }
    }

    // 水平方向無效，只處理上下
    if (isHorizontalValid === false) {
      if (isUpPressed) {
        return CompassRad.Up;
      } else if (isDownPressed) {
        return CompassRad.Down;
      }
    }

    // 左上
    if (isLeftPressed && isUpPressed) {
      return CompassRad.LeftUp;
    }
    // 左下
    else if (isLeftPressed && isDownPressed) {
      return CompassRad.LeftDown;
    }
    // 右上
    else if (isRightPressed && isUpPressed) {
      return CompassRad.RightUp;
    }
    // 右下
    else if (isRightPressed && isDownPressed) {
      return CompassRad.RightDown;
    }

    return CompassRad.None;
  }

  /** 更新處理OnOverlapEnter
   * @param scene 遊戲場景
   * @param overlapGroup1 重疊物體1
   * @param overlapGroup2 重疊物體2
   * @param isOverlapLastUpdate 上次是否重疊
   * @param overlapCallback 重疊時的callback
   * @param processCallback 處理callback
   * @returns 是否重疊
   */
  public static updateOnOverlapEnter(
    scene: Phaser.Scene,
    overlapGroup1: Phaser.Types.Physics.Arcade.ArcadeColliderType,
    overlapGroup2: Phaser.Types.Physics.Arcade.ArcadeColliderType,
    isOverlapLastUpdate: boolean,
    overlapCallback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
    processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
  ): boolean {
    // 檢查兩物體是否重疊
    const isOverlap = scene.physics.overlap(overlapGroup1, overlapGroup2);

    // 只在兩物體重疊的第一frame執行互動。(避免連續觸發)
    if (isOverlap && isOverlapLastUpdate === false) {
      scene.physics.overlap(overlapGroup1, overlapGroup2, overlapCallback, processCallback);
    }

    // 回傳更新狀態
    return isOverlap;
  }

  /** 確保資源url有版本號
   * @param url 資源url
   */
  public static ensureVersionedResourceUrl(url: string): string {
    // 雲端儲存的資源不加版本號
    if (url.startsWith(config.cloudStorage) === true) {
      return url;
    }

    // 移除舊有的版本號(以前撰寫的程式會在url會加上版本號?v=xxx)
    const urlWithoutQuery = url.split('?')[0];
    // 取得相對路徑
    const relativeUrl = urlWithoutQuery.replace(`${config.imgUrl}/`, '');
    // 取得資源版本號
    const hash = phaserResourceHashes.get(relativeUrl);
    if (hash === undefined) {
      Helper.assert(ErrorId.TableDataNotFound, `Resource key ${relativeUrl} not found in phaserResourceHashes.`);
    }

    // 返回格式化後的版本號
    return `${urlWithoutQuery}?${hash ?? ''}`;
  }
}
