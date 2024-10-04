import UIDialog from '../../../Scripts/Components/UIDialog';

export default class BrickBreakerBackgroundDialog extends UIDialog {
  protected setUI(): void {
    // 背景使用單一色碼
    const backGroundColor = Phaser.Display.Color.HexStringToColor('251b0d').color;
    const rectangle = this.scene.add.rectangle(this.centerX, this.centerY, this.width, this.height, backGroundColor);
    this.add(rectangle);
  }
}
