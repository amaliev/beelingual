// https://stephanlangeveld.medium.com/simple-local-storage-implementation-using-vue-3-vueuse-and-pinia-with-zero-extra-lines-of-code-cb9ed2cce42a
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { differenceInDays, isSameDay } from "date-fns";
import { epoch, generateAnswerObjs, incrementDups } from "./utils";
import { Answer } from "./models/answer";
import { State, emptyState } from "./models/state";

const kStoreCurrentVersion = 1;

export const useMainStore = defineStore({
  id: "main",
  state: () => ({
    // language-specific state
    version: useStorage("version", kStoreCurrentVersion as number),
    language: useStorage("language", "de" as string),
    puzzleState: useStorage(
      "puzzleState",
      new Map<string, State>([
        ["de", emptyState()],
        ["en", emptyState()],
      ]) as Map<string, State>
    ),
    // shared state
    gameDate: useStorage("gameDate", epoch as Date),
    lastGameDate: useStorage("lastGameDate", new Date() as Date),
    theme: useStorage("theme", "light" as string),
    // don't need to be in local storage because they doesn't change
    pointsMessages: {
      1: "good",
      5: "nice",
      6: "great",
      7: "excellent",
      8: "amazing",
    } as { [key: number]: string },
  }),
  getters: {
    // TODO: move getMaxScore, getScoreLevels to state? compute once at startGame
    getMaxScore(): number {
      return this.getAnswers.reduce((acc: number, word: string): number => {
        // @ts-ignore issue with this ref? says .calculatePoints is undefined here but not outside arrow funcs
        return acc + this.calculatePoints({ word });
      }, 0);
    },
    getMinScore(): number {
      // 19 4-letter words @ 1 point each, 1 pangram @ min 14 points.
      const minNumWords = 20;
      return minNumWords - 1 + 14; // 33
    },
    getScoreLevels(): Array<number> {
      // TODO: fix tests, getMaxScore 50 should produce dups
      // difficulty levels
      const levels = [
        // return [
        0,
        5,
        Math.floor(this.getMaxScore * 0.1),
        Math.floor(this.getMaxScore * 0.2),
        Math.floor(this.getMaxScore * 0.3),
        Math.floor(this.getMaxScore * 0.4),
        Math.floor(this.getMaxScore * 0.5),
        Math.floor(this.getMaxScore * 0.55),
        Math.floor(this.getMaxScore * 0.6),
      ].sort((a, b) => a - b);
      const uniqueLevels = incrementDups(levels);
      const minUniqueLevel = Math.min(...uniqueLevels);
      // ensure there are never any 2 levels with the same points requirements.
      // ensure the first level is 0.
      return uniqueLevels.map((l: number) => l - minUniqueLevel);
    },
    // as getter so result can be cached
    getCorrectGuesses(): Array<string> {
      return this.puzzleState.get(this.language)!.correctGuesses;
    },
    getProgressIndex(): number {
      return (
        this.getScoreLevels.filter((v) => v <= this.getUserScore).length - 1
      );
    },
    getProgressPercentage(): number {
      const progressPercentages = [0, 20, 40, 50, 60, 70, 80, 90, 100];
      return progressPercentages[this.getProgressIndex];
    },
    getUserScore(): number {
      return this.getCorrectGuesses.reduce(
        (acc: number, word: string): number => {
          // @ts-ignore issue with this ref? says .calculatePoints is undefined here but not outside arrow funcs
          return acc + this.calculatePoints({ word });
        },
        0
      );
    },
    getColor(): string {
      return this.theme === "light" ? "white" : "#1c1b22";
    },
    getGameDate(): Date {
      return this.gameDate;
    },
    getGameDateString(): string {
      var date = this.gameDate.toISOString().split("T")[0];
      if (date.endsWith("08-06")) {
        date += " (Happy Birthday, Hannah! ❤️)";
      }
      return date;
    },
    getAnswers(): Array<string> {
      return this.puzzleState.get(this.language)!.todaysAnswers.answers;
    },
    getAvailableLetters(): string {
      return this.puzzleState.get(this.language)!.todaysAnswers
        .availableLetters;
    },
    getMiddleLetter(): string {
      return this.puzzleState.get(this.language)!.todaysAnswers.middleLetter;
    },
    getYesterdaysAnswers(): Answer {
      return this.puzzleState.get(this.language)!.yesterdaysAnswers;
    },
  },
  actions: {
    showMessage(args: object) {
      return ElMessage({
        duration: 2000,
        // change width? seems too wide in inspector but looks ok on device
        appendTo: "#app",
        customClass: "toast-message",
        grouping: true,
        showClose: true,
        ...args,
      });
    },
    submitGuess({ $t, guess }: { $t: Function; guess: string }) {
      const state = this.puzzleState.get(this.language)!;

      if (guess.length < 4) {
        return this.showMessage({
          message: $t("too short"),
        });
      }
      if (!guess.split("").includes(state.todaysAnswers.middleLetter)) {
        return this.showMessage({
          message: $t("missing middle letter"),
        });
      }
      if (!state.todaysAnswers.answers.includes(guess)) {
        return this.showMessage({
          message: $t("not in word list"),
        });
      }
      if (state.correctGuesses.includes(guess)) {
        return this.showMessage({
          message: $t("already found"),
        });
      }

      state.correctGuesses.push(guess);
      const points = this.calculatePoints({ word: guess });
      if (this.isPangram({ word: guess })) {
        this.showMessage({
          type: "success",
          message: `Pangram! +${points}`,
        });
      } else {
        this.showMessage({
          type: "success",
          message: this.generatePointsMessage({ $t, points }),
        });
      }
    },
    startGame({ allAnswers }: { allAnswers: Map<string, Array<Answer>> }) {
      const date = new Date();
      const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
      const edtTime = utcTime + (3600000 * -4);
      const now = new Date(edtTime);

      // Don't restart the game if it's the same day and the store version hasn't updated.
      if (
        isSameDay(this.gameDate, now) &&
        this.version == kStoreCurrentVersion
      ) {
        return false;
      }

      // set gameDate to clear guesses tomorrow
      this.gameDate = now;

      for (const lang of ["de", "en"]) {
        // new game so reset guesses
        this.puzzleState.get(lang)!.correctGuesses = new Array<string>();

        const { todaysAnswerObj, yesterdaysAnswerObj } = generateAnswerObjs({
          allAnswers: allAnswers.get(lang)!,
          gameDate: this.gameDate,
        });
        this.setYesterdaysAnswersAndLastGameDate({ yesterdaysAnswerObj, lang });

        // set yesterday and todays answers and letters
        const { answers, availableLetters, middleLetter } = todaysAnswerObj;

        this.puzzleState.get(lang)!.todaysAnswers.answers = answers;
        this.puzzleState.get(lang)!.todaysAnswers.availableLetters =
          availableLetters;
        this.puzzleState.get(lang)!.todaysAnswers.middleLetter = middleLetter;
      }
    },
    setYesterdaysAnswersAndLastGameDate({
      yesterdaysAnswerObj,
      lang,
    }: {
      yesterdaysAnswerObj: Answer;
      lang: string;
    }): string {
      // note: must be run after gameDate is set and before answers, availableLetters, and middleLetter are set!
      // the algorithm used to pick todays and yesterdays answers may change.
      // e.g. https://github.com/ConorSheehan1/spelling-bee/issues/3
      // bug where yesterdays answers were always incorrect at the first of the month.
      // to avoid this, use todays answers from local storage as yesterdays answers if gamedate was yesterday
      var trimmedGameDate = new Date(this.gameDate.toDateString());
      var trimmedLastGameDate = new Date(this.lastGameDate.toDateString());
      if (differenceInDays(trimmedGameDate, trimmedLastGameDate) === 1) {
        this.puzzleState.get(lang)!.yesterdaysAnswers.answers =
          this.puzzleState.get(lang)!.todaysAnswers.answers;
        this.puzzleState.get(lang)!.yesterdaysAnswers.availableLetters =
          this.puzzleState.get(lang)!.todaysAnswers.availableLetters;
        this.puzzleState.get(lang)!.yesterdaysAnswers.middleLetter =
          this.puzzleState.get(lang)!.todaysAnswers.middleLetter;
        return "local-storage-cache";
      } else {
        const {
          answers: yesterdaysAnswers,
          availableLetters: yesterdaysAvailableLetters,
          middleLetter: yesterdaysMiddleLetter,
        } = yesterdaysAnswerObj;
        this.puzzleState.get(lang)!.yesterdaysAnswers.answers =
          yesterdaysAnswers;
        this.puzzleState.get(lang)!.yesterdaysAnswers.availableLetters =
          yesterdaysAvailableLetters;
        this.puzzleState.get(lang)!.yesterdaysAnswers.middleLetter =
          yesterdaysMiddleLetter;
        this.lastGameDate = this.gameDate;
        return "cache-bust";
      }
    },
    calculatePoints({ word }: { word: string }): number {
      if (word.length === 4) return 1;
      if (this.isPangram({ word })) return word.length + 7;
      return word.length;
    },
    // If word has 7 unique letters, assume pangram. Handles case where it is a pangram from yesterday.
    isPangram({ word }: { word: string }): boolean {
      return new Set(word).size === 7;
    },
    // points per word, score is total of points.
    generatePointsMessage({
      $t,
      points,
    }: {
      $t: Function;
      points: number;
    }): string {
      const message = this.pointsMessages[points] || "awesome";
      return `${$t(`points.${message}`)}! +${points}`;
    },
    cellClassName({ row, columnIndex }: { row: any; columnIndex: number }) {
      const word = row[columnIndex + 1];
      if (word && this.isPangram({ word })) {
        return "pangram";
      }
    },
  },
});
