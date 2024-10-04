import Vue from 'vue';
import VueI18n from 'vue-i18n'; // 載入多國語言套件

// 載入自訂語言包
import zhTW from '@/lang/zh-TW/zh-TW'; // 繁中
import enUS from '@/lang/en-US/en-US'; // 英文
import zhCN from '@/lang/zh-CN/zh-CN'; // 簡中
import Config from '@/config/setting';
Vue.use(VueI18n); // 註冊多國套件

const locale = Config.lang; // 選擇語系
const messages = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'en-US': enUS,
};
const i18n = new VueI18n({
  locale,
  messages: { messages },
});
export default i18n.messages;
