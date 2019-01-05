const cloneDeep = require('lodash.clonedeep');
const FileSystem = require('./utils/fs');
const {
  SUPPORTED_FILE_TYPES,
  getFileData,
  getStageFilePath,
  mergeObjects,
} = require('./utils/utils');

const PLUGIN_NAME = 'composed-vars';
const PACKAGE_NAME = `serverless-plugin-${PLUGIN_NAME}`;
class ComposedVarsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.fs = new FileSystem(serverless);

    this.commands = {
      [PLUGIN_NAME]: {
        usage: 'Handle merging of stage variables',
        lifecycleEvents: [
          PLUGIN_NAME,
        ],
        commands: {
          merged: {
            usage: 'Display merged variable resources',
            lifecycleEvents: [
              'merged',
            ],
          },
          computed: {
            usage: 'Display computed variable resources',
            lifecycleEvents: [
              'computed',
            ],
          },
        },
      },
    };

    this.hooks = {
      [`${PLUGIN_NAME}:merged:merged`]: this.mergedHook.bind(this),
      [`${PLUGIN_NAME}:computed:computed`]: this.computedHook.bind(this),
    };

    this.checkPluginOrder();

    const vars = this.serverless.service.custom;
    const envVars = this.serverless.service.provider.environment;
    const stage = this.getStage();
    this.processCustomVariables(vars, stage);
    this.processEnvVars(envVars, stage);
  }

  // eslint-disable-next-line class-methods-use-this
  generateCommandOutput(customVars, environmentVars) {
    const combined = {
      custom: customVars,
      environment: environmentVars,
    };

    return JSON.stringify(combined, null, 2);
  }

  log(...args) {
    const message = args.join(' ');
    this.serverless.cli.consoleLog(`${PACKAGE_NAME}: ${message}`);
  }

  mergedHook() {
    const vars = this.generateCommandOutput(this.customVars, this.environmentVars);
    this.log(`\n${vars}`);
  }

  computedHook() {
    const vars = this.generateCommandOutput(
      this.serverless.service.custom,
      this.serverless.service.provider.environment,
    );
    this.log(`\n${vars}`);
  }

  checkPluginOrder() {
    const pluginIndex = this.serverless.service.plugins.indexOf(PACKAGE_NAME);
    if (pluginIndex !== 0) {
      this.log(`WARNING: To ensure ${PACKAGE_NAME} functions properly, it should be the first plugin. Found it at index: ${pluginIndex}`);
    }
  }

  getStage() {
    if (this.options.stage) {
      return this.options.stage;
    }

    return this.serverless.service.provider.stage;
  }

  readServerlessFile(serverlessFile) {
    const fileData = getFileData(serverlessFile);
    return this.fs.readFile(fileData.fullPath);
  }

  getMergedVariables(shallowMerge, configVars, varFilePath, stageVarFilePath) {
    const variables = this.fs.readFile(varFilePath);
    const stageVariables = this.fs.readFile(stageVarFilePath);
    const mergedVars = mergeObjects(shallowMerge, configVars, variables, stageVariables);
    return mergedVars;
  }

  /**
   * Find an existing file path with extension
   * @param {string} fileName The path and file name, excluding extension
   */
  findFileExtension(fileName) {
    if (!fileName) {
      return null;
    }

    const foundExt = SUPPORTED_FILE_TYPES.find((extension) => this.fs.fileExists(`${fileName}.${extension}`));
    if (!foundExt) {
      return null;
    }

    return `${fileName}.${foundExt}`;
  }

  processStringVars(vars, stage, shallowMerge) {
    const fileData = getFileData(vars);
    if (!fileData || !fileData.fullPath) {
      // Unable to match regex
      return vars;
    }
    const varFilePath = fileData.fullPath;
    const stageVarPath = getStageFilePath(fileData, stage);
    return this.getMergedVariables(shallowMerge, null, varFilePath, stageVarPath);
  }

  processObjectVars(vars, stage, fileName, shallowMerge) {
    const configVars = vars || {};
    const varFilePath = this.findFileExtension(`./${fileName}`);
    const stageVarFilePath = this.findFileExtension(`./${fileName}.${stage}`);
    if (!varFilePath && !stageVarFilePath) {
      return vars;
    }

    return this.getMergedVariables(shallowMerge, configVars, varFilePath, stageVarFilePath);
  }

  processVariables(vars, stage, fileName, shallowMerge = false) {
    if (typeof vars === 'string') {
      return this.processStringVars(vars, stage, shallowMerge);
    }

    if (vars === undefined || typeof vars === 'object') {
      return this.processObjectVars(vars, stage, fileName, shallowMerge);
    }

    return vars;
  }

  processCustomVariables(vars, stage) {
    const mergedVars = this.processVariables(vars, stage, 'variables');
    if (mergedVars !== vars) {
      this.serverless.service.custom = mergedVars;
    }
    this.customVars = cloneDeep(this.serverless.service.custom);
  }

  processEnvVars(vars, stage) {
    const mergedVars = this.processVariables(vars, stage, 'environment', true);
    if (mergedVars !== vars) {
      this.serverless.service.provider.environment = mergedVars;
    }
    this.environmentVars = cloneDeep(this.serverless.service.provider.environment);
  }
}

module.exports = ComposedVarsPlugin;
