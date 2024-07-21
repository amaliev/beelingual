// This script adds missing words and removes offensive words from the original wordlists.

import { readFileSync, writeFileSync, readdir }  from "fs";

const fileToLowerCaseArray = (filePath: string): Array<any> => {
  const data = readFileSync(filePath);
  return data
    .toString()
    .split("\n")
    .map((s: string) => s.toLowerCase());
}

var langs : String[] = [];
readdir("./data/", (err, dirs) => {
  dirs.forEach(dir => {
    langs.push(dir);
  });
});

for (const lang in langs) {
  const originalWords = fileToLowerCaseArray("./data/"+lang+"/AllWords/importDict.txt");
  const removedWordsSet = new Set(fileToLowerCaseArray("./data/"+lang+"/AllWords/wordsRemoved.txt"));
  const addedWords = fileToLowerCaseArray("./data/"+lang+"/AllWords/wordsAdded.txt");

  const allWords = originalWords
    .concat(addedWords)
    .filter(word => !removedWordsSet.has(word))
    .sort();

  writeFileSync("./data/"+lang+"/AllWords.txt", allWords.join("\n"));
}