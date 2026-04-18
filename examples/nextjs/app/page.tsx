export default function HomePage() {
  return (
    <>
      <h1>Next.js App Router example</h1>
      <p>
        The sidebar on the left is a <code>react-simple-tree-menu</code>{' '}
        rendered inside a client component. Open the browser console to see
        click events fire.
      </p>
      <p>
        Data is loaded on the server (<code>app/layout.tsx</code>) and passed
        into the client <code>Sidebar</code> as a plain JSON object.
      </p>
    </>
  );
}
