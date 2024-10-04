import UIDialog from '../../Scripts/Components/UIDialog';

export default class LoadingDialog extends UIDialog {
  private msg: string = 'Loading...';

  protected setUI(): void {
    // TODO 半透明遮罩, 目前createRectMask() 無作用
    // this.createRectMask(this.width, this.height, undefined, undefined, 0.5);
    this.addText(this.msg, this.width / 2, this.height / 2, {
      fontSize: '30px',
      color: '#FFFFFF',
    });
  }
}
