# serverless-plugin-composed-vars

This plugin is [Serverless][link-serverless] variables reimagined, making them composable and easier to manage. It automatically scans for `variables.yml` and `environment.yml` files in your service directory to assign custom and environment variables in your service. In addition, it easily allows for stage specific overrides by loading `variables.stage.yml` and `environment.stage.yml` where `stage` is your deployment stage, like `beta` or `prod`.

[![Serverless][icon-serverless]][link-serverless]
[![License][icon-license]][link-license]
[![NPM Total Downloads][icon-npm-total-downloads]][link-npm]
[![NPM Version][icon-npm-version]][link-npm]
[![Build Status][icon-build-status]][link-build]
[![Coverage][icon-coverage]][link-coverage]

## Installation

```sh
npm install -D serverless-plugin-composed-vars
```
or
```sh
yarn add -D serverless-plugin-composed-vars
```

Add `serverless-plugin-composed-vars` as the **first** plugin in your serverless.yml file:

```yaml
plugins:
  - serverless-plugin-composed-vars
  - other-serverless-plugin
```

## Usage

### Custom Variables

Create a `varialbes.yml` file for default variable definitions:

```yaml
# variables.yml
myServiceName: Always My Service
myEndpoint: beta.endpoint.com

webpack:
  webpackConfig: 'beta-webpack.config.js'
  includeModules: true
  packager: yarn
```

Create a stage specific variable file:

```yaml
# variables.prod.yml
myEndpoint: prod.endpoint.com

webpack:
  webpackConfig: 'webpack.config.js'
  includeModules: false
```

`prod` stage environments will result in:
```yaml
myServiceName: Always My Service
myEndpoint: prod.endpoint.com

webpack:
  webpackConfig: 'webpack.config.js'
  includeModules: false
  packager: yarn
```

### Environment Variables

Create an `environment.yml` file for default definitions:

```yaml
# environment.yml
MY_ENDPOINT:: ${self:custom.myEndpoint}
STAGE: beta
```

Create a stage specific environment file:

```yaml
# environment.prod.yml
STAGE: prod
```

`prod` stage environments will result in:
```yaml
MY_ENDPOINT:: ${self:custom.myEndpoint}
STAGE: prod
```

### Supported File Extensions
- yml
- yaml
- js
- json

## Advanced Usage

### Service File Definitions

You can additionally define custom variables and environment variables in your service file. Note that these have the least priority and will be overridden by `variables.yml` and `environment.yml`.
```yaml
# serverless.yml
custom:
  googlesWebsite: www.google.com
  myEndpoint: dev.endpoint.com

provider:
  environment:
    THE_ANSWER_IS: 42
    STAGE: dev
```

Using the examples above, `prod` stage environments will result in:
```yaml
# Custom Variables
googlesWebsite: www.google.com
myServiceName: Always My Service
myEndpoint: prod.endpoint.com

webpack:
  webpackConfig: 'webpack.config.js'
  includeModules: false
  packager: yarn
```

```yaml
# Environment Variables
THE_ANSWER_IS: 42
MY_ENDPOINT:: ${self:custom.myEndpoint}
STAGE: prod
```

### Alternate File Location

If you'd like to specify a different directory or variable file name, just add a file reference for `custom` or `environment`:

```yaml
# serverless.yml
custom: ${file(./different/path/custom.yml)}

provider:
  environment: ${file(./different/path/env.yml)}
```

In this example, variables will be overridden with stage specific definitions defined in the following files:

Custom: `./different/path/custom.stage.yml`

Environment: `./different/path/env.stage.yml`

## Troubleshooting

You can troubleshoot your variable setup by running the `composed-vars merged` and `composed-vars computed` commands. For example, `npx serverless composed-vars merged` will output the merged variables before any of the reference properties are computed. Whereas `npx serverless composed-vars computed` will output the fully computed values.

## Limitations

`serverless-plugin-composed-vars` will only override custom variables and environment variables defined in main service file: `serverless.yml`. It does not perform an expansive search to override outside of the `custom` and `environment` definitions. Below are some examples that won't be overridden. However, with the structure of `serverless-plugin-composed-vars`, all of them can easily be handled by moving the definitions to the `variables.yml` file.

### Examples
#### Functions and Resources

```yaml
# serverless.yml
plugins:
  - serverless-plugin-composed-vars

provider:
  stackName: ${file(./another-var-file.yml):stackName}

functions:
  hello:
    handler: handler.hello
    events: ${file(./hello-events.yml)}
  hi:
    handler: handler.hi
    events:
      - schedule: ${file(./schedule-vars.yml):globalSchedule}

resources:
  Resources:
    itemsTable: ${file(./items-table-vars.yml)}
    usersTable:
      tableName: ${file(./table-vars.yml):usersTable}
```

#### Deep File References
```yaml
# variables.yml

tableNames: ${file(./table-names.yml)}
# This will not be converted to table-names.stage.yml
```

#### Recursive/Nested Variable File Names:
```yaml
# serverless.yml

custom: ${file(./${self:service.name}.json)}
```

### Avoiding Limitations

Move all of these references to the `variables.yml` and take advantage of stage overrides.

```yaml
# serverless.yml

plugins:
  - serverless-plugin-composed-vars

provider:
  stackName: ${self:custom.stackName}

functions:
  hello:
    handler: handler.hello
    events: ${self:custom.helloEvents}
  hi:
    handler: handler.hi
    events:
      - schedule: ${self:custom.globalSchedule}

resources:
  Resources:
    itemsTable: ${self:custom.itemsTable}
    usersTable:
      tableName: ${self:custom.tableNames.usersTable}
```

```yaml
# variables.yml

stackName: My Stack

helloEvents:
  - http
  - schedule

schedule:
  globalSchedule: 1 hour

itemsTable: ${file(./items-table-vars.yml)}

tableNames: ${file(./table-names.yml)}
```

```yaml
# variables.prod.yml

stackName: My Production Stack

schedule:
  globalSchedule: 5 minutes

itemsTable: ${file(./items-table-vars.prod.yml)}

tableNames: ${file(./table-names.prod.yml)}
```

[icon-serverless]: http://public.serverless.com/badges/v3.svg
[icon-license]: https://img.shields.io/github/license/chris-feist/serverless-plugin-composed-vars.svg
[icon-npm-total-downloads]: https://img.shields.io/npm/dt/serverless-plugin-composed-vars.svg
[icon-npm-version]: https://img.shields.io/npm/v/serverless-plugin-composed-vars.svg
[icon-npm-license]: https://img.shields.io/npm/l/serverless-plugin-composed-vars.svg
[icon-build-status]: https://travis-ci.com/chris-feist/serverless-plugin-composed-vars.svg?branch=master
[icon-coverage]: https://img.shields.io/codecov/c/github/chris-feist/serverless-plugin-composed-vars/master.svg

[link-serverless]: http://www.serverless.com/
[link-license]: ./LICENSE
[link-npm]: https://www.npmjs.com/package/serverless-plugin-composed-vars
[link-build]: https://travis-ci.com/chris-feist/serverless-plugin-composed-vars
[link-coverage]: https://codecov.io/gh/chris-feist/serverless-plugin-composed-vars