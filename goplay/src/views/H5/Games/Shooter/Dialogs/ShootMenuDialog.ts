import MuteIcon from '@/views/H5/Scripts/Components/UI/MuteIcon';
import UIDialog from '../../../Scripts/Components/UIDialog';
import ShooterGameScene from '../Scenes/ShooterGameScene';

export default class ShootMenuDialog extends UIDialog {
  /** 遊戲場景 */
  public declare scene: ShooterGameScene;

  protected setUI(): void {
    // 設置音訊開關按鈕
    this.addImage('', this.width * 0.95, this.height * 0.9, '', MuteIcon);
  }
}
