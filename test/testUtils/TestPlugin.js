const fs = require('fs');

const RESULTS_FILE = 'results.json';

class TestPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeCreateDeploymentArtifacts.bind(this),
    };
  }

  beforeCreateDeploymentArtifacts() {
    const results = {
      custom: this.serverless.service.custom,
      environment: this.serverless.service.provider.environment,
    };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf8');
  }
}

module.exports = TestPlugin;
