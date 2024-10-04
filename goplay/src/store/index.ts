import Vue from 'vue';
import Vuex from 'vuex';
import LoginModule from './module/Login/LoginModule';
import PlanetWarModule from './module/PlanetWar/PlanetWarModule';
import AnswerGameModule from './module/AnswerGame/AnswerGameModule';
import ContestModule from './module/Contest/ContestModule';
import HeroManagerModule from './module/HeroManager/HeroManagerModule';
import ImmediateRankModule from './module/ImmediateRank/ImmediateRankModule';
import AnswerPhaserGameModule from './module/AnswerPhaserGame/AnswerPhaserGameModule';
import BrickBreakerModule from './module/BrickBreaker/BrickBreakerModule';
import RoomModule from './module/Room/RoomModule';
import AdornmentModule from './module/Adornment/AdornmentModule';
import BackpackModule from './module/Backpack/BackpackModule';
import InterstellarForumModule from './module/InterstellarForum/InterstellarForumModule';
import HeroUniverseModule from './module/HeroUniverse/HeroUniverseModule';
import StudyTaskModule from './module/StudyTask/StudyTaskModule';

Vue.use(Vuex);

interface State {
  LoginModule: typeof LoginModule.state;
  PlanetWarModule: typeof PlanetWarModule.state;
  AnswerGameModule: typeof AnswerGameModule.state;
  ContestModule: typeof ContestModule.state;
  HeroManagerModule: typeof HeroManagerModule.state;
  ImmediateRankModule: typeof ImmediateRankModule.state;
  AnswerPhaserGameModule: typeof AnswerPhaserGameModule.state;
  BrickBreakerModule: typeof BrickBreakerModule.state;
  RoomModule: typeof RoomModule.state;
  AdornmentModule: typeof AdornmentModule.state;
  BackpackModule: typeof BackpackModule.state;
  InterstellarForumModule: typeof InterstellarForumModule.state;
  HeroUniverseModule: typeof HeroUniverseModule.state;
  StudyTaskModule: typeof StudyTaskModule.state;
}

// 提取所有 module 的 getter 函數類型對象
type GettersFuncs = typeof LoginModule.getters &
  typeof PlanetWarModule.getters &
  typeof AnswerGameModule.getters &
  typeof ContestModule.getters &
  typeof HeroManagerModule.getters &
  typeof ImmediateRankModule.getters &
  typeof AnswerPhaserGameModule.getters &
  typeof BrickBreakerModule.getters &
  typeof RoomModule.getters &
  typeof AdornmentModule.getters &
  typeof BackpackModule.getters &
  typeof InterstellarForumModule.getters &
  typeof HeroUniverseModule.getters &
  typeof StudyTaskModule.getters;

// 提取 mutation 函數類型
type CommitFuncs = typeof LoginModule.mutations &
  typeof PlanetWarModule.mutations &
  typeof AnswerGameModule.mutations &
  typeof ContestModule.mutations &
  typeof HeroManagerModule.mutations &
  typeof ImmediateRankModule.mutations &
  typeof AnswerPhaserGameModule.mutations &
  typeof BrickBreakerModule.mutations &
  typeof RoomModule.mutations &
  typeof AdornmentModule.mutations &
  typeof BackpackModule.mutations &
  typeof InterstellarForumModule.mutations &
  typeof HeroUniverseModule.mutations &
  typeof StudyTaskModule.mutations;

// dispatch 處理步驟同 commit
type DispatchFuncs = typeof LoginModule.actions &
  typeof PlanetWarModule.actions &
  typeof AnswerGameModule.actions &
  typeof ContestModule.actions &
  typeof HeroManagerModule.actions &
  typeof ImmediateRankModule.actions &
  typeof AnswerPhaserGameModule.actions &
  typeof BrickBreakerModule.actions &
  typeof RoomModule.actions &
  typeof AdornmentModule.actions &
  typeof BackpackModule.actions &
  typeof InterstellarForumModule.actions &
  typeof HeroUniverseModule.actions &
  typeof StudyTaskModule.actions;

const store = new Vuex.Store<State>({
  modules: {
    LoginModule,
    PlanetWarModule,
    AnswerGameModule,
    ContestModule,
    HeroManagerModule,
    ImmediateRankModule,
    AnswerPhaserGameModule,
    BrickBreakerModule,
    RoomModule,
    AdornmentModule,
    BackpackModule,
    InterstellarForumModule,
    HeroUniverseModule,
    StudyTaskModule,
  },
});
export default store;

// 將 getter 函數轉換成 {getterName: getterFuncsReturnType} 的對象類型
export type ReturnGetters<T extends { [key: string]: (...args: any) => any }> = {
  [P in keyof T]: ReturnType<T[P]>;
};
// 將 getter 轉換成對象
type Getters = ReturnGetters<GettersFuncs>;
// 將 mutation 函數名及 payload 類型轉換成 commit 函數的兩個入參類型
type Commit = <T extends keyof CommitFuncs>(type: T, payload?: Parameters<CommitFuncs[T]>[1]) => void;
type Dispatch = <T extends keyof DispatchFuncs>(type: T, payload?: Parameters<DispatchFuncs[T]>[1]) => Promise<any>;

// 其他 ts 文件解構導入時獲得每個對象的改造後類型
export const { state } = store;
export const { getters }: { getters: Getters } = store; // 定義 getters 的類型
export const { commit }: { commit: Commit } = store; // 定義 commit 的類型
export const { dispatch }: { dispatch: Dispatch } = store; // 定義 dispatch 的類型

// 導出類型 Store 以便在 Vue 原型上定義類型
export interface Store {
  state: State;
  getters: Getters;
  commit: Commit;
  dispatch: Dispatch;
}
