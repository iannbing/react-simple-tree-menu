'use strict';

const path = require('path');
const execa = require('execa');
const replace = require('replace-in-file');
const escapeStringRegexp = require('escape-string-regexp');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const { version, name } = require(packageJsonPath);

const { SUFFIX = '-rc.' } = process.env;
const suffixRegex = escapeStringRegexp(SUFFIX);

const { stdout } = execa.shellSync(`npm view ${name} versions`);
const allBetaVersions = JSON.parse(stdout.replace(/'/g, '"'))
  .filter(v => v.includes(`${version}${SUFFIX}`))
  .map(v => +v.split(SUFFIX)[1])
  .sort((a, b) => b - a);

const latestBeta = allBetaVersions[0];
const newBetaVersion = `${version}${SUFFIX}${latestBeta ? latestBeta + 1 : 1}`;

replace.sync({
  files: packageJsonPath,
  from: new RegExp(`\"version\": \"(\d|\.|(${suffixRegex}))+\",`, 'g'),
  to: `"version": "${newBetaVersion}",`,
});
