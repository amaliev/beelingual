// This script adds missing words and removes offensive words from the original wordlists.

import { readFileSync, writeFileSync, readdirSync } from "fs";

const fileToLowerCaseArray = (filePath: string): Array<any> => {
  const data = readFileSync(filePath);
  return data
    .toString()
    .split("\n")
    .map((s: string) => s.toLowerCase());
}

var langs: String[] = [];
const files = readdirSync("./data/", { withFileTypes: true });
for (const file of files) {
  if (file.isDirectory()) {
    langs.push(file.name);
  }
}

for (const lang of langs) {
  const originalWords = fileToLowerCaseArray("./data/" + lang + "/AllWords/importedDict.txt");
  const removedWordsSet = new Set(fileToLowerCaseArray("./data/" + lang + "/AllWords/wordsRemoved.txt"));
  const addedWords = fileToLowerCaseArray("./data/" + lang + "/AllWords/wordsAdded.txt");

  const allWordsWithDupes = originalWords
    .concat(addedWords)
    .filter(word => !removedWordsSet.has(word))
    .sort();
  const allWords = [...new Set(allWordsWithDupes)];

  writeFileSync("./data/" + lang + "/AllWords.txt", allWords.join("\n"));
}