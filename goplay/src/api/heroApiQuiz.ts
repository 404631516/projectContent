import {
  GetQuestionDto,
  GetQuestionResultDto,
  QuestionDetails,
  QuizAnswerAndNextDto,
  QuizAnswerAndNextResultDto,
  QuizAnswerResult,
  QuizStartDto,
  QuizStartResultDto,
  StartAnswerDto,
  StartAnswerResultDto,
  SubmitAnswerDto,
  SubmitAnswerResultDto,
} from '@/hero-api/dto/quiz.dto';
import { QuizSessionType, QuizType } from '@/hero-api/entity/quiz.entity';
import { fetchV2 } from './http-server';

export class HeroApiQuizAPI {
  /**
   * 開始測驗
   * @param quizSetKey 測驗集合Key
   * @param quizType 測驗類型
   * @param quizSessionType 測驗Session類型
   * @param numberOfQuestions 題數
   * @returns Promise<QuizStartResultDto>
   */
  public static startSession(
    quizSetKey: string,
    quizType: QuizType,
    quizSessionType: QuizSessionType,
    numberOfQuestions: number,
  ): Promise<QuizStartResultDto> {
    const dto = new QuizStartDto(quizSetKey, quizType, quizSessionType, numberOfQuestions);

    return fetchV2<QuizStartResultDto>('/v2/quiz-session/start-session', dto, new QuizStartResultDto('', 0));
  }

  /**
   * 回答測驗
   * @param sessionKey 測驗sessionKey
   * @param sessionType 測驗Session類型
   * @param selectedOption 選擇的選項
   * @returns Promise<QuizAnswerResult>
   */
  public static answerAndNext(
    sessionKey: string,
    sessionType: QuizSessionType,
    selectedOption: number,
  ): Promise<QuizAnswerAndNextResultDto> {
    const dto = new QuizAnswerAndNextDto(sessionKey, sessionType, selectedOption);

    return fetchV2<QuizAnswerAndNextResultDto>(
      '/v2/quiz-session/answer-and-next',
      dto,
      new QuizAnswerAndNextResultDto(new QuestionDetails(), new QuizAnswerResult()),
    );
  }

  /**
   * 取得測驗題目
   * @param sessionKey 測驗sessionKey
   * @param sessionType 測驗Session類型
   * @returns Promise<QuestionDetails> 題目
   */
  public static getQuestion(sessionKey: string, sessionType: QuizSessionType): Promise<GetQuestionResultDto> {
    const dto = new GetQuestionDto(sessionKey, sessionType);

    return fetchV2<GetQuestionResultDto>(
      '/v2//quiz-session/get-question',
      dto,
      new GetQuestionResultDto(new QuestionDetails()),
    );
  }

  /**
   * 開始回答問題
   * @param sessionKey 測驗sessionKey
   * @param sessionType 測驗Session類型
   * @returns Promise<StartAnswerResultDto>
   */
  public static startAnswer(sessionKey: string, sessionType: QuizSessionType): Promise<StartAnswerResultDto> {
    const dto = new StartAnswerDto(sessionKey, sessionType);

    return fetchV2<StartAnswerResultDto>('/v2/quiz-session/start-answer', dto, new StartAnswerResultDto(0, 0));
  }

  /**
   * 提交答案並獲取結果
   * @param sessionKey 測驗sessionKey
   * @param sessionType 測驗Session類型
   * @param selectedOption 選擇的選項
   * @returns Promise<SubmitAnswerResultDto>
   */
  public static submitAnswer(
    sessionKey: string,
    sessionType: QuizSessionType,
    selectedOption: number,
  ): Promise<SubmitAnswerResultDto> {
    const dto = new SubmitAnswerDto(sessionKey, sessionType, selectedOption);

    return fetchV2<SubmitAnswerResultDto>(
      '/v2/quiz-session/submit-answer',
      dto,
      new SubmitAnswerResultDto(new QuizAnswerResult()),
    );
  }
}
