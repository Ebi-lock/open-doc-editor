import { Demo } from './Demo';

// Server Component からそのまま配置できる (エディタ自体はクライアントで動く)
export default function Page() {
  return (
    <main>
      <h1>open-doc-editor</h1>
      <Demo />
    </main>
  );
}
