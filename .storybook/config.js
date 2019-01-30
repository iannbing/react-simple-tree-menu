import { configure, addDecorator } from '@storybook/react';
import { configureActions } from '@storybook/addon-actions';

const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

configureActions({
  depth: 100,
  limit: 20,
});
