import Fish from './Fish';
import { Scene } from 'phaser';
import { MinMax } from '@/views/H5/Helper/PhaserHelper';
import { FishingNumber, FishingString } from '../Data/FishingConfig';
import { FishingFishData, FishingSettingData, FishingItemData, FishingWaveData } from '@/manager/TableManager';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import FileHelper from '@/views/H5/Helper/FileHelper';
import SoundPool from '../../Common/SoundPool';

export default class FishPool {
  //#region readonly
  /** 傾盆大魚，波數間隔 */
  private readonly dropInterval = 100;
  /** 傾盆大魚，每波生產的數量 */
  private readonly amountPerDrop = 2;
  /** 傾盆大魚，魚生成的位置Y */
  private readonly dropPositionY = -32;
  /** 物件池數量限制 */
  private readonly poolMaximun = 200;
  /** 一般情況下，魚生成位置Y的範圍 */
  private readonly minMaxSpawnY: MinMax = {
    min: FishingNumber.SeaLevel + 25,
    max: FishingNumber.SeaLevel + FishingNumber.SeaHeight,
  };
  //#endregion

  /** 魚種參數 */
  private fishDataList!: FishingFishData[];

  //#region variable and properties
  /** 魚掙扎音效 */
  private fishJumpSoundPool?: SoundPool;
  /** 魚掉落音效 */
  private fishDropSoundPool?: SoundPool;

  /** 總持續時間 */
  private _totalDuration: number = 0;
  public get totalDuration(): number {
    return this._totalDuration;
  }

  /** 傾盆大魚模式 */
  private _isDropMode: boolean = false;
  public get isDropMode(): boolean {
    return this._isDropMode;
  }

  /** 魚群物件池 */
  private _group!: Phaser.Physics.Arcade.Group;
  public get group(): Phaser.Physics.Arcade.Group {
    return this._group;
  }

  /** 活躍在場景中的魚群 */
  public get aliveFishes(): Fish[] {
    return this.group.getMatching('visible', true);
  }

  /** 遊戲場景 */
  private get scene(): Scene {
    return this.group.scene;
  }
  //#endregion

  constructor(scene: Scene, fishDatas: FishingFishData[]) {
    this.fishDataList = fishDatas;

    this._group = scene.physics.add.group({
      defaultKey: this.fishDataList[0].nameKey,
      maxSize: this.poolMaximun,
      classType: Fish,
      runChildUpdate: true,
    });

    // 設置事件
    this.setRecycleFishesEvent();

    // 設置音效
    this.fishJumpSoundPool = new SoundPool(this.scene, FishingString.AudioFishJump);
    this.fishDropSoundPool = new SoundPool(this.scene, FishingString.AudioFishDrop);
  }

  /** 魚池開始運作
   * @param fishingSettingData 遊戲參數
   * @param fishingWaveDatas 波數參數
   */
  public active(fishingSettingData: FishingSettingData, fishingWaveDatas: FishingWaveData[]): void {
    this._totalDuration = 0;
    for (const data of fishingWaveDatas) {
      // 設置該波數的timeEvent
      this.scene.time.addEvent({
        delay: this._totalDuration * 1000,
        callback: () => {
          this.setSpawnFishEvent(data, data.duration * 1000);
        },
      });

      // 累加記數
      this._totalDuration += data.duration + data.delayAfterFinish;
    }
  }

  //#region  timeEvent
  /** 設置生成魚的事件 */
  private setSpawnFishEvent(data: FishingWaveData, waveDurationMs: number): void {
    const delayTime = 1000 / data.amountPerSecond;
    const timer = this.scene.time.addEvent({
      // 間隔 = 1秒/每秒生成數量
      delay: delayTime,
      callback: () => {
        const fish: Fish = this.group.get(
          // 產生在最左或最右
          this.scene.game.canvas.width * Phaser.Math.Between(0, 1),
          // 限制在海的高度範圍
          Phaser.Math.Between(this.minMaxSpawnY.min, this.minMaxSpawnY.max)
        );

        // 從可能出現的種類表中獲取魚資料
        const fishData = this.generateRandomFishData(data.appearTypeList);
        if (fishData === undefined) {
          return;
        }

        // 以游動狀態生成魚
        fish.swim(fishData, data.speedMultiply);
      },
      // 重複次數 = 時長 / 間隔 - 1
      repeat: waveDurationMs / delayTime - 1,
    });
  }

  /** 設置回收魚事件 */
  private setRecycleFishesEvent(): void {
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        for (const aliveFish of this.aliveFishes) {
          const distanceThreshold = aliveFish.width;
          const isFishOutOfBounds: boolean =
            aliveFish.x < 0 - distanceThreshold ||
            aliveFish.x > this.scene.game.canvas.width + distanceThreshold ||
            aliveFish.y > this.scene.game.canvas.width + distanceThreshold;

          // 如果整隻魚超出螢幕外，將魚隱藏
          if (isFishOutOfBounds) {
            aliveFish.idle();
          }
        }
      },
      repeat: -1,
    });
  }
  //#endregion

  //#region 操控
  /** 開啟傾盆大魚模式 */
  public async drop(itemData: FishingItemData): Promise<void> {
    // 播放音效
    this.fishDropSoundPool?.play();
    this._isDropMode = true;

    // 間隔 = 1秒/每秒生成數量
    const timeEvent = this.group.scene.time.addEvent({
      delay: this.dropInterval,
      callback: () => {
        for (let index = 0; index < this.amountPerDrop; index++) {
          const fish: Fish = this.group.get(
            // x隨機產生在任何位置
            this.group.scene.game.canvas.width * Math.random(),
            // y在螢幕最上方
            this.dropPositionY
          );

          // 從可能出現的種類表中獲取魚資料
          const fishData = this.generateRandomFishData(itemData.appearTypeList);
          if (fishData === undefined) {
            return;
          }

          // 以掉落狀態生成魚
          fish.drop(fishData);
        }

        // 最後一次TimeEvent
        if (timeEvent.getRepeatCount() === 0) {
          this._isDropMode = false;
          this.scene.time.removeEvent(timeEvent);
        }
      },
      // 重複次數 = 時長 / 間隔 - 1
      repeat: (itemData.duration * 1000) / this.dropInterval - 1,
    });

    // 等待事件完成
    await AsyncHelper.pendingUntil(() => timeEvent.getProgress() === 1);
  }

  /** 將躍出海面上的魚往上拋(掙扎)
   * @param seaLevel 海平面的高
   */
  public fishesJump(): void {
    let jumpFishCount: number = 0;
    for (const aliveFish of this.aliveFishes) {
      // 假如處於被抓捕，尚未"掙扎"
      if (aliveFish.isCaught && aliveFish.body.gravity.y === 0) {
        aliveFish.jump();
        jumpFishCount += 1;
      }
    }

    if (jumpFishCount > 0) {
      // 播放魚掙扎音效
      this.fishJumpSoundPool?.play();
    }
  }
  //#endregion

  //#region private function
  /** 隨機產生要生成的魚種id
   * @param appearTypeList 可出現的魚種類 ex: [0, 0, 1, 2]，0 出現的機率為 1/2。
   * @returns FishingFishData
   */
  private generateRandomFishData(appearTypeList: number[]): FishingFishData | undefined {
    // 隨機抽取魚種資料
    const fishId = Phaser.Math.RND.pick(appearTypeList);
    const fishData = this.fishDataList.find((value: FishingFishData) => value.id === fishId);

    if (fishData === undefined) {
      console.error(`可出現魚種設置錯誤，超出可生成的種類範圍。 appearTypeList: ${appearTypeList} `);
      return;
    }

    return fishData;
  }
  //#endregion
}
