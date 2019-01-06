const ComposedVarsPlugin = require('../index');
const { mockedFileExists, mockedReadFile } = require('../utils/fs');

jest.mock('../utils/fs');

const PLUGIN_NAME = 'serverless-plugin-composed-vars';

const createServerless = (customVars, envVars, stage = 'test-provider-stage', plugins = [PLUGIN_NAME]) => ({
  cli: {
    log: jest.fn(),
    consoleLog: jest.fn(),
  },
  service: {
    custom: customVars,
    provider: {
      environment: envVars,
      stage,
    },
    plugins,
  },
});

const createOptions = (stage = 'test-options-stage') => ({
  stage,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ComposedVarsPlugin', () => {
  describe('constructor', () => {
    test('is created', () => {
      const serverless = createServerless();
      const options = createOptions();

      const result = new ComposedVarsPlugin(serverless, options);

      expect(result).toBeDefined();
      expect(mockedReadFile).toHaveBeenCalledTimes(4);
    });
  });

  describe('generateCommandOutput', () => {
    test('converts to json', () => {
      const serverless = createServerless(undefined, undefined, undefined, [PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const customVars = {
        custom: 1,
      };
      const environmentVars = {
        envVar: 'value',
      };

      const result = plugin.generateCommandOutput(customVars, environmentVars);

      expect(result).toEqual(JSON.stringify({
        custom: customVars,
        environment: environmentVars,
      }, null, 2));
    });
  });

  describe('log', () => {
    test('logs output', () => {
      const serverless = createServerless(undefined, undefined, undefined, [PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const arg1 = 'arg1';
      const arg2 = 2;
      const arg3 = true;

      plugin.log(arg1, arg2, arg3);

      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(`serverless-plugin-composed-vars: ${arg1} ${arg2} ${arg3}`);
    });
  });

  describe('mergedHook', () => {
    test('logs output', () => {
      const serverless = createServerless(undefined, undefined, undefined, [PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      plugin.customVars = {
        custom: 1,
      };
      plugin.environmentVars = {
        envVar: 'value',
      };

      plugin.mergedHook();

      expect(serverless.cli.consoleLog).toHaveBeenCalled();
      expect(serverless.cli.consoleLog.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('computedHook', () => {
    test('logs output', () => {
      const serverless = createServerless(undefined, undefined, undefined, [PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      plugin.customVars = {
        custom: 1,
      };
      plugin.environmentVars = {
        envVar: 'value',
      };

      plugin.computedHook();

      expect(serverless.cli.consoleLog).toHaveBeenCalled();
      expect(serverless.cli.consoleLog.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('checkPluginOrder', () => {
    test('is first plugin', () => {
      const serverless = createServerless(undefined, undefined, undefined, [PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();

      plugin.checkPluginOrder();

      expect(serverless.cli.consoleLog).not.toHaveBeenCalled();
    });

    test('is not first plugin', () => {
      const serverless = createServerless(undefined, undefined, undefined, ['serverless-plugin-other', PLUGIN_NAME]);
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();

      plugin.checkPluginOrder();

      expect(serverless.cli.consoleLog).toHaveBeenCalled();
    });
  });

  describe('getStage', () => {
    test('uses options', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();

      const result = plugin.getStage();

      expect(result).toEqual('test-options-stage');
    });

    test('uses provider', () => {
      const serverless = createServerless();
      const options = createOptions(null);
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();

      const result = plugin.getStage();

      expect(result).toEqual('test-provider-stage');
    });
  });

  describe('readServerlessFile', () => {
    test('happy path', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      // eslint-disable-next-line no-template-curly-in-string
      const serverlessFile = '${file(./path/myCustomFile.yml)}';
      mockedReadFile.mockImplementationOnce(() => 'success');

      const result = plugin.readServerlessFile(serverlessFile);

      expect(result).toEqual('success');
      expect(mockedReadFile).toHaveBeenCalledWith('./path/myCustomFile.yml');
    });
  });

  describe('getMergedVariables', () => {
    test('merges variables', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const configVars = {
        configKey: 'configValue',
        configOverriddenKey: 'fail',
      };
      const vars = {
        varKey: 'variableValue',
        varOverriddenKey: 'fail',
      };
      mockedReadFile.mockImplementationOnce(() => vars);
      const stageVars = {
        stageVarKey: 'stageVarValue',
        configOverriddenKey: 'success',
        varOverriddenKey: 'success',
      };
      mockedReadFile.mockImplementationOnce(() => stageVars);

      const result = plugin.getMergedVariables(false, configVars, 'test-var-path', 'test-stage-var-path');

      expect(result).toEqual({
        configKey: 'configValue',
        varKey: 'variableValue',
        stageVarKey: 'stageVarValue',
        configOverriddenKey: 'success',
        varOverriddenKey: 'success',
      });
    });
  });

  describe('findFileExtension', () => {
    test('finds file extension', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const fileName = 'path/file';
      mockedFileExists.mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true);

      const result = plugin.findFileExtension(fileName);

      expect(result).toEqual(`${fileName}.json`);
    });

    test('does not find file extension', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const fileName = 'path/file';
      mockedFileExists.mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);

      const result = plugin.findFileExtension(fileName);

      expect(result).toEqual(null);
    });

    test('invalid file name', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const fileName = '';

      const result = plugin.findFileExtension(fileName);

      expect(result).toEqual(null);
    });
  });

  describe('processStringVars', () => {
    test('reads in files and merges variables', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      // eslint-disable-next-line no-template-curly-in-string
      const vars = '${file(var-file.yml)}';
      const stage = 'test-stage';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processStringVars(vars, stage, false);

      expect(result).toEqual({
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
    });

    test('does not find file path', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      // eslint-disable-next-line no-template-curly-in-string
      const vars = '${file()}';
      const stage = 'test-stage';

      const result = plugin.processStringVars(vars, stage, false);

      expect(result).toBe(vars);
    });

    test('does not find file string', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = 'random string';
      const stage = 'test-stage';

      const result = plugin.processStringVars(vars, stage, false);

      expect(result).toBe(vars);
    });
  });

  describe('processObjectVars', () => {
    test('reads in files and merges variables', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = {
        configKey: 'configVar',
      };
      const stage = 'test-stage';
      const fileName = 'test-file';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processObjectVars(vars, stage, fileName, false);

      expect(result).toEqual({
        configKey: 'configVar',
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
    });

    test('doesn\'t find variable files', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = {
        configKey: 'configVar',
      };
      const stage = 'test-stage';
      const fileName = 'test-file';
      mockedFileExists.mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);

      const result = plugin.processObjectVars(vars, stage, fileName, false);

      expect(result).toEqual(vars);
    });
  });

  describe('processVariables', () => {
    test('vars is string', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      // eslint-disable-next-line no-template-curly-in-string
      const vars = '${file(var-file.yml)}';
      const stage = 'test-stage';
      const fileName = 'test-file';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processVariables(vars, stage, fileName, false);

      expect(result).toEqual({
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
      expect(mockedFileExists).toHaveBeenCalledTimes(0);
      expect(mockedReadFile).toHaveBeenCalledTimes(2);
    });

    test('vars is object', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = {
        configKey: 'configValue',
      };
      const stage = 'test-stage';
      const fileName = 'test-file';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processVariables(vars, stage, fileName, false);

      expect(result).toEqual({
        configKey: 'configValue',
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
      expect(mockedFileExists).toHaveBeenCalledTimes(2);
      expect(mockedReadFile).toHaveBeenCalledTimes(2);
    });

    test('vars is null', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = null;
      const stage = 'test-stage';
      const fileName = 'test-file';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processVariables(vars, stage, fileName, false);

      expect(result).toEqual({
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
      expect(mockedFileExists).toHaveBeenCalledTimes(2);
      expect(mockedReadFile).toHaveBeenCalledTimes(2);
    });

    test('vars is undefined', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = undefined;
      const stage = 'test-stage';
      const fileName = 'test-file';
      const variables = {
        varKey: 'varValue',
      };
      mockedReadFile.mockImplementationOnce(() => variables);
      const stageVariables = {
        stageVarKey: 'stageVarValue',
      };
      mockedReadFile.mockImplementationOnce(() => stageVariables);

      const result = plugin.processVariables(vars, stage, fileName, false);

      expect(result).toEqual({
        varKey: 'varValue',
        stageVarKey: 'stageVarValue',
      });
      expect(mockedFileExists).toHaveBeenCalledTimes(2);
      expect(mockedReadFile).toHaveBeenCalledTimes(2);
    });

    test('vars is not object or string like', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = 123;
      const stage = 'test-stage';
      const fileName = 'test-file';

      const result = plugin.processVariables(vars, stage, fileName, false);

      expect(result).toEqual(vars);
      expect(mockedFileExists).not.toHaveBeenCalled();
      expect(mockedReadFile).not.toHaveBeenCalled();
    });
  });

  describe('processCustomVariables', () => {
    test('processes and sets custom vars', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = {
        deep: {
          configKey: 'configValue',
        },
      };
      const stage = 'test-stage';
      const variables = {
        deep: {
          varKey: 'varValue',
        },
      };
      mockedReadFile.mockImplementationOnce(() => variables);

      plugin.processCustomVariables(vars, stage);

      const expected = {
        deep: {
          configKey: 'configValue',
          varKey: 'varValue',
        },
      };
      expect(serverless.service.custom).toEqual(expected);
      expect(plugin.customVars).toEqual(expected);
      expect(mockedFileExists).toHaveBeenCalledWith('./variables.yml');
    });

    test('does not process same vars', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const originalVars = serverless.service.custom;
      const vars = 'unknown file';
      const stage = 'test-stage';

      plugin.processCustomVariables(vars, stage);

      expect(serverless.service.custom).toBe(originalVars);
    });
  });

  describe('processEnvVars', () => {
    test('processes and sets custom vars', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const vars = {
        deep: {
          configKey: 'configValue',
        },
      };
      const stage = 'test-stage';
      const variables = {
        deep: {
          varKey: 'varValue',
        },
      };
      mockedReadFile.mockImplementationOnce(() => variables);

      plugin.processEnvVars(vars, stage);

      const expected = {
        deep: {
          varKey: 'varValue',
        },
      };
      expect(serverless.service.provider.environment).toEqual(expected);
      expect(plugin.environmentVars).toEqual(expected);
      expect(mockedFileExists).toHaveBeenCalledWith('./environment.yml');
    });

    test('does not process same vars', () => {
      const serverless = createServerless();
      const options = createOptions();
      const plugin = new ComposedVarsPlugin(serverless, options);
      jest.clearAllMocks();
      const originalVars = serverless.service.provider.environment;
      const vars = 'unknown file';
      const stage = 'test-stage';

      plugin.processEnvVars(vars, stage);

      expect(serverless.service.provider.environment).toBe(originalVars);
    });
  });
});
