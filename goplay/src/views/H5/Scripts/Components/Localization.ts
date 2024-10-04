import i18n from '@/lang/i18n_ts';
import Config from '@/config/setting';

export default class Localization {
  // TODO 多國整合成一份json
  public static getText(keyType: LocalKeyType, key: string, params: string[] = []): string {
    const config = `${Config.lang}`;
    const lang = i18n.messages[config];
    const langData: any = JSON.parse(JSON.stringify(lang));

    // 檢查該語言是否有該多國資料
    if (false === langData.hasOwnProperty(keyType)) {
      return key;
    }

    // 檢查是否多國有對應的key
    if (false === langData[keyType].hasOwnProperty(key)) {
      return key;
    }

    if (params.length === 0) {
      return langData[keyType][key];
    }
    let str = langData[keyType][key];
    for (let i = 0; i < params.length; i++) {
      const reg = new RegExp('#' + i, 'g');
      str = str.replace(reg, params[i]);
    }
    return str;
  }
}

export enum LocalKeyType {
  Common = 'common',
}
