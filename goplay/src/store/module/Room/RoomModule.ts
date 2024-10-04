import { HeroJ7GameType, TeamType } from '@/helper/enum/Common';
import { MemberType, ServiceUserInfo } from '@/views/H5/Net/NetProtocol/CommonStructure';

interface RoomState {
  /** 登入資訊 */
  signUpToken: string;
  /** 遊戲類型 */
  gameType: HeroJ7GameType;
  /** 使用者參賽類型 */
  memberType: MemberType;
  /** 是否顯示等候室 */
  isShowWaitingRoom: boolean;
  /** 房間最大遊玩人數 */
  maxPlayerInRoom: number;
  /** 玩家列表 */
  contestPlayerList: ServiceUserInfo[];
  /** 遊戲開始倒數秒數 */
  gameStartCountDown: number;
  /** 組隊類型 */
  teamType: TeamType;
}

const moduleState: RoomState = {
  signUpToken: '',
  gameType: -1,
  memberType: -1,
  isShowWaitingRoom: false,
  maxPlayerInRoom: 0,
  contestPlayerList: [],
  gameStartCountDown: 0,
  teamType: -1,
};

const moduleGetters = {};

const mutations = {
  /** 設定登入資訊
   * @param state
   * @param contestRoomUserToken 登入Token
   */
  setRoomSignUpToken(state: RoomState, contestRoomUserToken: string) {
    state.signUpToken = contestRoomUserToken;
  },

  /** 設定組隊類別
   * @param state
   * @param teamType 組隊類型
   */
  setTeamType(state: RoomState, teamType: TeamType) {
    state.teamType = teamType;
  },

  /** 設定遊戲類型
   * @param state
   * @param playGameType 遊戲類型
   */
  setRoomGameType(state: RoomState, playGameType: HeroJ7GameType) {
    state.gameType = playGameType;
  },

  /** 設定使用者參賽類型
   * @param state
   * @param playerMemberType 使用者參賽類型
   */
  setRoomMemberType(state: RoomState, playerMemberType: MemberType) {
    state.memberType = playerMemberType;
  },

  /** 設定顯示等候室
   * @param state
   * @param isShow 是否顯示
   */
  setShowWaitingRoom(state: RoomState, isShow: boolean) {
    state.isShowWaitingRoom = isShow;
  },

  /** 設定房間最大遊玩人數
   * @param state
   * @param maxPlayerInRoom 最大遊玩人數
   */
  setMaxPlayerInRoom(state: RoomState, maxPlayerInRoom: number) {
    state.maxPlayerInRoom = maxPlayerInRoom;
  },

  /** 設定玩家列表
   * @param state
   * @param playerList 玩家列表
   */
  setContestPlayerList(state: RoomState, playerList: ServiceUserInfo[]) {
    state.contestPlayerList = playerList;
  },

  /** 設定倒數秒數
   * @param state
   * @param timeToGameStart 遊戲開始時間
   */
  setGameStartCountDown(state: RoomState, timeToGameStart: number) {
    state.gameStartCountDown = timeToGameStart - Date.now();
  },
};

const actions = {};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
