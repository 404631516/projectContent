import { RankRuleType, ResponseState, TeamType } from '@/helper/enum/Common';
import {
  ContestDetailData,
  ContestPlayerRecord,
  ContestReferDetail,
  ContestListData,
} from '@/helper/interface/Contest';
import { ReturnGetters, ActionContext } from '@/types/store';
import { Message } from '@/helper/class/Common';
import { contestDetailAPI, contestScoreAPI } from '@/api/contest';
import { gameLinkInfoAPI, subjectUnitLearningLinkAPI } from '@/api/courseMenu';
import { handleAPIError } from '@/helper/fnc/common';
import { CourseData, CourseDetail, CourseNet } from '@/helper/interface/CourseMenu';

interface ContestState {
  /** 賽事詳細資料 */
  contestDetailData: ContestDetailData | null;
  /** 學習鏈結 */
  learningLink: string;
}

const moduleState: ContestState = {
  contestDetailData: null,
  learningLink: '',
};

const moduleGetters = {
  /** 取得賽事ID
   * @param state
   */
  contestId(state: ContestState): number {
    if (state.contestDetailData == null) {
      return -1;
    }

    return state.contestDetailData.contest.id;
  },

  /** 取得賽事排行類型
   * @param state
   */
  rankRuleType(state: ContestState): RankRuleType {
    return state.contestDetailData?.contest.rankRule ?? RankRuleType.Enableets;
  },

  /** 取得賽事排行類型
   * @param state
   */
  isBoss(state: ContestState): boolean {
    if (state.contestDetailData == null) {
      return false;
    }

    // 魔王賽賽事類型
    const bossTeamType: TeamType[] = [TeamType.WorldBoss, TeamType.AdlWorldBoss];

    return bossTeamType.includes(state.contestDetailData.contest.teamType);
  },

  /** 取得賽事科目資料
   * @param state
   */
  courseData(state: ContestState): CourseData {
    // 取得學習鏈結路徑
    const adlURL = new URL(`${state.learningLink}`);

    // 組成科目資料
    const courseData: CourseData = {
      courseName: state.contestDetailData?.contest.title ?? '',
      grade: adlURL.searchParams.get('grade') ?? '',
      subject: adlURL.searchParams.get('subjectG') ?? '',
    };

    // 返回科目資料
    return courseData;
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定賽事資訊
   * @param state
   * @param data
   */
  setContestDetailData(state: ContestState, data: ContestDetailData) {
    state.contestDetailData = data;
  },

  /** 設定賽事資訊
   * @param state
   * @param linkUrl
   */
  setLearningLink(state: ContestState, linkUrl: string) {
    state.learningLink = linkUrl;
  },
};

const actions = {
  /** 取得賽事資訊
   * @param context
   * @param newContestId
   */
  async getContestInfo(
    context: ActionContext<ContestState, Getters>,
    newContestId: string,
  ): Promise<ContestDetailData | undefined> {
    // 組成取得賽事資訊封包
    const data = {
      contestId: newContestId,
      extraOptions: {
        numberOfPlayer: true,
      },
    };

    try {
      // API 取得賽事資訊
      const response: any = await contestDetailAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 取得賽事資訊
      return response as ContestDetailData;
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 取得賽事紀錄
   * @param context
   */
  async getContestPlayerRecord(
    context: ActionContext<ContestState, Getters>,
    newContestId: number,
  ): Promise<ContestPlayerRecord | undefined> {
    // 組成取得取得賽事紀錄封包
    const data = {
      contestId: newContestId,
    };

    try {
      // API 取得賽事紀錄
      const response: any = await contestScoreAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      return response as ContestPlayerRecord;
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 取得學習鏈結
   * @param context
   */
  async getSubjectUnitLearningLink(
    context: ActionContext<ContestState, Getters>,
    contest: ContestListData,
  ): Promise<ContestReferDetail | undefined> {
    // 清空學習鏈結暫存
    context.commit('setLearningLink', '');

    // 非答題賽事自帶學習鏈結
    if (contest.teamType !== TeamType.WebGame) {
      return contest.referDetail == null ? undefined : JSON.parse(contest.referDetail.toString());
    }

    // 組成取得因材網知識點link資訊封包
    const data = {
      contestId: contest.id,
    };

    try {
      // API 取得因材網知識點link資訊
      const response: any = await subjectUnitLearningLinkAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 取得學習鏈結
      const learningLink: string = response.learningLink;

      // 儲存學習鏈結
      context.commit('setLearningLink', learningLink);

      // 組成學習鏈結資料
      const referData: ContestReferDetail = {
        btnText: '',
        btnUrl: learningLink,
        info: '',
      };

      // 返回學習鏈接
      return referData;
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 取得選擇單元資料
   *  @param context
   *  @param quizSetIds
   */
  async getCourseInfo(context: ActionContext<ContestState, Getters>, quizSetIds: string[]): Promise<CourseDetail[]> {
    // 組成封包
    const data = {
      gameLinkIds: quizSetIds,
    };

    try {
      // API 取得選擇單元資料
      const response: any = await gameLinkInfoAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      return quizSetIds.map<CourseDetail>((gameLinkId) => {
        const courseNet = response.gameLinkInfoMap[gameLinkId] as CourseNet;
        if (courseNet == null) {
          Message.error(`課程資料缺失，id=${gameLinkId}`);
          return {} as CourseDetail;
        }

        return {
          subjectId: courseNet.subject_groupings_id,
          gradeType: courseNet.grade,
          semester: Number(courseNet.semester.substr(-1)),
          publisher: {
            publisher_id: courseNet.publisher_id,
            publisher_name: courseNet.publisher_name,
          },
          course: {
            game_link_id: gameLinkId,
            subject_name: courseNet.subject_name,
            unit_name: courseNet.unit_name,
          },
        };
      });
    } catch (e) {
      Message.error(`${e}`);
      return [];
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
