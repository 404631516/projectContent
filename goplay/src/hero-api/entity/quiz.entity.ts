import { UserOwnedEntity, UserOwnedUpdateAtEntity } from './base.entity';

/**
 * 題庫狀態枚舉
 */
export enum QuizStatus {
  Closed = 0,
  Open = 1,
}

/**
 * 題庫類型枚舉
 */
export enum QuizType {
  Default = 0,
  HeroUniverse = 1,
}

/**
 * 題庫實體
 */
export class QuizSet extends UserOwnedUpdateAtEntity {
  /**
   * 題庫ID
   */
  id: number;

  /**
   * 題庫鍵值
   */
  key: string;

  /**
   * 題庫標題
   */
  title: string;

  /**
   * 題庫說明
   */
  description: string;

  /**
   * 題庫類型
   */
  type: QuizType;

  /**
   * 題庫狀態
   */
  status: QuizStatus;
}

/**
 * 題庫題目實體
 */
export class QuizQuestion extends UserOwnedUpdateAtEntity {
  /**
   * 題目ID
   */
  id: number;

  /**
   * 題庫ID
   */
  quizSetId: number;

  /**
   * 問題ID
   */
  questionId: number;

  /**
   * 問題內容
   */
  question: string;

  /**
   * 答案內容
   */
  answer: string;

  /**
   * 選項1
   */
  option1: string;

  /**
   * 選項2
   */
  option2: string;

  /**
   * 選項3
   */
  option3: string;

  /**
   * 時間限制（秒）
   */
  seconds: number;

  /**
   * 難度
   */
  difficult: number;

  /**
   * 圖片URL
   */
  url: string;

  /**
   * 題目狀態
   */
  status: number;

  /**
   * 題庫(列出所有題目才會用到)
   */
  quizSet: QuizSet;
}

export enum QuizSessionType {
  Default = 0,
  HeroUniverse = 1,
}

export enum QuizAnswerStatus {
  StartAnswer = -2,
  TimesUp = -1,
  NotAnswered = 0,
  Correct = 1,
  OptionOne = 2,
  OptionTwo = 3,
  OptionThree = 4,
}

/**
 * 答題會話實體。每個類別只能有一個會話。
 * 建立會話時，會隨機產生一個會話金鑰，用來識別會話。如果傳送錯誤的會話金鑰，會話將會失效。
 * 並且會根據需要的題數，由題庫隨機取出題目，並且根據題目順序生成答題嘗試。
 * 全部答題完成後，會話將會結束。對話會話的結束時間將會記錄。
 */
export class QuizSession extends UserOwnedEntity {
  id: number;

  type: QuizSessionType;

  dataId: number;

  sessionKey: string;

  currentOrderId: number;

  totalQuestions: number;

  totalScore: number;

  startTime: Date;

  finishTime: Date;
}

/**
 * 答題實體。每個QuizSession包含多個QuizSessionAnswer,並且依照題目順序進行答題。
 */
export class QuizSessionAnswer extends UserOwnedEntity {
  id: number;

  type: QuizSessionType;

  orderId: number;

  questionSetKey: string;

  questionPk: number;

  timeLimit: number;

  randomOptionOrder: number;

  status: QuizAnswerStatus;

  score: number;

  startTime: Date;

  answerTime: Date;
}

export class LogQuizSession extends UserOwnedEntity {
  id: number;

  type: QuizSessionType;

  dataId: number;

  sessionKey: string;

  totalQuestions: number;

  correctAnswersCount: number;

  incorrectAnswersCount: number;

  timesUpCount: number;

  totalDuration: number;

  totalScore: number;

  startTime: Date;

  finishTime: Date;
}

export class LogQuizSessionAnswer extends UserOwnedEntity {
  id: number;

  logQuizSessionId: number;

  sessionKey: string;

  type: QuizSessionType;

  orderId: number;

  questionSetKey: string;

  questionPk: number;

  status: QuizAnswerStatus;

  score: number;

  startTime: Date;

  answerTime: Date;

  duration: number;
}
