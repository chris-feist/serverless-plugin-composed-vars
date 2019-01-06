const path = require('path');
const mixin = require('mixin-deep');

const SUPPORTED_FILE_TYPES = ['yml', 'yaml', 'json', 'js'];
const FILE_MATCH_REGEX = new RegExp(`^\\\${file\\(((.+\\${path.sep})*((.+)\\.(${SUPPORTED_FILE_TYPES.join('|')})))\\)(?:\\:(.*))?}$`); // Orig: /^\${file\(((.+\/)*((.+)\.(yml|yaml|json)))\)(?:\:(.*))?}$/

function getFileData(serverlessFile) {
  if (!serverlessFile || typeof serverlessFile !== 'string') {
    return null;
  }
  const matches = FILE_MATCH_REGEX.exec(serverlessFile);
  if (!matches) {
    return null;
  }

  return {
    fullPath: matches[1],
    path: matches[2],
    fullFileName: matches[3],
    fileName: matches[4],
    fileExt: matches[5],
    varName: matches[6],
  };
}


function getStageFilePath(fileData, stage) {
  if (!fileData) {
    return null;
  }

  const filePath = fileData.path ? `${fileData.path}${fileData.fileName}` : fileData.fileName;
  return `${filePath}.${stage}.${fileData.fileExt}`;
}

function mergeObjects(shallow, ...objects) {
  if (shallow) {
    return Object.assign({}, ...objects);
  }

  return mixin({}, ...objects);
}

module.exports = {
  SUPPORTED_FILE_TYPES,
  getFileData,
  getStageFilePath,
  mergeObjects,
};
