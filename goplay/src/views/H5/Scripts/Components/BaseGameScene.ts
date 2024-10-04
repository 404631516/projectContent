import { MessageBox } from 'element-ui';
import { ElMessageBoxOptions } from 'element-ui/types/message-box';
import { Scene } from 'phaser';
import TimerDialog from '../../Games/UIHelper/TimerDialog';
import { BaseSceneString } from '../Data/BaseSceneConfig';
import UIManager from '../Manager/UIManager';
import Localization, { LocalKeyType } from './Localization';

export default abstract class BaseGameScene extends Scene {
  //#region variable
  /** 計時器介面 */
  protected timerDialog?: TimerDialog;
  /** 背景音效 */
  private _bgm?: Phaser.Sound.BaseSound;
  public get bgm(): Phaser.Sound.BaseSound | undefined {
    if (this._bgm == null) {
      console.error('bgm不存在，請以BaseSceneString.BGM為key來載入背景音樂。');
    }
    return this._bgm;
  }
  //#endregion

  //#region 周邊功能
  /** 設置計時器Dialog
   * @param countDown 倒數秒數
   * @param depth 介面深度
   */
  protected setTimerDialog(countDown: number, depth: number): void {
    this.timerDialog = UIManager.instance.openDialog(TimerDialog, this);
    this.timerDialog.setDepth(depth);
    this.timerDialog.startCountdown(countDown);
    this.timerDialog.setScrollFactor(0);
  }

  /** 設置計時器Dialog事件
   * @param onTimerEnd 倒數結束時的callback
   * @param onTimerCountList 剩餘倒數的callback
   */
  protected setTimerEvent(onTimerEnd: () => void, onTimerCountList: Map<number, () => void>): void {
    if (this.timerDialog === undefined) {
      console.error('請先使用 setTimerDialog 初始化 TimerDialog');
      return;
    }

    this.timerDialog.setEvent(onTimerEnd, onTimerCountList);
  }
  //#endregion

  //#region Phaser
  /** 執行update統一要處理的事情，繼承的class請使用fixedUpdate來運作 */
  update(time: number, delta: number) {
    UIManager.instance.update(this, time, delta);
    this.fixedUpdate(time, delta);
  }

  /** 初始化遊戲
   * @param isMute
   */
  public initialize(isMute: boolean): void {
    // 設定聲音
    this.setMute(isMute);
    // 設置背景音樂
    this.setBGM();
    // 重置點擊
    this.resetPointer();
  }

  /** 設定是否靜音
   * @param isMute
   */
  public setMute(isMute: boolean): void {
    // 根據外部網頁當時的設定決定是否要靜音
    this.game.sound.mute = isMute;
  }

  /** 設置背景音樂 */
  private setBGM(): void {
    // 沒有音樂資源時不載入
    if (this.load.cacheManager.audio.exists(BaseSceneString.BGM) === false) {
      return;
    }
    // 設置
    this._bgm = this.game.sound.add(BaseSceneString.BGM);
    // 播放
    this._bgm.play({ loop: true });
  }

  /** 設置遊戲TimeScale
   * @caution
   * 請注意無法控制遊戲整體時間，因此使用update中的time、delta來操控的物件會保持原本速率。 ex: x += delta * speed;
   * 建議可使用 delta * this.time.timeScale 來同步速率。 ex: x += delta * this.time.timeScale * speed;
   * @caution
   * 請注意無法控制粒子特效時間，必須針對每一個使用到的ParticleEmitterManager去設置timeScale
   * @param scale 時間倍數
   */
  protected setTimeScale(scale: number): void {
    // tweens
    this.tweens.timeScale = scale;
    // anims
    this.anims.globalTimeScale = scale;
    // physics
    this.physics.world.timeScale = 1 / scale;
    // time events
    this.time.timeScale = scale;
  }

  /** 清除遊戲TimeScale
   * @caution
   * 請注意無法控制遊戲整體時間
   * @caution
   * 請注意無法控制粒子特效時間，必須針對每一個使用到的ParticleEmitterManager去清除
   */
  protected clearTimeScale(): void {
    // tweens
    this.tweens.timeScale = 1;
    // anims
    this.anims.globalTimeScale = 1;
    // physics
    this.physics.world.timeScale = 1;
    // time events
    this.time.timeScale = 1;
  }

  /** 移除所有Phaser事件(physic、time、tween) */
  protected removePhaserEvent(): void {
    // 移除物理事件
    this.physics.world.removeAllListeners();
    // 移除時間事件
    this.time.removeAllEvents();
    // 移除動畫事件
    this.tweens.killAll();
  }

  /** 暫停Phaser場景及事件 */
  public pauseScene(): void {
    // 暫停Phaser場景
    this.scene.pause();
  }

  /** 取消暫停Phaser場景及事件 */
  public resumeScene(): void {
    // 繼續Phaser場景
    this.scene.resume();
    // 重置點擊
    this.resetPointer();
  }

  /** 重置點擊
   * 防止ios在遊戲開啟前就點擊畫面不放，造成Phaser的Pointer錯亂
   * TODO: Phaser 3.55.2 內部 Bug，目前沒有更好解決方法
   */
  private resetPointer(): void {
    this.game.input.activePointer.active = false;
    this.game.input.addPointer();
  }
  //#endregion

  //#region other
  /** 使用直式螢幕提示視窗 */
  protected showOrientationMessage(): void {
    // 若是直式螢幕, 顯示提示視窗
    if (this.game.scale.orientation !== Phaser.Scale.Orientation.PORTRAIT) {
      return;
    }

    // 暫停Phaser場景及事件
    this.pauseScene();

    // 調整訊息樣式及功能
    const options: ElMessageBoxOptions = {
      type: 'warning',
      confirmButtonText: Localization.getText(LocalKeyType.Common, 'confirm'),
      center: false,
      showClose: false,
    };

    // 訊息: 請使用橫式螢幕，進行功能
    const message = `${Localization.getText(LocalKeyType.Common, 'phaserGameOrientationHint')}`;

    // 開啟訊息框
    MessageBox.alert(message, '', options).finally(() => {
      // 取消暫停Phaser場景及事件
      this.resumeScene();
    });
  }
  //#endregion

  /** 遊戲是否要結束 */
  public abstract get isGameEnd(): boolean;

  /** 繼承的class請使用fixedUpdatex來運作，不要複寫update */
  protected abstract fixedUpdate(time: number, delta: number): void;
}
