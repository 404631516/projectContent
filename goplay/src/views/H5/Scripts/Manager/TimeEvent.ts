/** 時間事件 */
export class TimeEvent {
  /** 執行事件的時間點 */
  private _time: number;
  public get time(): number {
    return this._time;
  }
  /** 要執行的callback */
  private callback: () => void;
  /** 是否取消 */
  private isCancel: boolean = false;

  constructor(time: number, callback: () => void) {
    this._time = time;
    this.callback = callback;
  }

  /** 取消timeEvent, 時間到時不會執行callback */
  public cancel() {
    this.isCancel = true;
  }

  /** 執行callback */
  public resolve(): void {
    // 如果isCancel就不用執行
    if (this.isCancel) {
      return;
    }
    // 執行callback
    this.callback();
  }
}
