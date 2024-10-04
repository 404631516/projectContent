import UIHelper from '@/views/H5/Helper/UIHelper';
import UIDialog from '../../../Scripts/Components/UIDialog';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { SpaceInvadersString } from '../Data/SpaceInvadersConfig';
import { BaseSceneString } from '@/views/H5/Scripts/Data/BaseSceneConfig';
import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import ScoreLayout from '@/views/H5/Scripts/Components/UI/ScoreLayout';
import SpaceInvadersGameScene from '../Scenes/SpaceInvadersGameScene';

export default class SpaceInvadersGuiDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: SpaceInvadersGameScene;

  //#region readonly
  /** 倒數計時 */
  private readonly countDownTime: number = 3;

  /** 遊戲準備文字Key */
  private readonly readyTextKey: string = 'ready';
  /** 遊戲準備文字風格 */
  private readonly readyTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '96px',
    color: UIHelper.yellowString,
  };
  /** 遊戲開始文字Key */
  private readonly startTextKey: string = 'start';
  //#endregion

  //#region 變數
  /** 分數顯示 */
  private scoreText!: Phaser.GameObjects.Text;
  /** 血量顯示 */
  healthImages: Phaser.GameObjects.Image[] = [];
  //#endregion

  protected setUI(): void {
    this.setUiCover();

    this.setScoreComponent();

    this.setTimerIcon();

    this.setMuteIcon();

    this.setHealth();
  }

  //#region 畫面顯示
  /** 顯示遊戲開始動畫 */
  public async showOpeningGameText(): Promise<void> {
    const sound = this.scene.sound.add(BaseSceneString.CountDownSound);
    sound.play('', { delay: 1 });
    await AnimationHelper.playOpeningCountDown(
      this,
      this.countDownTime,
      this.readyTextKey,
      this.startTextKey,
      this.readyTextStyle,
    );
  }
  //#endregion

  //#region 初始化
  /** 設定下方底板 */
  private setUiCover(): void {
    this.addImage(SpaceInvadersString.UiCover, this.width / 2, this.height - 64);
  }

  /** 設定分數元件 */
  private setScoreComponent(): void {
    const posY = this.height - 40;
    // 分數圖示
    this.addImage(SpaceInvadersString.IconScore, 50, posY);
    // '目標'文字
    this.addText('目標', 110, posY, { fontSize: '24px', color: UIHelper.whiteString });
    // 分數文字
    this.scoreText = this.addText('0 / 0', 196, posY, { fontSize: '24px', color: UIHelper.whiteString });
  }

  /** 設定計時器圖示, GuiDialog設定icon, 讀秒的UI則屬於TimerDialog所管 */
  private setTimerIcon(): void {
    this.addImage(BaseSceneString.TimerIcon, 364, this.height - 40);
  }

  /**設置音訊開關按鈕 */
  private setMuteIcon(): void {
    this.addImage('', this.width - 54, this.height - 54, '', MuteIcon);
  }

  private setHealth(): void {
    // 血量顯示高度
    const posY = this.height - 86;
    // 血量背景
    this.addImage(SpaceInvadersString.HpBg, 110, posY);
    // 血量圖示
    this.addImage(SpaceInvadersString.HpIcon, 60, posY);
    // 血量文字
    this.addText('剩餘血量', 130, posY, { fontSize: '24px', color: '#76CAFB' });
    // 血量圖案
    const defaultHealth = this.scene.gameSetting.playerDefaultHealth;
    this.healthImages = [];
    for (let i = 0; i < defaultHealth; i++) {
      const hpImg = this.addImage(SpaceInvadersString.PlayerHp, 230 + i * 40, posY);
      this.healthImages.push(hpImg);
    }
  }
  //#endregion

  //#region 更新數值
  /** 更新分數顯示
   * @param score 分數數值
   */
  public updateScoreCount(score: number, targetScore: number): void {
    this.scoreText.setText(`${score} / ${targetScore}`);
  }

  /** 更新血量顯示
   * @param health 血量數值
   */
  public updateHealthCount(health: number): void {
    // 血量圖案 show/hide
    for (let i = 0; i < this.healthImages.length; i++) {
      this.healthImages[i].setVisible(i < health);
    }
  }
  //#endregion
}
