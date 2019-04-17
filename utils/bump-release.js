'use strict';

const path = require('path');
const replace = require('replace-in-file');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const { version } = require(packageJsonPath);

const SUFFIX = '-rc.';
const SUFFIX_REGEX = '-rc';

const releaseVersion = version.split(SUFFIX)[0];

replace.sync({
  files: packageJsonPath,
  from: new RegExp(`\"version\": \"[\d|\.|(${SUFFIX_REGEX})]+\",`, 'g'),
  to: `"version": "${releaseVersion}",`,
});
