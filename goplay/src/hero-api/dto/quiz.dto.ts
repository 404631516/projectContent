import { ApiResOkBaseDto } from './api.dto';
import { QuizAnswerStatus, QuizQuestion, QuizSessionType, QuizSet, QuizType } from '../entity/quiz.entity';
import { PagedResultDto } from './core.dto';

/**
 * 代表一個問答題集的資料傳輸物件 (DTO)。
 */
export class QuizSetDto {
  /**
   * 問答題集的鍵，應該是一個字串。
   */
  key: string;

  /**
   * 問答題集的類型，應該是 QuizType 列舉的一個值。
   * 0: Default
   * 1: HeroUniverse
   */
  type: QuizType;
}

/**
 * 用於返回問題列表的資料傳輸物件 (DTO)。
 */
export class QuizQuestionsResultDto extends ApiResOkBaseDto {
  questions: QuizQuestion[];

  /**
   * 建構子，用於創建一個新的 QuizQuestionsResultDto 實例。
   * @param questions 問題列表。
   */
  constructor(questions: QuizQuestion[]) {
    super();
    this.questions = questions;
  }
}

/**
 * 用於返回分頁問題列表的資料傳輸物件 (DTO)。
 */
export class QuizQuestionPagedResultDto extends PagedResultDto<QuizQuestion> {
  declare entities: QuizQuestion[];
}

/**
 * 用於返回分頁問答題集列表的資料傳輸物件 (DTO)。
 */
export class QuizSetPagedResultDto extends PagedResultDto<QuizSet> {
  declare entities: QuizSet[];
}

/**
 * 問答題詳情
 */
export class QuestionDetails {
  question: string;
  options: string[];
  seconds: number;
}

/**
 * 問答題答案結果
 */
export class QuizAnswerResult {
  orderId: number;
  totalQuestions: number;
  score: number;
  totalScore: number;
  status: QuizAnswerStatus;
}

/**
 * 問答題開始請求類
 */
export class QuizStartDto {
  quizSetKey: string;

  quizType: QuizType;

  quizSessionType: QuizSessionType;

  numberOfQuestions: number;

  constructor(quizSetKey: string, quizType: QuizType, quizSessionType: QuizSessionType, numberOfQuestions: number) {
    this.quizSetKey = quizSetKey;
    this.quizType = quizType;
    this.quizSessionType = quizSessionType;
    this.numberOfQuestions = numberOfQuestions;
  }
}

/**
 * 問答題開始回應類
 */
export class QuizStartResultDto {
  sessionKey: string;
  totalQuestions: number;

  constructor(sessionKey: string, totalQuestions: number) {
    this.sessionKey = sessionKey;
    this.totalQuestions = totalQuestions;
  }
}

/**
 * 問答題答案和下一題請求類
 */
export class QuizAnswerAndNextDto {
  sessionKey: string;

  sessionType: QuizSessionType;

  /**
   * 選擇的選項(初始化取得題目,不判斷這個數值)
   *
   * 目前選項支援 1~4
   */
  selectedOption: number;

  constructor(sessionKey: string, sessionType: QuizSessionType, selectedOption: number) {
    this.sessionKey = sessionKey;
    this.sessionType = sessionType;
    this.selectedOption = selectedOption;
  }
}

/**
 * 問答題答案和下一題回應類
 */
export class QuizAnswerAndNextResultDto {
  nextQuestionDetails: QuestionDetails;
  answerResult: QuizAnswerResult;

  constructor(nextQuestionDetails: QuestionDetails, answerResult: QuizAnswerResult) {
    this.nextQuestionDetails = nextQuestionDetails;
    this.answerResult = answerResult;
  }
}

/**
 * 用於獲取問題的數據傳輸對象 (DTO)。
 */
export class GetQuestionDto {
  sessionKey: string;

  sessionType: QuizSessionType;

  constructor(sessionKey: string, sessionType: QuizSessionType) {
    this.sessionKey = sessionKey;
    this.sessionType = sessionType;
  }
}

/**
 * 獲取問題的結果數據傳輸對象 (DTO)。
 */
export class GetQuestionResultDto {
  currentQuestion: number;
  totalQuestions: number;
  questionDetails: QuestionDetails;

  constructor(questionDetails: QuestionDetails) {
    this.questionDetails = questionDetails;
  }
}

/**
 * 開始答題的數據傳輸對象 (DTO)。
 */
export class StartAnswerDto {
  sessionKey: string;

  sessionType: QuizSessionType;

  constructor(sessionKey: string, sessionType: QuizSessionType) {
    this.sessionKey = sessionKey;
    this.sessionType = sessionType;
  }
}

/**
 * 開始答題的結果數據傳輸對象 (DTO)。
 */
export class StartAnswerResultDto {
  currentQuestion: number;
  totalQuestions: number;

  constructor(totalQuestions: number, currentQuestion: number) {
    this.totalQuestions = totalQuestions;
    this.currentQuestion = currentQuestion;
  }
}

/**
 * 提交答案的數據傳輸對象 (DTO)。
 */
export class SubmitAnswerDto {
  sessionKey: string;

  sessionType: QuizSessionType;

  /**
   * 選中的選項
   *
   * 目前選項支援 1~4
   */
  selectedOption: number;

  constructor(sessionKey: string, sessionType: QuizSessionType, selectedOption: number) {
    this.sessionKey = sessionKey;
    this.sessionType = sessionType;
    this.selectedOption = selectedOption;
  }
}

/**
 * 提交答案的結果數據傳輸對象 (DTO)。
 */
export class SubmitAnswerResultDto {
  answerResult: QuizAnswerResult;

  constructor(answerResult: QuizAnswerResult) {
    this.answerResult = answerResult;
  }
}
