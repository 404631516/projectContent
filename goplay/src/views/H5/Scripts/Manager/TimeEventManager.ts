import { TimeEvent } from './TimeEvent';

/** 時間軸加速倍數 */
export enum GameSpeed {
  Normal = 1,
  Fast = 2,
  SuperFast = 4,
}

/** 時間事件系統, 負責管理計時promise, 時間到了就resolve porimse */
export default class TimeEventManager {
  /** instance */
  // TODO 刪除instance, BaseGameScene內建TimeEventManager, 需要使用時直接呼叫scene.timeEventManager
  private static _instance: TimeEventManager;
  static get instance(): TimeEventManager {
    return this._instance;
  }

  /** 時間事件列表
   * 把時間事件依照時間先後排序
   * 每個frame跟時間事件列表的timeEvent做時間比對
   * 時間到了的timeEvent就pop出來執行時間事件
   */
  private timeEventList: TimeEvent[] = new Array();

  /** 當前時間, 遊戲開始到現在經過的時間(毫秒) */
  private currentTime: number = 0;

  /** 當前遊戲速度, 可調整遊戲時間加快或減慢 */
  private currentGameSpeed: GameSpeed = GameSpeed.Normal;

  public constructor() {
    TimeEventManager._instance = this;
  }

  /** 更新currentTime, 並執行時間到的timeEvent
   * @param deltaTime
   */
  public update(deltaTime: number): void {
    // 更新當前遊戲時間
    this.currentTime += deltaTime * this.currentGameSpeed;

    // 時間到的timeEvent數量
    let timeupEventCount = 0;
    // 檢查timeEvent.time, 執行時間到的timeEvent
    for (const timeEvent of this.timeEventList) {
      // timeEvent時間還沒到就break
      // 因為timeEvent有照時間排序, 所以後面的timeEvent也不用看了
      if (timeEvent.time > this.currentTime) {
        break;
      }
      // timeEvent時間到, 執行callback
      else {
        timeupEventCount++;
        // 完成時間事件, resolve promise
        timeEvent.resolve();
      }
    }

    // 都沒有時間到的timeEvent就直接return
    if (timeupEventCount === 0) {
      return;
    }

    // 把時間到的事件從清單中刪掉
    this.timeEventList.splice(0, timeupEventCount);
  }

  /** 新增TimeEvent, 放進timeEventList中, 並依時間先後排序
   * @param time 執行事件時間點(毫秒)
   */
  public newTimeEvent(time: number, callback: () => void): TimeEvent {
    const newTimeEvent = new TimeEvent(time, callback);
    // 丟到清單中, 並依時間排序
    this.timeEventList.push(newTimeEvent);
    this.timeEventList.sort((a, b) => a.time - b.time);
    return newTimeEvent;
  }

  /** 取得當前時間(遊戲開始後經過的時間) */
  public getTime(): number {
    return this.currentTime;
  }

  /** 設定遊戲速度 */
  public setGameSpeed(newGameSpeed: GameSpeed): void {
    this.currentGameSpeed = newGameSpeed;
  }

  /** 取得當前遊戲速度 */
  public getCurrentGameSpeed(): GameSpeed {
    return this.currentGameSpeed;
  }
}
