'use client';

// Client component — isolates the "use client" boundary to the one file
// that actually needs it. The server layout passes plain JSON data into
// this component, which is the recommended App Router pattern.

import TreeMenu, { type TreeNodeObject } from 'react-simple-tree-menu';

interface Props {
  data: TreeNodeObject;
}

export function Sidebar({ data }: Props) {
  return (
    <TreeMenu
      data={data}
      onClickItem={(item) => {
        // In a real app, this would push to a route — keeping it inert
        // for the example so there are no navigation side effects.
        // eslint-disable-next-line no-console
        console.log('clicked', item.key);
      }}
    />
  );
}
