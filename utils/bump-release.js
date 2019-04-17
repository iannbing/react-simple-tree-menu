'use strict';

const path = require('path');
const replace = require('replace-in-file');
const escapeStringRegexp = require('escape-string-regexp');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const { version } = require(packageJsonPath);

const { SUFFIX = '-rc.' } = process.env;
const suffixRegex = escapeStringRegexp(SUFFIX);

const releaseVersion = version.split(SUFFIX)[0];

replace.sync({
  files: packageJsonPath,
  from: new RegExp(`\"version\": \"(\d|\.|(${suffixRegex}))+\",`, 'g'),
  to: `"version": "${releaseVersion}",`,
});
