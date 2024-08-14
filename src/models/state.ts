import { Answer } from "./answer";

export interface State {
  correctGuesses: Array<string>;
  yesterdaysCorrectGuesses: Array<string>;
  todaysAnswers: Answer;
  yesterdaysAnswers: Answer;
}

export function emptyState() {
  return {
    correctGuesses: new Array<string>(),
    yesterdaysCorrectGuesses: new Array<string>(),
    todaysAnswers: {
      answers: new Array<string>(),
      availableLetters: "",
      middleLetter: "",
    } as Answer,
    yesterdaysAnswers: {
      answers: new Array<string>(),
      availableLetters: "",
      middleLetter: "",
    } as Answer,
  } as State;
}
