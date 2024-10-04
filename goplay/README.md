# goplay

## Project setup

版本請使用 Node 12

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### 線上測試

- .5 : https://enableets.chickenkiller.com:53334/

### answerTMP 答題組件

- :isOtherUI
- => false, true 判斷是否選項另外處理
  為 true 時父組件需加上

---

code (
<template v-slot:options="slotProps">

<div v-for="item in slotProps"
                    :key="item.id">
<!--作答選項-->
{{ item }}
</div>
</template>
)

---

- :answerClass
  - => 自定義 Class
- :gameList
  - => 綁定開局房間資訊
- @onNext
  - => 下一題

### FlashShop 組件

- :priceList
  - => [小遊戲名稱]道具價目表 [data/imgPriceData.ts] (對應參數名稱)
- :itemMoney
  - => 綁定對應[小遊戲名稱]獲取能量總金額
- @onBuytest
  - ＝> 綁定送出轉換後對應遊戲內道具參數

###### 備註:日後若有新的小遊戲須至[data/imgPriceData.ts] 添加參數(參考現有檔案)

### RandomTMP 組件

- :randomData => 為題目數長度
- :goodsData => 為抽道具資料[data/img/AwardData.ts] 可根據[小遊戲名稱]綁定對應資料
- @onClose => 綁定關閉後執行動作

###### 備註:日後若有新的小遊戲須至[data/img/AwardData.ts] 添加參數(參考現有檔案)

### Timer 組件

- :countDown => 是否為倒計時
- :isShowTime => 顯示文字開關
- :time => 預設起始值
- :onTimeUp => 綁定時間結束後執行動作

### 首頁(Index)相關組件

### 後續優化靜態表資料(最新消息內容)需統一使用 TableManager 引入

- [LatestNews](goplay/src/components/Profile/LatestNews.ts)：最新消息列表(目前讀 JSON 檔，之後可能會接 api)
- [NewsItemDialog](goplay/src/components/Profile/NewsItemDialog.ts)：最新消息內容彈窗
- [LearningAnalysisChart](goplay/src/components/Profile/NewsItemDialog.ts)：學情分析(尚未引入圖表)
- [RankingBoard](goplay/src/components/Profile/RankingBoard.ts)：排行榜(目前帶入假資料)

### 個人資訊(Profile)相關組件

### 後續優化靜態表資料(英雄解鎖積分表、英雄列表、英雄經驗值對照表)需統一使用 TableManager 引入

### 08/24UI 更動部分待調整: 1.星際大戰裝備頁面 2.英雄/砲塔屬性 icon 動態更換

- [BioWeaponDialog](goplay/src/components/Profile/BioWeaponDialog.ts)：生物兵器解鎖及駐列(駐列部分尚未完成)，與星球大戰共用此組件
- [ContestInfo](goplay/src/components/Profile/ContestInfo.ts):賽事及積分資訊(魔王賽場次、星球大戰總積分待補)
- [FirstHeroDialog](goplay/src/components/Profile/FirstHeroDialog.ts):英雄首抽，解鎖一隻英雄
- [HeroCardCarousel](goplay/src/components/Profile/HeroCardCarousel.ts):英雄資料輪播圖，英雄敘述及技能等可用 heroId 設定對應資料
- [HeroCardList](goplay/src/components/Profile/HeroCardList.ts):英雄牌卡列表，可以解鎖及更換上場英雄
- [HeroProgress](goplay/src/components/Profile/HeroProgresst.ts):英雄解鎖進度條，目前最多解鎖九隻英雄

### 消消樂(待整合)

- [BootScene](goplay/src/views/H5/Bejeweled/scenes/BootScene.ts)：載入圖片
- [GameScene](goplay/src/views/H5/Bejeweled/scenes/GameScene.ts)：遊戲功能
  - 遊戲初始參數:[gameData](goplay/src/views/H5/Bejeweled/gameData/game.ts)
    => gameData 資料來源: [BejeweledModules](goplay/src/store/H5/module/Bejeweled/BejeweledModules.ts)
  - 已套用新架構(UI): [InfoBox]、[TextDialog]，其餘待套用共用 UI 如: 能量值顯示、道具列表等。
  - 消除寶石(英雄方塊)兩種方式: 1.移動寶石 2.使用炸彈
  - 消除寶石步驟: 檢查寶石(matchInBoard)、預設空陣列(getDefaultMap)、標記符合三消規定寶石(markMatchesRow、markMatchesCol)、消除標記寶石(destroyGems)、掉落新寶石(makeGemsFall:上方寶石、replenishField:新寶石)
  - 遊戲結束條件: 時間倒數結束; 挑戰成功條件: 達成消除消除寶石目標(targetGems)

# Phaser 遊戲新增說明

## 資料夾路徑介紹

### [phaser 與 vue 共用的檔案路徑](goplay/src/manager)

- [TableManager](goplay/src/manager/TableManager.ts) : 統一管理網頁及遊戲所用到的靜態資料，靜態資料(josn)則統一放置在[此資料夾](goplay/src/table)
- [HeroManager](goplay/src/manager/HeroManager.ts): 提供英雄相關的資料以及 functions(不包含取得靜態資料)
- [WeaponManager](goplay/src/manager/WeaponManager.ts): 提供生物兵器相關的資料以及 functions(不包含取得靜態資料)

### [phaser 主要檔案路徑](goplay/src/views/H5)

- [遊戲底層的各項 Manager](goplay/src/views/H5/Scripts/Manager) => 這裡的 Manager 需要在[場景(BaseScene)中](goplay/src/views/H5/Scripts/Components/BaseScene.ts)建立 Singleton
  - [UIManager](goplay/src/views/H5/Scripts/Manager/UIManager.ts): 類似 Unity 的 UIManager，負責管理、開啟以及取得 Dialog
- [遊戲底層的元件](goplay/src/views/H5/Scripts/Components)

  - [ResourceData](goplay/src/views/H5/Scripts/Components/ResourceData.ts): 負責設定遊戲需載入的各項資源(圖片、動圖、json 等)
  - [BaseScene](goplay/src/views/H5/Scripts/Components/BaseScene.ts): 類似 Unity 的 MainScene，負責管理 Singleton，圖片、動圖、json 等資源載入，因此必須建立一個繼承[ResourceData](goplay/src/view/H5/Scripts/Components/ResourceData.ts)的腳本
  - [UIDialog](goplay/src/views/H5/Scripts/Components/UIDialog.ts): 類似 Unity 的 UIDialog
  - [Localization](goplay/src/views/H5/Scripts/Components/Localization.ts): 類似 Unity 的 Localization，負責多國語言
  - [Object2D](goplay/src/views/H5/Scripts/Component/Object2D.ts): 類似 Unity 的 GameObject，提供遊戲物件的父子層管理，新增 component
  - [Layout](goplay/src/views/H5/Scripts/Component/Layout.ts)、[HorizontalLayout](goplay/src/views/H5/Scripts/Component/HorizontalLayout.ts): 提供物件排版的功能(尚缺垂直排版)
  - [InfoBox](goplay/src/views/H5/Scripts/Component/InfoBox.ts): 彈跳視窗，用於系統警告或錯誤訊息
  - [Slider](goplay/src/views/H5/Scripts/Component/Slider.ts):滑動條或血量條的顯示

- [Helper](goplay/src/views/H5/Helper) => 放置共用的 helper 腳本

### [遊戲主要檔案路徑及必須添加的腳本](goplay/src/views/H5/Games)

- 資料夾放置腳本方式

  - (game name)
    - Components(放置遊戲元件)
    - Data
      - ResourceData.ts(繼承此腳本的資源概述，參考遊戲底層說明)
    - Dialogs
    - Helper
    - Scenes
      - BaseScene.ts(繼承此腳本的 Scene)
    - (建立 phaser game 的腳本)

- Phaser game 腳本範例

  import Phaser from 'phaser';
  import BootScene from './Scenes/BootScene'; (繼承 BaseScene.ts 的 Scene 腳本)
  import EntryScene from './Scenes/EntryScene';
  import GameScene from './Scenes/GameScene';

  // 設定遊戲場景
  function launch(containerId: any) {
  return new Phaser.Game({
  type: Phaser.AUTO, // WebGL or Canvas
  scale: {
  mode: Phaser.Scale.FIT,
  parent: containerId,
  width: 1024,
  height: 512
  },
  // 若要使用 scene.physic.add 必須加入 physics
  physics: {
  default: 'arcade', // arcade 代表以塊狀為單位
  arcade: {
  gravity: { y: 980 }, // 定義重力
  debug: false,
  },
  },

      // 必須包含一個繼承BaseScene的場景腳本
        scene: [BootScene, EntryScene, GameScene],
      });

  }

  export default launch;
  export { launch };

  - 繼承 BaseScene 的場景腳本只需要一個，並且需加入 constructor 結構，當使用 preload 時也須加入`super()`

    constructor()
    {
    super(); // 此處為建立各 Manager 的單例
    }

- 建立場景時繼承 BaseGameScene 的腳本，且必須定義與腳本相同名稱的 key

* game 與 VUE 溝通參數添加
  - store /module /[小遊戲名稱資料夾] ＝> [小遊戲名稱].ts(參考現有檔案)
  - store /index.ts(引入新添加資料夾)(參考現有檔案)
* scene 內使用方式
<!-- * store.state.[小遊戲名稱資料夾(index裡的命名)].[參數名稱] -->
* 引入 VUEX 注意
  - 需至 helper /interface /game.ts 添加 intreface [小遊戲 Modules] 型別 (參考現有檔案配置參數);
  - # 遊戲內 給於 store.state 對應 intreface 配置參數;
    ex:
    code (
    public store: GameStoreTower = store.state;
    // 使用方式
    this.store.TowerRoomModule.timer.open;
    )
    改變值方式
    ex:
    store.commit('onTimerType', 0);
    [onTimerType]的功能為在 store /module /[小遊戲資料夾內命名的功能](參考現有檔案配置參數)
    =======================
* 小遊戲路由配置
  - router => index.ts (參考現有檔案添加方式);
  - H5 / \_index.ts (參考現有檔案添加方式);
  - # lang / [所有語系]/ webgameName.json => 添加遊戲名稱

# QuickLink (Helper)

- 主要為常使用的導向連結(建議可以添加參數綁定個頁面)

### 新增遊戲方式(這部分可以再討論如何優化、簡化架構)

1.  src\helper\enum\Common.ts 新增 GameType:<br>
    為了跟後端的 GameType 對應，後端包含不只 Heroj7 的專案

2. src\helper\enum\Common.ts 新增 HeroJ7GameType、GameTypeName:<br>
    為了可以一次列出所有 HeroJ7 的遊戲

3.  src\helper\interface\Game.ts 新增 GameData、WebGameLog:<br>
    GameData 為遊戲客製資料，WebGameLog 為遊戲客製紀錄

4.  src\views\H5\Games\Common\AnswerGameStrategy.ts 新增 AnswerGame extends BaseAnswerGameStrategy:<br>
    BaseAnswerGameStrategy 類別寫的是有關答題階段的邏輯:<br>
    客製道具清單、失敗時的遊戲紀錄、遊戲資料的處理(答題階段)

5.  src\store\module\AnswerGame\AnswerGameModule.ts newAnswerGame 中新增處理方式:<br>
    依照 HeroJ7GameType 創建對應的答題(答題階段)

    * 因為沒辦法自動將 HeroJ7GameType 轉換成對應的答題階段，所以需要手動轉換

6.  src\views\H5\Games\Common\PhaserGameStrategy.ts 新增 Game extends AnswerGameStrategy:<br>
    AnswerGameStrategy 類別寫的是建立對應遊戲場景的邏輯(phaser 遊戲階段)

    * AnswerGameStrategy.ts 的 BaseAnswerGameStrategy 跟 PhaserGameStrategy.ts 的 AnswerGameStrategy 兩個類別沒有相關，是不同階段的邏輯

    * AnswerGameStrategy.ts 跟 PhaserGameStrategy.ts 的 AnswerGameStrategy 無關，只是名稱有點混淆，可以討論怎麼重新命名

    * 答題階段是指因材網題目，phaser 遊戲階段是指 phaser 遊戲

7.  src\store\module\AnswerPhaserGame\AnswerPhaserGameModule.ts 新增 GameState、SetGameData function、newAnswerPhaserGame 中新增處理方式:<br>
    依照 HeroJ7GameType 創建對應的小遊戲(phaser 遊戲階段)

    * 因為沒辦法自動將 HeroJ7GameType 轉換成對應的 phaser 遊戲階段，所以需要手動轉換

8.  src\views\H5\Helper\GameTypeHelper.ts 新增 gameTypeDataList

9.  src\config\imgPath\_contest.ts 新增 contestImgPath key, 以及對應路徑之圖片:

    * answer{遊戲名稱}Bg

    * gameHelp{遊戲名稱}Bg

    * gameHelp{遊戲名稱}2Bg
    
    * gameWheel{遊戲名稱}Img

# 因雄崛起 新增角色(有更新靜態表時都須跟 server 端進一步確認)

# 新增魔王角色

## 美術資料

### 全身像

a01\a10\2D\ingame\角色\敵方 -> queizweb_game\goplay\public\img\boss

### 頭像

a01\a10\2D\ingame\角色\Boss\_頭像 -> queizweb_game\goplay\public\img\boss

### Banner

a01\a10\2D\banner -> queizweb_game\goplay\src\assets\images\contest

### 卡片

a01\a10\2D\banner -> queizweb_game\goplay\src\assets\images\contest

## 企劃資料

queizweb_game\goplay\src\table\BossData.json

```
{
    "id": 程式填寫,
    "bossName": "問企劃名子",
    "bossNameKey": "程式填寫",
    "imgUrl": "程式填寫"
}
```

## 程式

### 取用魔王卡片(照命名規則取用路徑)

魔王挑戰選擇頁面: WorldGameCard.vue

### 取用魔王 Banner(照命名規則取用路徑)

魔王挑戰賽事資訊頁面: \_contestDetail.vue

### 取用魔王全身像(照命名規則取用路徑)

魔王挑戰賽事資訊頁面: BossBoard.vue
魔王挑戰小遊戲進行時: BossGameScene.ts
敲敲樂魔王元件: BrickBreakerBossComponent.ts
敲敲樂魔王資訊框: BrickBreakerGameDialog.ts

### 取用魔王頭像(照命名規則取用路徑)

敲敲樂魔王位置提示: BrickBreakerBossPositionHint.ts

# 新增敵方角色(目前只用到走路動畫)

## 美術資料

請參考 queizweb_game\goplay\public\img\enemy\enemy_P01

### Color0(enemy_P01_walk)

a01\a10\2D\ingame\角色\敵方\color0 -> queizweb_game\goplay\public\img\enemy

### ColorA(enemy_P01_walk_colorA)

a01\a10\2D\ingame\角色\敵方\colorA -> queizweb_game\goplay\public\img\enemy

### ColorB(enemy_P01_walk_colorB)

a01\a10\2D\ingame\角色\敵方\colorB -> queizweb_game\goplay\public\img\enemy\

## 企劃資料

小遊戲的敵人靜態表是分開的
DesignerDoc\AdlEdu 因雄崛起\ExcelFile\

- AntiTDEnemyData.xlsx
- BomberManEnemyData.xlsx
- DefenseEnemyData.xlsx

# 新增英雄角色

## 美術資料

請參考 Desktop\queizweb_game\goplay\public\img\hero\chr_P01

### Image

#### 一般(chr_P01)

a01\a10\2D\ingame\角色\我方 -> queizweb_game\goplay\public\img\hero

#### 卡牌(chr_P01_card)

a01\a10\2D\ingame\角色\逆塔防卡牌 -> queizweb_game\goplay\public\img\hero

#### 半身(chr_P01_half)

a01\a10\2D\ingame\角色\我方半身像 -> queizweb_game\goplay\public\img\hero

#### 大頭(chr_P01_head)

a01\a10\2D\ingame\角色\我方\_頭像 -> queizweb_game\goplay\public\img\hero

#### 首頁(chr_P01_home)

a01\a10\2D\ingame\角色\首頁頭像 -> queizweb_game\goplay\public\img\hero

#### 遊戲內 UI(chr_P01_ingame)

a01\a10\2D\ingame\角色\逆塔防 ingame -> queizweb_game\goplay\public\img\hero

#### 全身(chr_P01_full)

a01\a10\2D\ingame\角色\我方\crop -> queizweb_game\goplay\public\img\hero

#### Batch 程式參考

```
rem to chinese
chcp 65001
rem 複製美術頭像到hero專案，並改名
rem 用法: 請copy bat檔，再同一目錄貼上捷徑，開啟捷徑內容，在參數列輸入英雄id，再執行即可
set sourcePath=G:\a01\a10\2D\ingame\角色
set targetPath=.
set roldID=%1
@echo "roldID"=%roldID%
copy %sourcePath%\我方\chr_%roldID%.png chr_P%roldID%\chr_P%roldID%.png
copy %sourcePath%\我方\crop\chr_crop_%roldID%.png chr_P%roldID%\chr_P%roldID%_full.png
copy %sourcePath%\我方_頭像\chr_%roldID%.png chr_P%roldID%\chr_P%roldID%_head.png
copy %sourcePath%\我方半身像\chr_%roldID%_half.png chr_P%roldID%\chr_P%roldID%_half.png
copy %sourcePath%\首頁頭像\chr_%roldID%_home.png chr_P%roldID%\chr_P%roldID%_home.png
copy %sourcePath%\逆塔防ingame\chr_%roldID%_ingame.png chr_P%roldID%\chr_P%roldID%_ingame.png
copy %sourcePath%\逆塔防卡牌\card_chr_%roldID%.png chr_P%roldID%\chr_P%roldID%_card.png
pause
```

### Sprite

#### Idle 動畫(chr_P01_idle)

a01\a10\2D\ingame\角色動畫 -> queizweb_game\goplay\public\img\hero

#### Jump 動畫(chr_P01_jump)

a01\a10\2D\ingame\角色動畫 -> queizweb_game\goplay\public\img\hero

#### Run 動畫(chr_P01_run)

a01\a10\2D\ingame\角色動畫 -> queizweb_game\goplay\public\img\hero

#### Walk 動畫(chr_P01_walk)

a01\a10\2D\ingame\角色動畫 -> queizweb_game\goplay\public\img\hero

### Vue 專用 Image

#### 英雄資訊卡牌 For Vue(chr_P17)

a01\a10\2D\ingame\角色卡片 -> queizweb_game\goplay\src\assets\images\hero

## 企劃資料

DesignerDoc\AdlEdu 因雄崛起\ExcelFile\HeroData.xlsx

# 新增生物兵器

## 美術資料

### 塔

a01\a10\2D\ingame\塔防\_塔物件\生物塔\chr_xx\character -> queizweb_game\goplay\public\img\h5\defense\weapons

### 砲彈

a01\a10\2D\ingame\塔防\_塔物件\生物塔\chr_xx\bullet -> queizweb_game\goplay\public\img\h5\defense\bombs

## 企劃資料

DesignerDoc\AdlEdu 因雄崛起\ExcelFile\

- DefenseWeaponData.xlsx
- DefenseBombData.xlsx
  DesignerDoc\AdlEdu 因雄崛起\Location
- common.json
