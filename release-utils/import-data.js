'use strict';

const path = require('path');
const escapeStringRegexp = require('escape-string-regexp');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const { version, name } = require(packageJsonPath);

const { SUFFIX = '-rc.' } = process.env;
const suffix = SUFFIX;
const suffixRegex = escapeStringRegexp(suffix);

module.exports = {
  packageJsonPath,
  version,
  name,
  suffix,
  suffixRegex,
};
