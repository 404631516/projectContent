<template>
  <div ref="pointlists" class="pointlist-wrapper">
    <ol>
      <li v-for="(item, index) in planetList" :key="index">
        <div class="flex-row point-box">
          <template>
            <div
              v-if="item.isOpen"
              @click.self="onClickPlanetName(item)"
              class="w-10vw cursor-pointer relative <lg:w-15vw <sm:w-30vw"
            >
              <!-- 好友進度 -->
              <div class="friend-pos" v-show="item.userFriends.length > 0">
                <FriendBox
                  :friendList="item.userFriends"
                  :friendsBoxBg="{
                    backgroundImage: `url(${imgData.friendsBox})`,
                  }"
                />
              </div>
              <img class="w-full" :src="item.planetBg" @click.self="onClickPlanetName(item)" />
              <div class="w-full">
                <div
                  @click.self="onClickPlanetName(item)"
                  class="relative"
                  p="0.5vw"
                  bg="[#00000042]"
                  border="rounded-20px"
                >
                  {{ item.levelName }}
                </div>
                <StarBox v-if="item.learnLid !== -1" m="t-1.5" :starCount="item.starCount" />
              </div>
            </div>
            <!-- 未解鎖 -->
            <div v-else>
              <div class="w-10vw cursor-pointer relative <lg:w-15vw <sm:w-30vw" @click.self="onClickPlanetName(item)">
                <!-- 好友進度 -->
                <div class="friend-pos" v-show="item.userFriends.length > 0">
                  <FriendBox
                    :friendList="item.userFriends"
                    :friendsBoxBg="{
                      backgroundImage: `url(${imgData.friendsBox})`,
                    }"
                  />
                </div>
                <img class="w-full" :src="item.planetBg" />
                <!-- 未解鎖圖示 -->
                <img class="point-lock-bg" :src="imgData.planetMask" @click.self="onClickPlanetName(item)" />
              </div>
              <div class="w-full">
                <div
                  @click.self="onClickPlanetName(item)"
                  class="relative"
                  p="0.5vw"
                  bg="[#00000042]"
                  border="rounded-20px"
                >
                  {{ item.levelName }}
                </div>
                <StarBox m="t-1.5" :starCount="item.starCount" />
              </div>
            </div>
          </template>
        </div>
      </li>
    </ol>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import StarBox from '@/components/PlanetWar/_Props/StarList.vue';
import ImgPath from '@/config/imgPath/imgPath';
import FriendBox from '@/components/PlanetWar/_Props/FriendBox.vue';
import { PlanetListInfo } from '@/helper/interface/PlanetWar';

@Component({
  components: {
    StarBox,
    FriendBox,
  },
})
export default class PointList extends Vue {
  /** 星球清單 */
  @Prop(Array) private planetList!: PlanetListInfo[];

  /** 圖片資料 */
  private imgData = {
    planetMask: ImgPath.planetMaskBaseUrl,
    friendsBox: ImgPath.friendUrl,
  };

  /** 點擊星球名稱
   * @param data 星球資料
   */
  private onClickPlanetName(data: PlanetListInfo): void {
    if (!data.isOpen) {
      return;
    }

    this.onClickPlanet(data);
  }

  /** 點擊星球
   * @param data
   */
  @Emit('onClickPlanet')
  private onClickPlanet(data: PlanetListInfo): void {
    return;
  }
}
</script>
<style lang="scss">
.pointlist-wrapper {
  ol {
    padding: calc(27% - 2vw) 0;
    li {
      width: 100%;
      height: auto;
      color: #fff;
      &:nth-child(2n + 1) {
        .point-box {
          justify-content: flex-end;
        }
      }
      &:last-child {
        margin-bottom: 8vw;
      }
      .point-box {
        position: relative;
        padding: 0 15vw;
        .point-bg {
          cursor: pointer;
          position: relative;
          width: 10vw;
          height: 14vw;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          .unlocked-box {
            position: absolute;
            z-index: 3;
            top: 0;
            width: 100%;
            height: 18vh;
            .mask-locked {
              width: 3vw;
              height: 3vw;
              background-size: contain !important;
              background-repeat: no-repeat !important;
            }
          }
        }
      }
      .point-lock-bg {
        position: absolute;
        top: 2vw;
        left: 2.5vw;
        z-index: 3;
        width: 5vw;
        height: 5vw;
        background-size: contain !important;
        background-repeat: no-repeat !important;
      }
    }
  }
}

@media (max-width: 768.1px) {
  .pointlist-wrapper {
    ol {
      li {
        .point-lock-bg {
          width: 10vw;
          height: 10vw;
          top: 2vw;
          left: 2.5vw;
        }
      }
    }
  }
}

@media (max-width: 640px) {
  .pointlist-wrapper {
    ol {
      li {
        &:last-child {
          margin-bottom: 30vh;
        }
        .point-lock-bg {
          width: 10vw;
          height: 10vw;
          top: 9vw;
          left: 10vw;
        }
      }
    }
  }
}
</style>
