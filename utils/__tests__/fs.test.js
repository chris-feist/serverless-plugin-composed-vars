const fs = require('fs');
const yaml = require('yamljs');
const FileSystem = require('../fs');

jest.mock('fs');
jest.mock('yamljs');

fs.existsSync = jest.fn(() => true);
fs.readFileSync = jest.fn();
yaml.parse = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fs', () => {
  describe('constructor', () => {
    test('constructs instance', () => {
      const serverless = 'test-serverless';

      const result = new FileSystem(serverless);

      expect(result).toBeDefined();
      expect(result.serverless).toBe(serverless);
    });
  });

  describe('instance', () => {
    const SERVICE_PATH = __dirname;
    let instance;
    beforeEach(() => {
      instance = new FileSystem({
        config: {
          servicePath: SERVICE_PATH,
        },
      });
      jest.clearAllMocks();
    });

    describe('getPath', () => {
      test('joins paths', () => {
        const relativePath = 'relative.path';

        const result = instance.getPath(relativePath);

        expect(result).toEqual(`${SERVICE_PATH}/${relativePath}`);
      });
    });

    describe('fileExists', () => {
      test('checks if file exists', () => {
        const relativePath = 'relative.path';
        const expectedResult = true;
        fs.existsSync.mockImplementationOnce(() => expectedResult);

        const result = instance.fileExists(relativePath);

        expect(result).toEqual(expectedResult);
        expect(fs.existsSync).toHaveBeenCalled();
      });

      test('invalid relative path', () => {
        const relativePath = '';

        const result = instance.fileExists(relativePath);

        expect(result).toBe(null);
        expect(fs.existsSync).not.toHaveBeenCalled();
      });
    });

    describe('readFile', () => {
      test('js file extension', () => {
        const relativePath = '../fs.js';

        const result = instance.readFile(relativePath);

        expect(result).toEqual(FileSystem);
      });

      test('yml file extension', () => {
        const relativePath = 'file.yml';
        const expectedFile = 'test-file';
        fs.readFileSync.mockImplementationOnce(() => expectedFile);
        const expectedResult = 'success';
        yaml.parse.mockImplementationOnce(() => expectedResult);

        const result = instance.readFile(relativePath);

        expect(result).toEqual(expectedResult);
        expect(fs.readFileSync).toHaveBeenCalledWith(`${SERVICE_PATH}/${relativePath}`, 'utf8');
        expect(yaml.parse).toHaveBeenCalled();
      });

      test('yaml file extension', () => {
        const relativePath = 'file.yaml';
        const expectedFile = 'test-file';
        fs.readFileSync.mockImplementationOnce(() => expectedFile);
        const expectedResult = 'success';
        yaml.parse.mockImplementationOnce(() => expectedResult);

        const result = instance.readFile(relativePath);

        expect(result).toEqual(expectedResult);
        expect(fs.readFileSync).toHaveBeenCalledWith(`${SERVICE_PATH}/${relativePath}`, 'utf8');
        expect(yaml.parse).toHaveBeenCalledWith(expectedFile);
      });

      test('json file extension', () => {
        const relativePath = 'file.json';
        const expectedResult = { result: 'success' };
        fs.readFileSync.mockImplementationOnce(() => JSON.stringify(expectedResult));

        const result = instance.readFile(relativePath);

        expect(result).toEqual(expectedResult);
        expect(fs.readFileSync).toHaveBeenCalledWith(`${SERVICE_PATH}/${relativePath}`, 'utf8');
      });

      test('unknown file extension', () => {
        const relativePath = 'file.txt';
        const result = instance.readFile(relativePath);

        expect(result).toBe(null);
      });

      test('invalid relative path', () => {
        const relativePath = '';

        const result = instance.readFile(relativePath);

        expect(result).toBe(null);
        expect(fs.existsSync).not.toHaveBeenCalled();
      });
    });

    test('file doesn\'t exist', () => {
      const relativePath = 'relative.path';
      fs.existsSync.mockImplementationOnce(() => false);

      const result = instance.readFile(relativePath);

      expect(result).toEqual(null);
      expect(fs.existsSync).toHaveBeenCalled();
    });
  });
});
