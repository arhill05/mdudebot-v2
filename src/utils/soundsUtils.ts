import path from "path";
import fs from "fs";
const SOUNDS_PATH = path.resolve(__dirname, "../sounds");
// import configUtils = require('./configUtils');

export async function getAvailableSounds() {
  const fileNames = (await readDirForPath(SOUNDS_PATH)).map(
    removeFileExtensions
  );

  return fileNames;
}

export function removeFileExtensions(fileName: string) {
  return fileName.split(".")[0];
}

export function formatFileNames(
  previousValue: any,
  currentValue: any,
  index: any,
  array: any
) {
  const fileNameWithPrefix = `\`%${currentValue}\``;

  const isLast = index === array.length - 1;
  if (!isLast) return `${previousValue}${fileNameWithPrefix}\n`;
  else return `${previousValue}${fileNameWithPrefix}`;
}

export function readDirForPath(directoryPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    });
  });
}

// function getVolume() {
//   return Number(configUtils.getConfigValue("volume")) / 100;
// }
