import { UserPagedResultDto } from '@/hero-api/dto/admin.dto';
import { fetchV2 } from './http-server';
import { ListDataDto, PagedResultDto } from '@/hero-api/dto/core.dto';
import { User } from '@/hero-api/entity/user.entity';
import { StudyTaskTeacherDeliveryLog } from '@/hero-api/entity/study-task.entity';
import {
  GetDeliveredTasksPagedResultDto,
  StudyGetCompletedTaskPagedResultDto,
  TaskCompletionRecord,
} from '@/hero-api/dto/study-task.dto';

/** 取得列表資料 */
export class HeroApiListDataAPI {
  private static getListData<T>(url: string, listDataDto: ListDataDto): Promise<PagedResultDto<T>> {
    return fetchV2<PagedResultDto<T>>(url, listDataDto, {
      page: -1,
      pageSize: -1,
      total: -1,
      entities: [],
      result: '',
    });
  }

  /** 取得使用者列表資料
   * @param listDataDto 帳號列表資料
   */
  public static getUserListData(listDataDto: ListDataDto): Promise<UserPagedResultDto> {
    return HeroApiListDataAPI.getListData<User>(`v2/admin/list-users`, listDataDto);
  }

  /**
   * 取得派發的學習任務列表資料
   * @param data 學習任務資料。
   */
  public static getDeliveredTaskListData(listDataDto: ListDataDto): Promise<GetDeliveredTasksPagedResultDto> {
    return HeroApiListDataAPI.getListData<StudyTaskTeacherDeliveryLog>(
      '/v2/study-task/list-delivered-tasks',
      listDataDto,
    );
  }

  /**
   * 學生取得已完成學習任務列表資料
   * @param listDataDto 學生已完成任務列表資料
   */
  public static studyGetCompletedTaskListData(listDataDto: ListDataDto): Promise<StudyGetCompletedTaskPagedResultDto> {
    return HeroApiListDataAPI.getListData<TaskCompletionRecord>('/v2/study-task/list-completed-tasks', listDataDto);
  }
}
