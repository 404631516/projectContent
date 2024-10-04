import { OriginQuizData, QuizData } from '../NetProtocol/CommonStructure';

export default class QuestionManager {
  /** 題庫 */
  private questions: QuizData[] = [];

  /** 設定題庫
   * @param originQuestions 題庫
   */
  public init(originQuestions: OriginQuizData[]): void {
    // 格式轉換
    originQuestions.forEach((originQuizData) => {
      this.questions.push({
        qid: originQuizData.qid,
        questionMain: originQuizData.questionMain,
        questionSub: originQuizData.questionSub,
        options: {
          option1: originQuizData.option.answer,
          option2: originQuizData.option.option1,
          option3: originQuizData.option.option2,
          option4: originQuizData.option.option3,
        },
        quizSource: originQuizData.quizSource,
        seconds: originQuizData.seconds,
      });
    });
  }

  /** 題庫題目總數 */
  public getQuestionTotalCount(): number {
    return this.questions.length;
  }

  /** 取得題目
   * @param questionIndices 題目index array
   * @returns 所有對應index的題目
   */
  public getQuestions(questionIndices: number[]): QuizData[] {
    const rtn: QuizData[] = [];
    for (const questionIndex of questionIndices) {
      const question = this.questions[questionIndex];
      rtn.push({
        qid: question.qid,
        questionMain: question.questionMain,
        questionSub: question.questionSub,
        options: {
          option1: question.options.option1,
          option2: question.options.option2,
          option3: question.options.option3,
          option4: question.options.option4,
        },
        quizSource: question.quizSource,
        seconds: question.seconds,
      });
    }
    return rtn;
  }
}
