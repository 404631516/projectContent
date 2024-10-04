import { GradeType, QuizSource, SemesterType, SubjectType } from '../enum/Common';

/** 課程資訊 */
export interface CourseData {
  /** 課程名稱 */
  courseName: string;
  /** 課程年級 */
  grade: string;
  /** 課程科目 */
  subject: string;
}

export interface Course {
  subject_groupings_id: number;
  subject_groupings_name: string;
  semester: string;
  subject_id: number;
  subject_name: string;
  sub_subject_id: number;
  sub_subject_name: string;
  publisher_id: number;
  publisher_name: string;
  grade: number;
  unit: number;
  unit_name: string;
  game_link_id: string;
}

/** 課程資訊 */
export interface GameDetail {
  /** 題目ID */
  game_link_id: string;
  /** 課綱名稱 */
  subject_name: string;
  /** 單元名稱 */
  unit_name: string;
}

/** 版本資料 */
export interface PublisherData {
  /** 版本ID */
  publisher_id: number;
  /** 版本名稱 */
  publisher_name: string;
}

/** 選擇課程資料 */
export interface CourseDetail {
  /** 選擇課程科目 */
  subjectId: SubjectType;
  /** 選擇課程年級 */
  gradeType: GradeType;
  /** 選擇課程學期 */
  semester: SemesterType;
  /** 選擇課程版本 */
  publisher: PublisherData;
  /** 選擇課程 */
  course: GameDetail;
}

/** API送出課程資料 */
export interface UseQuiz {
  /** 題庫來源 */
  source: QuizSource;
  /** 學習點連結編號 */
  quizSetIds: string[];
}

/** API回傳單元資料格式 */
export interface CourseNet {
  /** 年級 */
  grade: number;
  /** 版本編號 */
  publisher_id: number;
  /** 版本名稱 */
  publisher_name: string;
  /** 學年學期 */
  semester: string;
  /** 科目id */
  subject_groupings_id: number;
  /** 科目名稱 */
  subject_name: string;
  /** 單元名稱 */
  unit_name: string;
  /** 單元代碼 */
  game_link_id: string;
}
