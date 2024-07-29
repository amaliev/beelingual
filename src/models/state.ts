import { Answer } from "./answer";

export interface State {
  correctGuesses: Set<string>;
  todaysAnswers: Answer;
  yesterdaysAnswers: Answer;
}

export function emptyState() {
  return {
    correctGuesses: new Set<string>(),
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
