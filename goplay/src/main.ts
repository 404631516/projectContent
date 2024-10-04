import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store, { Store } from './store/index';
import i18n from '@/lang/i18n'; // 引用 i18n多國語言
import 'windi.css';
import '@/utils/rem.js';
import '@/plugins/element.ts'; // 引入Element UI
import 'element-ui/lib/theme-chalk/index.css';
import Config from './config/setting';
import Cookies from 'js-cookie';
import VueGA from 'vue-gtag';
import lang from 'element-ui/lib/locale/lang/zh-TW';
import locale from 'element-ui/lib/locale';
import 'phaser';

locale.use(lang);

if (!Config.log) {
  if (!localStorage.getItem('console')) {
    console.log = () => {
      return;
    };
  }
}
Vue.config.productionTip = false;
Vue.config.devtools = false;

// /** 學創GA */
Vue.use(
  VueGA,
  {
    config: {
      id: 'UA-190994917-2',
      allowLinker: true,
    },
    includes: [
      { id: 'UA-108376301-1' }, // Adledu
      { id: 'G-DG3V5SPM34' }, // GA4
    ],
    globalObjectName: 'Enableets',
    params: {
      send_page_view: false,
    },
  },
  router
);

/** 因材網GA */
// Vue.use(VueGA, {
//   config: {
//     id: 'UA-108376301-1',
//     allowLinker: true
//   },
//   globalObjectName: 'Adledu',
//   params: {
//     send_page_view: false
//   }
// }, router);

const app = new Vue({
  i18n,
  router,
  store,
  render: (h) => h(App),
});

Vue.prototype.$cookie = Cookies;
Vue.prototype.$$store = app.$store;
app.$mount('#app');

declare module 'vue/types/vue' {
  interface Vue {
    $$store: Store;
  }
}
