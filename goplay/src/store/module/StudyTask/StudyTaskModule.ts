import { ActionContext, ReturnGetters } from '@/types/store';
import { MultiDataTaskConditionType } from '@/hero-api/entity/base-task.entity';
import { HeroApiStudyTaskAPI } from '@/api/heroApiStudyTask';
import { StudyTaskRunning } from '@/hero-api/entity/study-task.entity';
import { AxiosRequestConfig } from 'axios';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import { MssrSimpleUserInfo } from '@/hero-api/module/mssr/bridge/dto/bridge-user.dto';

/** 要指派任務的學生列表 */
export interface AssignStudentsInfo {
  /** 年度 */
  year: number;
  /** 年級 */
  grade: number;
  /** 班級 */
  class: number;
  /** 學生列表 */
  studentList: MssrSimpleUserInfo[];
}

interface StudyTaskState {
  /** 任務條件UrlMap */
  readonly taskConditionUrlMap: Map<string, MultiDataTaskConditionType[]>;
  /** 進行中任務列表 */
  runningStudyTaskList: StudyTaskRunning[];
  /** 要指派任務的學生列表 */
  assignStudentsInfo: AssignStudentsInfo;
}

const moduleState: StudyTaskState = {
  /**
   * 任務條件UrlMap
   * key: `${url}-${method}`
   */
  taskConditionUrlMap: new Map<string, MultiDataTaskConditionType[]>([
    ['/contestWebGame-post', [MultiDataTaskConditionType.FinishMultiContestWebGame]],
  ]),

  /** 進行中任務列表 */
  runningStudyTaskList: [],

  /** 要指派任務的學生列表 */
  assignStudentsInfo: {
    year: -1,
    grade: -1,
    class: -1,
    studentList: [],
  },
};

const moduleGetters = {
  runningStudyTaskList: (state: StudyTaskState): StudyTaskRunning[] => state.runningStudyTaskList,
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 更新要指派任務的學生列表 */
  updateAssignStudentsInfo(state: StudyTaskState, assignStudentsInfo: AssignStudentsInfo): void {
    state.assignStudentsInfo = assignStudentsInfo;
  },
};

const actions = {
  /** 取得與指定Url相關的進行中任務Id列表
   * @param url 相關的Url
   * @returns 進行中任務Id列表
   */
  getUrlRelatedRunningStudyTaskIdList(
    context: ActionContext<StudyTaskState, Getters>,
    config: AxiosRequestConfig,
  ): number[] {
    const url = `${config.url ?? ''}-${config.method ?? ''}`;
    const taskConditionTypeList = context.state.taskConditionUrlMap.get(url);
    // 不相關的Url
    if (taskConditionTypeList === undefined) {
      return [];
    }

    // 相關，過濾出符合條件的任務
    const relatedRunningTaskList = context.state.runningStudyTaskList.filter((task) => {
      if (taskConditionTypeList.includes(task.multiDataTaskConditionType)) {
        try {
          const data = JSON.parse(config.data ?? '{}');
          const contestId: number = JSON.parse(data.contestId ?? '-1');
          const taskIds = JSON.parse(`[${task.multiDataTaskDataIds}]`) ?? [];
          // 比賽id相同
          if (taskIds.includes(contestId)) {
            return true;
          }
        } catch (e) {
          Helper.assert(ErrorId.VariableUndefined, '進行學習中任務資料解析失敗');
        }
      }

      return false;
    });

    // 返回Id列表
    return relatedRunningTaskList.map((task) => task.runningTaskUid);
  },

  /** 取得進行中任務列表 */
  async refreshRunningStudyTaskList(context: ActionContext<StudyTaskState, Getters>): Promise<StudyTaskRunning[]> {
    const response = await HeroApiStudyTaskAPI.getRunningTaskList();
    context.state.runningStudyTaskList = response.runningTaskList;
    return context.state.runningStudyTaskList;
  },

  /** 取得要指派任務的學生列表 */
  getAssignStudentsInfo(context: ActionContext<StudyTaskState, Getters>): AssignStudentsInfo {
    const assignStudentsInfo = context.state.assignStudentsInfo;
    // 清空
    context.state.assignStudentsInfo = {
      year: -1,
      grade: -1,
      class: -1,
      studentList: [],
    };

    return assignStudentsInfo;
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
