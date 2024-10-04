import Vue from "vue";
import Cookies from 'js-cookie';

declare module "vue/types/vue" {
    interface Vue {
        $cookie: Cookies.CookiesStatic<any>;
    }
}