import type { Meta, StoryObj } from '@storybook/react';
import TreeMenu from './index';

const treeData = [
  {
    key: 'first',
    label: 'First level node',
    nodes: [
      { key: 'first-a', label: 'Nested A' },
      { key: 'first-b', label: 'Nested B' },
    ],
  },
  { key: 'second', label: 'Second level node' },
];

const meta: Meta<typeof TreeMenu> = {
  title: 'TreeMenu/Smoke',
  component: TreeMenu,
};

export default meta;

type Story = StoryObj<typeof TreeMenu>;

export const Default: Story = {
  args: {
    data: treeData,
  },
};
