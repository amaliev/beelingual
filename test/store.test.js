import { setActivePinia, createPinia } from "pinia";
import { useMainStore } from "../src/store";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { Answer } from "../src/models/answer";

describe("Store", () => {
  let store;
  beforeEach(() => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia());
    store = useMainStore();
  });

  describe("getMaxScore", () => {
    it("gets the max score for a given set of words", () => {
      // test: 1, these: 5, three: 5, total: 11
      store.language = "en";
      store.puzzleState.get("en").todaysAnswers.answers = [
        "test",
        "these",
        "three",
      ];
      store.puzzleState.get("en").todaysAnswers.availableLetters = "dehorst";
      store.puzzleState.get("en").todaysAnswers.middleLetter = "t";
      expect(store.getMaxScore).to.equal(11);
    });
  });

  describe("getMinScore", () => {
    it("gets the static min score", () => {
      expect(store.getMinScore).to.equal(33);
    });
  });

  describe("startGame", () => {
    const allAnswersDe = [
      {
        answers: ["danke"],
        middleLetter: "d",
        availableLetters: "adeknmn",
      },
    ];
    const allAnswersEn = [
      {
        answers: ["error", "ooze", "otter"],
        middleLetter: "o",
        availableLetters: "eioprtz",
      },
      {
        answers: ["eels", "elegies", "elite"],
        middleLetter: "e",
        availableLetters: "egilrst",
      },
      {
        answers: ["felt", "feat", "feet"],
        middleLetter: "l",
        availableLetters: "aeflrst",
      },
    ];
    var allAnswers = new Map();
    allAnswers.set("de", allAnswersDe);
    allAnswers.set("en", allAnswersEn);
    describe("when today is the first of the month and a new game", () => {
      // had issue with incorrect state of yesterdays answers in the past.
      // converting date to int will cause yesterdays answers to be too far in the past.
      //  e.g. 2022-01-01 -> 20220101 but yesterdays answers should be 2021-12-31, but would be 20220100
      let gameDate;
      let gameDateString = "2222-02-01T12:00:00";
      beforeEach(() => {
        gameDate = new Date(gameDateString);
        vi.useFakeTimers();
        vi.setSystemTime(gameDate);
      });
      describe("when gameDate is a date", () => {
        it("should get todays and yesterdays answers correctly", () => {
          store.language = "en";
          store.startGame({ allAnswers });
          expect(store.getCorrectGuesses).toEqual([]);
          expect(store.getAnswers).toEqual(["felt", "feat", "feet"]);
          expect(store.getAvailableLetters).toEqual("aeflrst");
          expect(store.getMiddleLetter).toEqual("l");
          expect(store.getYesterdaysAnswers.answers).toEqual([
            "eels",
            "elegies",
            "elite",
          ]);
          expect(store.getYesterdaysAnswers.availableLetters).toEqual(
            "egilrst"
          );
          expect(store.getYesterdaysAnswers.middleLetter).toEqual("e");
          expect(store.getYesterdaysCorrectGuesses).toEqual([]);
        });
      });
      describe("when gameDate is a string", () => {
        it("should get todays and yesterdays answers correctly", () => {
          store.language = "en";
          store.gameDate = gameDateString;
          store.startGame({ allAnswers });
          expect(store.getCorrectGuesses).toEqual([]);
          expect(store.getAnswers).toEqual(["felt", "feat", "feet"]);
          expect(store.getAvailableLetters).toEqual("aeflrst");
          expect(store.getMiddleLetter).toEqual("l");
          expect(store.getYesterdaysAnswers.answers).toEqual([
            "eels",
            "elegies",
            "elite",
          ]);
          expect(store.getYesterdaysAnswers.availableLetters).toEqual(
            "egilrst"
          );
          expect(store.getYesterdaysAnswers.middleLetter).toEqual("e");
          expect(store.getYesterdaysCorrectGuesses).toEqual([]);
        });
      });
    });
    describe("when lastGameDate is yesterday", () => {
      let gameDate;
      let lastGameDate;
      beforeEach(() => {
        gameDate = new Date("2222-02-05T12:00:00");
        lastGameDate = new Date("2222-02-04T12:00:00");
        store.gameDate = lastGameDate;
        vi.useFakeTimers();
        vi.setSystemTime(gameDate);
      });
      it("should use the local storage cache to load yesterdaysAnswers", () => {
        store.language = "en";
        store.lastGameDate = lastGameDate;
        store.puzzleState.get("en").todaysAnswers.answers = [
          "test",
          "use",
          "cache",
        ];
        store.puzzleState.get("en").todaysAnswers.middleLetter = "e";
        store.puzzleState.get("en").todaysAnswers.availableLetters = "acehstu";
        store.puzzleState.get("en").correctGuesses = ["test", "use"];
        store.startGame({ allAnswers });
        expect(store.getCorrectGuesses).toEqual([]);
        expect(store.getAnswers).toEqual(["error", "ooze", "otter"]);
        expect(store.getAvailableLetters).toEqual("eioprtz");
        expect(store.getMiddleLetter).toEqual("o");
        expect(store.getYesterdaysAnswers.answers).toEqual([
          "test",
          "use",
          "cache",
        ]);
        expect(store.getYesterdaysAnswers.availableLetters).toEqual("acehstu");
        expect(store.getYesterdaysAnswers.middleLetter).toEqual("e");
        expect(store.getYesterdaysCorrectGuesses).toEqual(["test", "use"]);
      });
    });
    describe("when lastGameDate is not yesterday", () => {
      let gameDate;
      let lastGameDate;
      beforeEach(() => {
        gameDate = new Date("2222-02-05T12:00:00");
        lastGameDate = new Date("2222-02-03T12:00:00");
        store.gameDate = lastGameDate;
        vi.useFakeTimers();
        vi.setSystemTime(gameDate);
      });
      it("should not use the local storage cache to load yesterdaysAnswers", () => {
        store.language = "en";
        store.lastGameDate = lastGameDate;
        store.puzzleState.get("en").todaysAnswers.answers = [
          "test",
          "use",
          "cache",
        ];
        store.puzzleState.get("en").todaysAnswers.middleLetter = "e";
        store.puzzleState.get("en").todaysAnswers.availableLetters = "acehstu";
        store.puzzleState.get("en").correctGuesses = ["feat", "feet"];
        store.startGame({ allAnswers });
        expect(store.getCorrectGuesses).toEqual([]);
        expect(store.getAnswers).toEqual(["error", "ooze", "otter"]);
        expect(store.getAvailableLetters).toEqual("eioprtz");
        expect(store.getMiddleLetter).toEqual("o");
        // even though values are cached explicitly above,
        // because lastGameDate was not 1 day ago, we pull new values for yesterdaysAnswers
        expect(store.getYesterdaysAnswers.answers).toEqual([
          "felt",
          "feat",
          "feet",
        ]);
        expect(store.getYesterdaysAnswers.availableLetters).toEqual("aeflrst");
        expect(store.getYesterdaysAnswers.middleLetter).toEqual("l");
        expect(store.getYesterdaysCorrectGuesses).toEqual([]);
      });
    });
    describe("when today is not a new game", () => {
      let gameDate;
      let gameDateString = "2023-02-23T12:00:00";
      beforeEach(() => {
        gameDate = new Date(gameDateString);
        vi.useFakeTimers();
        vi.setSystemTime(gameDate);
      });
      describe("when gameDate is a date", () => {
        it("should exit early without setting up a new game", () => {
          store.language = "de";
          store.gameDate = gameDate;
          store.puzzleState.get("de").correctGuesses = ["test"];
          expect(store.getCorrectGuesses).toEqual(["test"]);
          // should exit early
          expect(store.startGame({ allAnswers })).toEqual(false);
          // answers should not be reset to []
          expect(store.getCorrectGuesses).toEqual(["test"]);
          expect(store.getYesterdaysCorrectGuesses).toEqual([]);
        });
      });
    });
  });

  // describe('getScoreLevels', () => {
  //   it('should get unique scores', () => {
  //     const store = useMainStore()
  //     const longestPuzzle = answers.reduce((prev, curr) => {
  //       return curr.answers.length > prev.answers.length ? curr : prev;
  //     })
  //     store.answers = longestPuzzle.answers
  //     const maxScore = store.getMaxScore;
  //     console.log(maxScore);
  //     for (let i = store.getMinScore; i < maxScore; i++) {
  //       // store.$patch({ getMaxScore: i });
  //       // store.getMaxScore = i;
  //       const useStore = defineStore('mainStore', {
  //         getters: {
  //           getMaxScore: () => i
  //         }
  //       })
  //       const pinia = createPinia()
  //       const store = useStore(pinia)

  //       const uniqueScoreLevels = new Set(store.getScoreLevels);

  //       if (i === 55) {
  //         console.log({ uniqueScoreLevels, getScoreLevels: store.getScoreLevels, getMaxScore: store.getMaxScore })
  //       }
  //       expect(store.getScoreLevels.length).to.equal(uniqueScoreLevels.size);
  //     }
  //   });
  // })
});
