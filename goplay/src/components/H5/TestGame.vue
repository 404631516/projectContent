<template>
  <div class="flex-pos flex-col">
    <div>
      <!-- 遊戲轉場 -->
      <template v-if="isShowTrans">
        <TransMsg :msgVisible="isShowTrans" :transType="TransStatus.ContinueAnswer" />
      </template>
    </div>
    <!-- Phaser遊戲 -->
    <div class="w-full flex justify-center items-center h-full" :id="containerId" />
  </div>
</template>
<script lang="ts">
import { TransStatus } from '@/helper/enum/AnswerGame';
import { TotalProps, ContestPlayerData } from '@/helper/interface/Game';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { IAnswerWeb } from '@/views/H5/Scripts/Components/StateMachine/AnswerGameFSM';
import { Component, Vue } from 'vue-property-decorator';
import {
  BaseGameStrategy,
  BejeweledGame,
  BomberManGame,
  HamsterGame,
  ParkourGame,
  PiggyGame,
  Puzzle2048Game,
  ShooterGame,
  SnakeGame,
  SpaceInvadersGame,
  TestGame,
  VerticalParkourGame,
} from '../../views/H5/Games/Common/PhaserGameStrategy';
import TransMsg from '@/components/H5/Dialog/TransMsg.vue';
import { HeroJ7GameType } from '@/helper/enum/Common';

@Component({
  components: {
    TransMsg,
  },
})
export default class TestGameWeb extends Vue implements IAnswerWeb {
  /** 遊戲座標 */
  private containerId = 'game-container';
  /** 測試遊戲 */
  private testGame?: BaseGameStrategy;

  private isShowTrans: boolean = false;
  /** 給Vue用於判別列舉類型 */
  private TransStatus = TransStatus;

  public isBossGame: boolean = false;

  private defaultGameData = {
    totalProps: [
      {
        id: 1,
        count: 99,
      },
      {
        id: 2,
        count: 99,
      },
      {
        id: 3,
        count: 99,
      },
      {
        id: 4,
        count: 99,
      },
    ],
    heroListData: {
      hid: 48385,
      heroId: 40106008,
      name: 'hero_8',
      url: 'chr_P08',
      totalExp: 0,
      level: 3,
      locked: false,
      online: true,
      attribute: 2,
      equipItemIds: [],
    },
  };

  async mounted() {
    // 取得url'/'後面的gameType
    const gameType = this.$route.params.gameType;
    // 轉換成HeroJ7GameType
    const heroJ7GameType = Number(gameType) as HeroJ7GameType;

    // 測試遊戲
    this.testGame = this.createTestGame(heroJ7GameType);
    this.testGame.startGame(this.containerId, this.$$store.getters.isMute);
  }

  private createTestGame(gametype?: HeroJ7GameType): BaseGameStrategy {
    switch (gametype) {
      case HeroJ7GameType.Hamster:
        return new HamsterGame(
          {
            totalProps: {
              defense: [
                {
                  id: 1000,
                  count: 99,
                },
              ],
              attack: [
                {
                  id: 1,
                  count: 99,
                },
                {
                  id: 2,
                  count: 99,
                },
                {
                  id: 3,
                  count: 99,
                },
                {
                  id: 4,
                  count: 99,
                },
              ],
            },
            heroListData: {
              hid: 48385,
              heroId: 40106008,
              name: 'hero_8',
              url: 'chr_P08',
              totalExp: 0,
              level: 3,
              locked: false,
              online: true,
              attribute: 2,
              equipItemIds: [],
            },
          },
          this,
          undefined,
        );
      case HeroJ7GameType.Bejeweled:
        return new BejeweledGame(
          {
            totalProps: [
              {
                id: 1,
                count: 99,
              },
              {
                id: 2,
                count: 99,
              },
              {
                id: 3,
                count: 99,
              },
              {
                id: 4,
                count: 99,
              },
            ],
            hid: 48385,
            bossId: 1,
            targetGems: 1000,
          },
          this,
          undefined,
        );
      case HeroJ7GameType.Parkour:
        return new ParkourGame(this.defaultGameData, this, undefined);
      case HeroJ7GameType.BomberMan:
        return new BomberManGame(this.defaultGameData, this, undefined);
      case HeroJ7GameType.Shooter:
        return new ShooterGame(this.defaultGameData, this, undefined);
      case HeroJ7GameType.Piggy:
        return new PiggyGame({
          totalProps: [
            {
              id: 3130201,
              count: 99,
            },
            {
              id: 3130211,
              count: 99,
            },
            {
              id: 3130231,
              count: 99,
            },
            {
              id: 3130241,
              count: 99,
            },
          ],
          heroListData: {
            hid: 48385,
            heroId: 40106008,
            name: 'hero_8',
            url: 'chr_P08',
            totalExp: 0,
            level: 3,
            locked: false,
            online: true,
            attribute: 2,
            equipItemIds: [],
          },
        }, this, undefined);
      case HeroJ7GameType.Snake:
        return new SnakeGame(this.defaultGameData, this, undefined);
      case HeroJ7GameType.VerticalParkour:
        return new VerticalParkourGame({
          totalProps: [
            {
              id: 1,
              count: 99,
            },
            {
              id: 3,
              count: 99,
            },
            {
              id: 5,
              count: 99,
            },
            {
              id: 7,
              count: 99,
            },
          ],
          heroListData: {
            hid: 48385,
            heroId: 40106008,
            name: 'hero_8',
            url: 'chr_P08',
            totalExp: 0,
            level: 3,
            locked: false,
            online: true,
            attribute: 2,
            equipItemIds: [],
          },
        }, this, undefined);
      case HeroJ7GameType.SpaceInvaders:
        return new SpaceInvadersGame({
          totalProps: [
            {
              id: 1,
              count: 99,
            },
            {
              id: 2,
              count: 99,
            },
            {
              id: 3,
              count: 99,
            },
            {
              id: 4,
              count: 99,
            },
            {
              id: 5,
              count: 99,
            },
          ],
          heroListData: {
            hid: 48385,
            heroId: 40106008,
            name: 'hero_8',
            url: 'chr_P08',
            totalExp: 0,
            level: 3,
            locked: false,
            online: true,
            attribute: 2,
            equipItemIds: [],
          },
        }, this, undefined);
      case HeroJ7GameType.Puzzle2048:
        return new Puzzle2048Game(this.defaultGameData, this, undefined);
      default:
        return new TestGame(this.defaultGameData, this, undefined);
    }
  }

  async onRevive(): Promise<TotalProps[]> {
    // 開啟轉場
    this.isShowTrans = true;

    // 等轉場表演結束
    await AsyncHelper.sleep(2);

    // 關閉轉場
    this.isShowTrans = false;

    // 回傳獎勵道具清單
    return [];
  }

  onResult(contestPlayerData: ContestPlayerData): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  destroyed() {
    this.testGame?.destroyGame();
  }
}
</script>
<style lang="scss" scoped></style>
