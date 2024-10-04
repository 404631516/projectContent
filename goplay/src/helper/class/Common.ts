import { MessageBox } from 'element-ui';
import { Loading } from 'element-ui';
import { ElMessageBoxOptions } from 'element-ui/types/message-box';
import i18n from '@/lang/i18n_ts';
import Config from '@/config/setting';
import { ElLoadingComponent } from 'element-ui/types/loading';

export class Message {
  /** 警告
   * @param content 內容
   */
  public static warn(content: string) {
    const config = `${Config.lang}`;
    const lang = i18n.messages[config];
    const langData: any = JSON.parse(JSON.stringify(lang));
    const options: ElMessageBoxOptions = {
      type: 'warning',
      confirmButtonText: langData.common.confirm,
      cancelButtonText: langData.common.cancel,
      showClose: false,
      closeOnClickModal: false,
    };
    MessageBox.alert(content, langData.common.warning, options);
  }
  /** 訊息
   * @param content 內容
   */
  public static error(content: string) {
    const config = `${Config.lang}`;
    const lang = i18n.messages[config];
    const langData: any = JSON.parse(JSON.stringify(lang));
    const options: ElMessageBoxOptions = {
      type: 'error',
      confirmButtonText: langData.common.confirm,
      cancelButtonText: langData.common.cancel,
      showClose: false,
      closeOnClickModal: false,
    };
    MessageBox.alert(content, langData.common.errorMsg, options).finally(() => {
      // 確認後返回首頁
      window.location.assign(window.location.origin);
    });
  }
  /**
   * 成功
   * @param content 內容
   */
  public static success(content: string) {
    const config = `${Config.lang}`;
    const lang = i18n.messages[config];
    const langData: any = JSON.parse(JSON.stringify(lang));
    const options: ElMessageBoxOptions = {
      type: 'success',
      confirmButtonText: langData.common.confirm,
      cancelButtonText: langData.common.cancel,
      showClose: false,
      closeOnClickModal: false,
    };
    MessageBox.alert(content, langData.common.message, options);
  }
  /**一般
   * @param content 內容
   */
  public static info(content: string) {
    const config = `${Config.lang}`;
    const lang = i18n.messages[config];
    const langData: any = JSON.parse(JSON.stringify(lang));
    const options: ElMessageBoxOptions = {
      type: 'info',
      confirmButtonText: langData.common.confirm,
      cancelButtonText: langData.common.cancel,
      showClose: false,
      closeOnClickModal: false,
    };
    MessageBox.alert(content, langData.common.message, options);
  }
}

export class Load {
  /** Loadin物件 */
  private static loadingInstance?: ElLoadingComponent;

  /** 使用Loading
   * @param val
   */
  public static use(val: boolean) {
    // 開啟
    if (val) {
      // 已經開啟
      if (this.loadingInstance !== undefined) {
        return;
      }

      // 開啟新的Loading
      this.loadingInstance = Loading.service({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
        customClass: 'loading',
      });
    }
    // 關閉
    else {
      // 未開啟
      if (this.loadingInstance === undefined) {
        return;
      }

      // 關閉Loading
      this.loadingInstance.close();
      this.loadingInstance = undefined;
    }
  }
}
