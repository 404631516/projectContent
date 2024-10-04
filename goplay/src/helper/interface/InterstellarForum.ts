import { QuizSource, GradeType } from '../enum/Common';

/** 星際論壇求助資訊 */
export interface ForumViewPostInfo {
  /** 留言資訊 */
  userPostCommentData: UserPostCommentData;
  /** 提問資訊 */
  userPostData: UserPostData;
}

/** 星際論壇作答留言資訊 */
export interface UserPostCommentData {
  /** 答案圖片路徑 */
  answerPic: string;
  /** 班級 */
  className: string;
  /** 留言文字 */
  content: CommentContentData;
  /** 留言時間 */
  createdAt: string;
  /** 年級 */
  gradeNum: GradeType;
  /** 留言是否刪除 */
  isDeleted: number;
  /** 讚數 */
  like: number;
  /** 留言者名稱 */
  name: string;
  /** 留言ID */
  postCommentId: number;
  /** 問題求助ID */
  postId: number;
  /** 封包回傳訊息 */
  resMessage: string;
  /** 封包回傳狀態 */
  result: string;
  /** 學校名稱 */
  schoolName: string;
  /** 留言者UID */
  uid: number;
  /** 更新時間 */
  updatedAt: string;
}

/** 星際論壇求助題目資訊 */
export interface UserPostData {
  /** ? */
  beFollowed: number;
  /** 最佳作答ID */
  bestCommentId: number;
  /** 班級ID */
  classId: number;
  /** 班級名稱 */
  className: string;
  /** ? */
  closeMsg: string;
  /** 留言數量 */
  commentCount: number;
  /** 求助文字 */
  content: string;
  /** 求助時間 */
  createdAt: string;
  /** 年級 */
  gradeNum: GradeType;
  /** 求助是否刪除 */
  isDeleted: number;
  /** 讚數 */
  like: number;
  /** 求助者名稱 */
  name: string;
  /** 求助ID */
  postId: number;
  /** ? */
  postSystem: number;
  /** ? */
  postTopicType: number;
  /** 題目資訊 */
  refer: ForumRefer;
  /** 學校ID */
  schoolId: number;
  /** 學校名稱 */
  schoolName: string;
  /** 科目ID */
  subjectNum: number;
  /** 知識點名稱 */
  title: string;
  /** 求助者ID */
  uid: number;
  /** 更新時間 */
  updatedAt: string;
}

/** 問題鏈結 */
export interface ForumRefer {
  /** 題庫ID */
  quizSource: QuizSource;
  /** 題目ID */
  qId: string;
  /** 賽事ID */
  contestId: number;
  /** 是否發放獎勵 */
  reward: boolean;
}

/** 因材網題目格式 */
export interface ForumQuestion {
  /** 學習鏈結 */
  learningLink: string;
  /** 題目URL */
  questionMain: string;
  /** 題目音訊URL */
  questionSub: string;
}

/** 作答留言資訊 */
export interface CommentContentData {
  /** 作答留言 */
  textId: string;
  /** 答案選項 */
  answerOption: number;
  /** 是否答對 */
  isCorrect: number;
  /** 年級 */
  gradeNum: GradeType;
  /** 科目 */
  subjectNum: number;
  /** 題目ID */
  qId: string;
  /** 題庫來源 */
  quizSource: QuizSource;
}

export interface ForumTable {
  serialNumber: number;
  grade: string;
  subject: string;
  questionsSource: string;
  questioner: string;
  solutionsNumber: number;
  questionTime: string;
  questionState: string;
  adleduUrl: string;
}

export interface MyForumTable {
  serialNumber: number;
  grade: string;
  subject: string;
  questionsSource: string;
  solutionsNumber: number;
  questionTime: string;
  questionState: string;
  adleduUrl: string;
}

export interface GiftContent {
  text: string;
  giftText: string;
  textColor: string;
  color: string;
}

export interface CorrentAnswerData {
  answerNum: number;
  student: string;
  studentClass: string;
  time: string;
  content: string;
  answerImg: string;
}

export interface PostData {
  quizSource: number;
  title: string;
  content: string;
  qId: string;
  subjectNum: number;
  contestId: number;
}
