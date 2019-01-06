const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');

/**
 * Due to inconsistent reliability of Serverless utils file parsing,
 * we need our own.
 */
class FileSystem {
  constructor(serverless) {
    this.serverless = serverless;
  }

  getPath(relativePath) {
    return path.join(this.serverless.config.servicePath, relativePath);
  }

  fileExists(relativeFilePath) {
    if (!relativeFilePath) {
      return null;
    }
    const filePath = this.getPath(relativeFilePath);
    return fs.existsSync(filePath);
  }

  readFile(relativeFilePath) {
    if (!relativeFilePath) {
      return null;
    }
    const filePath = this.getPath(relativeFilePath);
    if (!fs.existsSync(filePath)) {
      return null;
    }


    const fileExt = relativeFilePath.split('.').pop();
    switch (fileExt) {
      case 'js': {
        // eslint-disable-next-line
        return require(filePath);
      }
      case 'yml':
      case 'yaml': {
        const file = fs.readFileSync(filePath, 'utf8').toString();
        return yaml.parse(file);
      }
      case 'json': {
        const file = fs.readFileSync(filePath, 'utf8').toString();
        return JSON.parse(file);
      }
      default: {
        return null;
      }
    }
  }
}

module.exports = FileSystem;
