import { TableItem } from '../json-table/json.table';

export class QuizQuestionTableItem extends TableItem {
  quizSetKey: string;

  questionId: number;

  question: string;

  answer: string;

  option1: string;

  option2: string;

  option3: string;

  seconds: number;

  difficult: number;

  url?: string;

  status: number;
}
