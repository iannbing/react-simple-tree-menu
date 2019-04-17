'use strict';

const path = require('path');
const execa = require('execa');
const replace = require('replace-in-file');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const { version, name } = require(packageJsonPath);

const SUFFIX = '-rc.';
const SUFFIX_REGEX = '-rc';

const { stdout } = execa.shellSync(`npm view ${name} versions`);
const allBetaVersions = JSON.parse(stdout.replace(/'/g, '"'))
  .filter(v => v.includes(`${version}${SUFFIX}`))
  .map(v => +v.split(SUFFIX)[1])
  .sort((a, b) => b - a);

const latestBeta = allBetaVersions[0];
const newBetaVersion = `${version}${SUFFIX}${latestBeta ? latestBeta + 1 : 1}`;

replace.sync({
  files: packageJsonPath,
  from: new RegExp(`\"version\": \"[\d|\.|(${SUFFIX_REGEX})]+\",`, 'g'),
  to: `"version": "${newBetaVersion}",`,
});
