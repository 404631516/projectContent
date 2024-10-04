import { MessageBox } from 'element-ui';
import { MessageType } from 'element-ui/types/message';
import { ElMessageBoxOptions } from 'element-ui/types/message-box';
import { Scene } from 'phaser';
import { AsyncHelper } from '../../Helper/AsyncHelper';
import Localization, { LocalKeyType } from './Localization';

/** InfoBox回應 */
export enum InfoBoxResponse {
  /** 沒有回應 */
  None = 'none',
  /** 確認 */
  Confirm = 'confirm',
  /** 取消 */
  Cancel = 'cancel',
}

/** 訊息的跳出視窗 */
export default class InfoBox {
  /** 冷卻緩衝，避免在關閉MessageBox的過程中再次開啟MessageBox(目前無法偵測MessageBox是否還在關閉過程中，finallly會先執行)
   * 會造成v-modal沒有被關閉(黑色遮罩)，永久顯示在網頁上，導致用戶不能做進一步的操作
   * 0.2秒為經測試過後的最低要求秒數 */
  private static readonly cooldownSec: number = 0.2;

  /** 避免兩個InfoBox互卡, 多個flag判斷 */
  public static isOpenMessageBox: boolean = false;

  /** 客製按鈕文字、樣式的訊息視窗
   * @param pauseScensList 要暫停的場景清單
   * @param message 訊息字串
   * @param confirmButtonText 確認按鈕字串
   * @param cancelButtonText 取消按鈕字串
   * @param confirmButtonClass 確認按鈕樣式類別
   * @returns 回傳操作後的結果：Response.Confirm || Response.Cancel，失敗時回傳 Response.None
   */
  public static async customMessage(
    pauseScensList: Scene[],
    message: string,
    title: string,
    confirmButtonText: string,
    cancelButtonText: string,
    confirmButtonClass: string,
  ): Promise<InfoBoxResponse> {
    return await this.message(pauseScensList, message, title, confirmButtonText, cancelButtonText, confirmButtonClass);
  }

  /** 預設訊息視窗
   * @param pauseScensList 要暫停的場景清單
   * @param message  訊息字串
   * @returns 回傳操作後的結果：Response.Confirm || Response.Cancel，失敗時回傳 Response.None
   */
  public static async defaultMessage(pauseScensList: Scene[], message: string): Promise<InfoBoxResponse> {
    return await this.message(
      pauseScensList,
      message,
      '',
      Localization.getText(LocalKeyType.Common, 'confirm'),
      Localization.getText(LocalKeyType.Common, 'cancel'),
      '',
    );
  }

  /** 開啟警告訊息
   * @param pauseScensList 要暫停的場景清單
   * @param message 訊息字串
   * @param title 標題字串
   */
  public static async warn(pauseScensList: Scene[], message: string, title: string = ''): Promise<void> {
    await this.alert(pauseScensList, message, 'warning', title);
  }

  /** 開啟錯誤訊息
   * @param pauseScensList 要暫停的場景清單
   * @param message 訊息字串
   * @param title 標題字串
   */
  public static async error(pauseScensList: Scene[], message: string, title: string = ''): Promise<void> {
    // 取得遊戲中所有場景
    await this.alert(pauseScensList, message, 'error', title);
  }

  /** 開啟確認訊息
   * @param pauseScensList 要暫停的場景清單(訊息跳出時暫停)
   * @param message 訊息字串
   * @param confirmButtonText 確認按鈕字串
   * @param cancelButtonText 取消按鈕字串
   * @param confirmButtonClass 確認按鈕樣式類別
   * @returns 回傳操作後的結果：Response.Confirm || Response.Cancel，失敗時回傳 Response.None
   */
  private static async message(
    pauseScensList: Scene[],
    message: string,
    title: string,
    confirmButtonText: string,
    cancelButtonText: string,
    confirmButtonClass: string,
  ): Promise<InfoBoxResponse> {
    // MessageBox 開啟回呼，創建 ElMessageBoxOptions
    const options = this.onOpenMessageBox(
      pauseScensList,
      'info',
      message,
      confirmButtonText,
      cancelButtonText,
      confirmButtonClass,
    );
    if (options === undefined) {
      return InfoBoxResponse.None;
    }

    // 開啟確認訊息並回傳
    return await MessageBox.confirm(message, title, options)
      .then((data: any) => {
        return InfoBoxResponse.Confirm;
      })
      .catch((e) => {
        return InfoBoxResponse.Cancel;
      })
      // MessageBox 關閉回呼
      .finally(() => this.onCloseMessageBox(pauseScensList));
  }

  /** 開啟警示訊息
   * @param pauseScensList 要暫停的場景清單(在alert期間會暫停)
   * @param message 訊息字串
   * @param messageType 訊息類別(warning || error)
   * @param title 標題字串
   */
  private static async alert(
    pauseScensList: Scene[],
    message: string,
    messageType: MessageType,
    title: string,
  ): Promise<void> {
    // MessageBox 開啟回呼，創建 ElMessageBoxOptions
    const options = this.onOpenMessageBox(
      pauseScensList,
      messageType,
      message,
      Localization.getText(LocalKeyType.Common, 'confirm'),
      '',
      '',
    );
    if (options === undefined) {
      return;
    }

    // 開啟訊息框 結束後 MessageBox 關閉回呼
    await MessageBox.alert(message, title, options).finally(() => this.onCloseMessageBox(pauseScensList));
  }

  /** MessageBox開啟回呼 創建 MessageBoxOptions，創建失敗時返回undefined
   * @param pauseScensList Phaser場景清單(在訊息開啟期間會暫停)
   * @param type 訊息類別(warning || error)
   * @param message 訊息字串
   * @param confirmButtonText 確認按鈕字串
   * @param cancelButtonText? 取消按鈕場景，若不需要請設置undefined
   * @param confirmButtonClass? 確認按鈕類別，若不需要請設置undefined
   * @returns MessageBoxOptions，失敗時返回undefined
   */
  private static onOpenMessageBox(
    pauseScensList: Scene[],
    type: MessageType,
    message: string,
    confirmButtonText: string,
    cancelButtonText: string,
    confirmButtonClass: string,
  ): ElMessageBoxOptions | undefined {
    // 防呆, 重複call到openMessageBox的情況
    if (this.isOpenMessageBox === true) {
      console.error('InfoBox.openMessageBox() error, MessageBox already opened! new msg = ' + message);
      return undefined;
    }
    // 標記開啟MessageBox
    this.isOpenMessageBox = true;

    // 暫停遊戲
    pauseScensList.forEach((scene: Scene) => {
      // 備註 scene.scene 應為 scene.scenePlugin，此處為Phaser命名不清
      const scenePlugin: Phaser.Scenes.ScenePlugin = scene.scene;
      scenePlugin.pause();
    });

    return {
      type,
      confirmButtonText,
      cancelButtonText,
      center: false,
      showClose: false,
      closeOnClickModal: false,
      confirmButtonClass,
    };
  }

  /** MessageBox關閉回呼
   * @param pauseScensList Phaser場景清單(訊息關閉後取消暫停)
   */
  private static async onCloseMessageBox(pauseScensList: Scene[]): Promise<void> {
    // 避免在關閉MessageBox的過程中再次開啟MessageBox(目前無法偵測MessageBox是否還在關閉過程中，finallly會先執行)
    // 會造成v-modal沒有被關閉(黑色遮罩)，永久顯示在網頁上，導致用戶不能做進一步的操作
    await AsyncHelper.sleep(this.cooldownSec);
    // 離開訊息框後繼續遊戲
    pauseScensList.forEach((scene: Scene) => {
      // 備註 scene.scene 應為 scene.scenePlugin，此處為Phaser命名不清
      const scenePlugin: Phaser.Scenes.ScenePlugin = scene.scene;
      scenePlugin.resume();
    });
    // 清除標記
    this.isOpenMessageBox = false;
  }
}
