// Mocks the Request from request-utils
const mockedGetPath = jest.fn();
const mockedFileExists = jest.fn(() => true);
const mockedReadFile = jest.fn();

const FileSystem = jest.fn(() => ({
  getPath: mockedGetPath,
  fileExists: mockedFileExists,
  readFile: mockedReadFile,
}));

FileSystem.mockedGetPath = mockedGetPath;
FileSystem.mockedFileExists = mockedFileExists;
FileSystem.mockedReadFile = mockedReadFile;

module.exports = FileSystem;
