<template>
  <el-dialog :visible.sync="isShowDialog" top="6vh" :show-close="false" @close="onCloseMenu">
    <ul class="leading-8">
      <template v-for="menuData in menuList">
        <!-- 內部網址 -->
        <li v-if="menuData.type === MenuType.router" :key="menuData.name" @click.stop="onCloseMenu(menuData)">
          <router-link
            :class="isInRoute(menuData.link) ? 'text-[#EBB030]' : 'text-[#505050]'"
            font="bold"
            text="xl  hover:[#EBB030]"
            :to="menuData.link"
          >
            {{ menuData.name }}
          </router-link>
        </li>
        <!-- 外部網址 -->
        <li v-else-if="menuData.type === MenuType.link" :key="menuData.name" @click="onCloseMenu(menuData)">
          <a
            class="cursor-pointer"
            font="bold"
            text="xl [#505050] hover:[#EBB030]"
            target="_blank"
            :href="menuData.link"
          >
            {{ menuData.name }}
          </a>
        </li>
        <!-- 特殊(彈窗或登出) -->
        <li
          v-else-if="menuData.type === MenuType.dialog"
          :key="menuData.name"
          @click="
            onCheckDialog(menuData.name);
            onCloseMenu(menuData);
          "
        >
          <button class="cursor-pointer" font="bold" text="xl [#505050] hover:[#EBB030]">
            {{ menuData.name }}
          </button>
        </li>
        <!-- 子目錄 -->
        <li
          v-else-if="menuData.type === MenuType.subDirectory"
          :key="menuData.name"
          @click="onOpenSubdirectory($event, menuData)"
        >
          <button
            class="cursor-pointer block w-full"
            font="bold"
            text="xl [#505050] hover:[#EBB030] left"
            ref="subDirectory"
            aria-describedby="tooltip"
          >
            {{ menuData.name }}
            <i class="el-icon-arrow-right pointer-events-none" font="!black"></i>
          </button>
        </li>
      </template>
      <ul v-show="isShowDirectory" ref="directory" class="w-20rem" p="y-1.5rem x-1rem" bg="[#FFF]">
        <template v-for="childrenMenu in onFilterMenuList(childrenMenuList)">
          <!-- 內部網址 -->
          <li v-if="childrenMenu.type === MenuType.router" :key="childrenMenu.name" @click="onCloseMenu(childrenMenu)">
            <router-link
              :class="isInRoute(childrenMenu.link) ? 'text-[#EBB030]' : 'text-[#505050]'"
              font="bold"
              text="xl  hover:[#EBB030]"
              :to="childrenMenu.link"
            >
              {{ childrenMenu.name }}
            </router-link>
          </li>
          <!-- 外部網址 -->
          <li
            v-else-if="childrenMenu.type === MenuType.link"
            :key="childrenMenu.name"
            @click="onCloseMenu(childrenMenu)"
          >
            <a
              class="cursor-pointer"
              font="bold"
              text="xl [#505050] hover:[#EBB030]"
              target="_blank"
              :href="childrenMenu.link"
            >
              {{ childrenMenu.name }}
            </a>
          </li>
          <!-- 特殊(彈窗或登出) -->
          <li
            v-else-if="childrenMenu.type === MenuType.dialog"
            :key="childrenMenu.name"
            @click="
              onCheckDialog(childrenMenu.name);
              onCloseMenu(childrenMenu);
            "
          >
            <button class="cursor-pointer" font="bold" text="xl [#505050] hover:[#EBB030]">
              {{ childrenMenu.name }}
            </button>
          </li>
        </template>
      </ul>
    </ul>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Emit, VModel, Ref } from 'vue-property-decorator';
import menuData from '@/data/menuData';
import { MenuWord, MenuType } from '@/helper/enum/MenuName';
import { MenuData } from '@/helper/interface/Index';
import { UserRole } from '@/helper/enum/Common';
import { Message } from 'element-ui';
import { createPopper, Instance } from '@popperjs/core';

@Component({
  components: {},
})
export default class MenuLeft extends Vue {
  /**Menu 開關 */
  @VModel({ type: Boolean }) isShowDialog!: boolean;
  /**子目錄 */
  @Ref('directory') readonly directory!: HTMLUListElement;
  /** Menu 類型 */
  private MenuType = MenuType;
  /**主目錄 */
  private menuList: MenuData[] = this.onFilterMenuList(menuData);
  /**子目錄 */
  private childrenMenuList: MenuData[] = [];
  /**子目錄開關 */
  private isShowDirectory: boolean = false;
  /**popper */
  private popper: Instance | undefined = undefined;

  /** 是否登入 */
  private get isLogin(): boolean {
    return this.$$store.getters.isLogin;
  }

  /** 整理出要顯示的 Menu
   * @param menu
   */
  private onFilterMenuList(menu: MenuData[]): MenuData[] {
    return menu.filter((menuItem) => {
      // 不需要權限的都顯示
      if (menuItem.userRole.includes(UserRole.None)) {
        return true;
      }
      // 判斷是否符合權限
      return menuItem.userRole.includes(this.$$store.getters.userAuthority);
    });
  }

  /** 判斷當前頁路由
   * @param link 路由名稱
   */
  private isInRoute(link: string): boolean {
    return (
      this.$route.matched.find((routeData: { path: string }) => {
        return link === routeData.path;
      }) !== undefined
    );
  }

  /**關掉 Menu */
  private onCloseMenu(): void {
    this.isShowDirectory = false;
    this.popper = undefined;
    this.isShowDialog = false;
  }

  /**開關 popper
   * @param event 點擊事件
   * @param menuData 點擊目錄資料
   */
  private onOpenSubdirectory(event: PointerEvent, menu: MenuData) {
    if (this.popper?.state.elements.reference === event.target) {
      this.isShowDirectory = false;
      this.popper = undefined;
      return;
    }
    this.isShowDirectory = true;
    this.childrenMenuList = menu.children;
    this.popper = createPopper(event.target as Element, this.directory, {
      placement: 'right',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 30],
          },
        },
      ],
    });
  }

  /** 開啟Dialog
   * @param linkName
   */
  private onCheckDialog(linkName: string): void {
    switch (linkName) {
      // 登出
      case `${MenuWord.SignOut}`:
        this.onSignOut();
        break;
      // 代幣兌換
      case `${MenuWord.Exchange}`:
        this.openChangeCrystal();
        break;
      // 未知鏈接
      default:
        console.error(`未知鏈結: ${linkName}`);
        break;
    }
    return;
  }

  /** 登出 */
  private async onSignOut(): Promise<void> {
    try {
      // API 登出
      await this.$$store.dispatch('logout');
    } catch (e) {
      console.error(`${e}`);
      return;
    }

    // 登出成功提示
    Message.success('登出成功');

    // 返回首頁
    if (this.$route.name !== `${MenuWord.Home}`) {
      this.$router.push('/');
    }
    // 首頁重新整理
    else {
      location.reload();
    }
  }

  /** 開啟換晶球彈窗 */
  @Emit('openChangeCrystal')
  private openChangeCrystal(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  margin: 0 0 0 10px;
  width: 20rem;
  text-align: left;
}
::v-deep .el-dialog__header {
  padding: 0;
}
::v-deep .el-dialog__body {
  padding: 1.5rem 1rem;
}
</style>
