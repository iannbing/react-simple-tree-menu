import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

// import { Button, Welcome } from '@storybook/react/demo';
import TreeMenu from '../src/index';

storiesOf('TreeMenu', module).add('with array data', () => {
  const arrayData = [
    {
      key: 'mammal',
      label: 'Mammal',
      nodes: [
        {
          key: 'canidae',
          label: 'Canidae',
          nodes: [
            {
              key: 'dog',
              label: 'Dog',
              nodes: [],
            },
            {
              key: 'fox',
              label: 'Fox',
              nodes: [],
            },
            {
              key: 'wolf',
              label: 'Wolf',
              nodes: [],
            },
          ],
        },
      ],
    },
    {
      key: 'reptile',
      label: 'Reptile',
      nodes: [
        {
          key: 'squamata',
          label: 'Squamata',
          nodes: [
            {
              key: 'lizard',
              label: 'Lizard',
            },
            {
              key: 'snake',
              label: 'Snake',
            },
            {
              key: 'gekko',
              label: 'Gekko',
            },
          ],
        },
      ],
    },
  ];
  return <TreeMenu data={arrayData} />;
});

// storiesOf('Button', module)
//   .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
//   .add('with some emoji', () => (
//     <Button onClick={action('clicked')}>
//       <span role="img" aria-label="so cool">
//         😀 😎 👍 💯
//       </span>
//     </Button>
//   ));
