'use strict';

const replace = require('replace-in-file');

const { packageJsonPath, version, name, suffix, suffixRegex } = require('./import-data');

const releaseVersion = version.split(suffix)[0];

replace.sync({
  files: packageJsonPath,
  from: new RegExp(`\"version\": \"(\d|\.|(${suffixRegex}))+\",`, 'g'),
  to: `"version": "${releaseVersion}",`,
});
