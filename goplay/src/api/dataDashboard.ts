import {
  AdminOverviewDataResultDto,
  StudentOverviewDataResultDto,
  TeacherOverviewDataResultDto,
} from '@/hero-api/dto/data-dashboard-overview.dto';
import { fetchV2 } from './http-server';
import {
  AnswerBoxPlotDto,
  AnswerBoxPlotResultDto,
  AnswerRegressionAnalysisDto,
  AnswerRegressionAnalysisResultDto,
} from '@/hero-api/dto/data-dashboard.dto';
import { GetStudyTaskCompletionResultDto } from '@/hero-api/dto/study-task.dto';

/** 數據儀表板API */
export class DataDashboardAPI {
  /** 管理者取得數據儀表板總覽資料 */
  public static getAdminOverview(): Promise<AdminOverviewDataResultDto> {
    return fetchV2<AdminOverviewDataResultDto>(
      '/v2/data-dashboard-overview/get-admin-overview-data',
      {},
      new AdminOverviewDataResultDto(),
    );
  }

  /** 取得管理者數據儀表板迴歸分析 */
  public static getRegressionAnalysis(dto: AnswerRegressionAnalysisDto): Promise<AnswerRegressionAnalysisResultDto> {
    return fetchV2<AnswerRegressionAnalysisResultDto>(
      '/v2/data-dashboard/regression-analysis',
      dto,
      new AnswerRegressionAnalysisResultDto(),
    );
  }

  /** 教師取得數據儀表板總覽資料 */
  public static getTeacherOverview(): Promise<TeacherOverviewDataResultDto> {
    return fetchV2<TeacherOverviewDataResultDto>(
      '/v2/data-dashboard-overview/get-teacher-overview-data',
      {},
      new TeacherOverviewDataResultDto(),
    );
  }

  /** 取得箱型圖資料 */
  public static getBoxPlot(dto: AnswerBoxPlotDto): Promise<AnswerBoxPlotResultDto> {
    return fetchV2<AnswerBoxPlotResultDto>('/v2/data-dashboard/box-plot', dto, new AnswerBoxPlotResultDto());
  }

  /** 學生取得數據儀表板總覽(個人資訊雷達圖)資料 */
  public static getStudentOverview(): Promise<StudentOverviewDataResultDto> {
    return fetchV2<StudentOverviewDataResultDto>(
      '/v2/data-dashboard-overview/get-student-overview-data',
      {},
      new StudentOverviewDataResultDto(),
    );
  }

  /** 學生取得學習任務完成度(個人資訊雷達圖)資料 */
  public static getStudentStudyTaskCompletion(): Promise<GetStudyTaskCompletionResultDto> {
    return fetchV2<GetStudyTaskCompletionResultDto>(
      '/v2/study-task/get-student-study-task-completion',
      {},
      new GetStudyTaskCompletionResultDto(),
    );
  }
}
