import { Scene } from 'phaser';
import UIDialog from '../Components/UIDialog';

export default class UIManager {
  /** singleton */
  private static _instance: UIManager;
  public static get instance(): UIManager {
    if (this._instance === undefined) {
      this._instance = new UIManager();
    }
    return this._instance;
  }

  /** 開啟的UIDialog管理 */
  private dialogMap: Map<string, UIDialog[]> = new Map<string, UIDialog[]>();

  /** update
   * @param time 遊戲時間
   * @param delta 幀間隔
   * @param scene 指定場景的dialog
   */
  update(scene: Scene, time: number, delta: number) {
    // 取得指定場景已開啟的UIDialog
    const dialogs = this.dialogMap.get(scene.sys.settings.key) ?? [];

    dialogs.forEach((dialog) => {
      dialog.update(time, delta);
    });
  }

  /** 開啟Dialog並加到遊戲場景
   * @param type
   * @param scene
   * @param fullscreen
   */
  public openDialog<T extends UIDialog>(type: new (scene: Scene) => T, scene: Scene, fullscreen: boolean = true): T {
    // 取得SceneKey
    const sceneKey = scene.sys.settings.key;

    // 取得指定場景已開啟的UIDialog
    const dialogs = this.dialogMap.get(sceneKey) ?? [];

    // 建立新UIDialog
    const dlg = new type(scene);
    dlg.initialize(fullscreen);
    dlg.on('destroy', () => {
      this.removeDialog(type, scene);
    });

    // 儲存UIDialog
    dialogs.push(dlg);
    this.dialogMap.set(sceneKey, dialogs);

    return dlg;
  }

  /** 確保Dialog有開啟
   * @param type
   * @param scene
   * @param fullscreen
   */
  public assureDialog<T extends UIDialog>(type: new (scene: Scene) => T, scene: Scene, fullscreen: boolean = true): T {
    // 使用已開啟Dialog
    const openDialog = this.getDialog(type, scene);
    if (openDialog !== undefined) {
      openDialog.fullscreen = fullscreen;
      return openDialog;
    }
    // 之前沒開過, 開一個新的
    else {
      return this.openDialog(type, scene);
    }
  }

  /** 取得場上Dialog
   * @param type
   * @param scene
   */
  public getDialog<T extends UIDialog>(type: new (scene: Scene) => T, scene: Scene): T | undefined {
    const dialogs = this.dialogMap.get(scene.sys.settings.key);
    if (dialogs === undefined) {
      return;
    }

    return dialogs.find((dlg) => dlg instanceof type) as T;
  }

  /** 關閉Dialog, 從管理清單中移除
   * @param type
   * @param scene
   */
  public closeDialog<T extends UIDialog>(type: new (scene: Scene) => T, scene: Scene): void {
    const dialog = this.removeDialog(type, scene);
    if (dialog !== undefined) {
      dialog.destroy();
    }
  }

  /** 移除Dialog
   * @param type
   * @param scene
   */
  private removeDialog<T extends UIDialog>(type: new (scene: Scene) => T, scene: Scene): UIDialog | undefined {
    const dialogs = this.dialogMap.get(scene.sys.settings.key);
    if (dialogs === undefined) {
      return;
    }

    const index = dialogs.findIndex((dlg) => dlg instanceof type);
    if (index > -1) {
      return dialogs.splice(index, 1)[0];
    }
  }
}
