const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SERVERLESS_PACKAGE = 'npx serverless package';
const RESULTS_FILE = 'results.json';
const EXPECTED_FILE = 'expected.json';

const fixturesDir = path.join(__dirname, './__fixtures__');
fs.readdirSync(fixturesDir).forEach((caseName) => {
  const testFunction = async () => {
    const fixtureDir = path.join(fixturesDir, caseName);
    const execOptions = {
      cwd: fixtureDir,
      // stdio: 'inherit', // Un-comment for debugging
    };
    const resultsFile = path.join(fixtureDir, RESULTS_FILE);
    const expectedFile = path.join(fixtureDir, EXPECTED_FILE);
    if (fs.existsSync(resultsFile)) {
      fs.unlinkSync(resultsFile);
    }

    execSync(SERVERLESS_PACKAGE, execOptions);

    expect(fs.existsSync(resultsFile)).toBe(true);
    expect(fs.existsSync(expectedFile)).toBe(true);

    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
    expect(results).toEqual(expected);
  };

  const testName = `${caseName.split('-').join(' ')}`;

  if (caseName.startsWith('skip.')) {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip(testName, testFunction);
  } else if (caseName.startsWith('only.')) {
    // eslint-disable-next-line jest/no-focused-tests
    test.only(testName, testFunction);
  } else {
    test(testName, testFunction);
  }
});
