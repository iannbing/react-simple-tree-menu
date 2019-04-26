const fs = require('fs-extra');
const path = require('path');

const source = path.join(process.cwd(), '.circleci');
const storybookStaticFolder = path.join(process.cwd(), 'storybook-static');
const dest = path.join(process.cwd(), 'storybook-static/.circleci');

if (!fs.existsSync(storybookStaticFolder)) {
  console.error('You need to build storybook first');
  return;
}

fs.copySync(source, dest);
console.log('circleci config copied!');
