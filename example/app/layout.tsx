import type { Metadata } from 'next';
import 'open-doc-editor/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'open-doc-editor example',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
