import { configure } from '@storybook/react';

// addDecorator(withInfo);

const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
