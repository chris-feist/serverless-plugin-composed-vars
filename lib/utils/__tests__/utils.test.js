const {
  SUPPORTED_FILE_TYPES,
  getFileData,
  getStageFilePath,
  mergeObjects,
} = require('../utils');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('utils', () => {
  test('SUPPORTED_FILE_TYPES', () => {
    expect(SUPPORTED_FILE_TYPES).toEqual(['yml', 'yaml', 'json', 'js']);
  });

  describe('getFileData', () => {
    test('file path without variable', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(./really/long/path/myCustomFile.yml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: './really/long/path/myCustomFile.yml',
        path: './really/long/path/',
        fullFileName: 'myCustomFile.yml',
        fileName: 'myCustomFile',
        fileExt: 'yml',
        varName: undefined,
      });
    });

    test('file path with variable', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(./really/long/path/myCustomFile.yml):someVariable}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: './really/long/path/myCustomFile.yml',
        path: './really/long/path/',
        fullFileName: 'myCustomFile.yml',
        fileName: 'myCustomFile',
        fileExt: 'yml',
        varName: 'someVariable',
      });
    });

    test('file name with many dots', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(./file.many.dots.yml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: './file.many.dots.yml',
        path: './',
        fullFileName: 'file.many.dots.yml',
        fileName: 'file.many.dots',
        fileExt: 'yml',
        varName: undefined,
      });
    });

    test('file path without leading period', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(path/file.yml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'path/file.yml',
        path: 'path/',
        fullFileName: 'file.yml',
        fileName: 'file',
        fileExt: 'yml',
        varName: undefined,
      });
    });

    test('file without path', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(file.yml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'file.yml',
        path: undefined,
        fullFileName: 'file.yml',
        fileName: 'file',
        fileExt: 'yml',
        varName: undefined,
      });
    });

    test('file extension: yml', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(file.yml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'file.yml',
        path: undefined,
        fullFileName: 'file.yml',
        fileName: 'file',
        fileExt: 'yml',
        varName: undefined,
      });
    });

    test('file extension: yaml', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(file.yaml)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'file.yaml',
        path: undefined,
        fullFileName: 'file.yaml',
        fileName: 'file',
        fileExt: 'yaml',
        varName: undefined,
      });
    });

    test('file extension: json', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(file.json)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'file.json',
        path: undefined,
        fullFileName: 'file.json',
        fileName: 'file',
        fileExt: 'json',
        varName: undefined,
      });
    });

    test('file extension: js', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(file.js)}';

      const result = getFileData(serverlessFile);

      expect(result).toEqual({
        fullPath: 'file.js',
        path: undefined,
        fullFileName: 'file.js',
        fileName: 'file',
        fileExt: 'js',
        varName: undefined,
      });
    });

    test('null input', () => {
      const serverlessFile = null;

      const result = getFileData(serverlessFile);

      expect(result).toBe(null);
    });

    test('empty string input', () => {
      const serverlessFile = '';

      const result = getFileData(serverlessFile);

      expect(result).toBe(null);
    });

    test('non-string input', () => {
      const serverlessFile = 1234;

      const result = getFileData(serverlessFile);

      expect(result).toBe(null);
    });

    test('not a file path', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${opt:stage}';

      const result = getFileData(serverlessFile);

      expect(result).toBe(null);
    });
  });

  describe('getStageFilePath', () => {
    test('converts file data to stage path', () => {
      const fileData = {
        path: 'test-path/',
        fileName: 'test-file-name',
        fileExt: 'test-file-ext',
      };
      const stage = 'test-stage';

      const result = getStageFilePath(fileData, stage);

      expect(result).toEqual('test-path/test-file-name.test-stage.test-file-ext');
    });

    test('converts file data without path', () => {
      const fileData = {
        fileName: 'test-file-name',
        fileExt: 'test-file-ext',
      };
      const stage = 'test-stage';

      const result = getStageFilePath(fileData, stage);

      expect(result).toEqual('test-file-name.test-stage.test-file-ext');
    });

    test('handles null fileData', () => {
      const fileData = null;
      const stage = 'test-stage';

      const result = getStageFilePath(fileData, stage);

      expect(result).toBe(null);
    });
  });

  describe('mergeObjects', () => {
    test('deep: shallow values', () => {
      const shallow = false;
      const objects = [
        {
          val1: 'val1',
          str: 'a',
          bool: false,
          number: 1234,
          nullVal: 'not-null',
        },
        {
          val2: 'val2',
          str: 'b',
          bool: true,
          number: 5678,
          nullVal: null,
        },
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        val1: 'val1',
        val2: 'val2',
        str: 'b',
        bool: true,
        number: 5678,
        nullVal: null,
      });
    });

    test('deep: null objects', () => {
      const shallow = false;
      const objects = [
        null,
        {
          success: true,
        },
        null,
        undefined,
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        success: true,
      });
    });

    test('deep: complex values', () => {
      const shallow = false;
      const objects = [
        {
          deepObj: {
            a: false,
            b: 'a',
            c: {
              deeper: true,
            },
          },
          numArray: [1, 2, 3, 4],
          stringArray: ['a', 'b', 'c'],
          array: [
            {
              obj1: false,
            },
            {
              obj2: false,
            },
          ],
        },
        {
          deepObj: {
            a: true,
            b: 'b',
            d: {
              deeper: true,
            },
          },
          array: [
            {
              obj3: true,
            },
            {
              obj4: true,
            },
          ],
          numArray: [5, 6, 7, 8],
          stringArray: ['d', 'e', 'f'],
        },
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        deepObj: {
          a: true,
          b: 'b',
          c: {
            deeper: true,
          },
          d: {
            deeper: true,
          },
        },
        array: [
          {
            obj3: true,
          },
          {
            obj4: true,
          },
        ],
        numArray: [5, 6, 7, 8],
        stringArray: ['d', 'e', 'f'],
      });
    });

    test('shallow: shallow values', () => {
      const shallow = true;
      const objects = [
        {
          val1: 'val1',
          str: 'a',
          bool: false,
          number: 1234,
          nullVal: 'not-null',
        },
        {
          val2: 'val2',
          str: 'b',
          bool: true,
          number: 5678,
          nullVal: null,
        },
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        val1: 'val1',
        val2: 'val2',
        str: 'b',
        bool: true,
        number: 5678,
        nullVal: null,
      });
    });

    test('shallow: null objects', () => {
      const shallow = true;
      const objects = [
        null,
        {
          success: true,
        },
        null,
        undefined,
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        success: true,
      });
    });

    test('shallow: complex values', () => {
      const shallow = true;
      const objects = [
        {
          deepObj: {
            a: false,
            b: 'a',
            c: {
              deeper: true,
            },
          },
          numArray: [1, 2, 3, 4],
          stringArray: ['a', 'b', 'c'],
          array: [
            {
              obj1: false,
            },
            {
              obj2: false,
            },
          ],
        },
        {
          deepObj: {
            a: true,
            b: 'b',
            d: {
              deeper: true,
            },
          },
          array: [
            {
              obj3: true,
            },
            {
              obj4: true,
            },
          ],
          numArray: [5, 6, 7, 8],
          stringArray: ['d', 'e', 'f'],
        },
      ];

      const result = mergeObjects(shallow, ...objects);

      expect(result).toEqual({
        deepObj: {
          a: true,
          b: 'b',
          d: {
            deeper: true,
          },
        },
        array: [
          {
            obj3: true,
          },
          {
            obj4: true,
          },
        ],
        numArray: [5, 6, 7, 8],
        stringArray: ['d', 'e', 'f'],
      });
    });
  });
});
