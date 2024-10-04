import { Store as s } from '../store/index';

export { ReturnGetters } from '../store/index';
export interface Store extends s { }
export interface ActionContext<S, G> {
  dispatch: Store['dispatch']; // 全局的 dispatch, 有 ts 提示支持
  commit: Store['commit']; // 全局的 commit, 有 ts 提示支持
  state: S;
  getters: G;
  rootState: Store['state']; // 全局的 state, 有 ts 提示支持
  rootGetters: any; // 暫時還無法實現將全局 getter 定義過來，會出現類型循環引用問題
}
