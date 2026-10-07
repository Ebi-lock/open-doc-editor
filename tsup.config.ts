import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  // Next.js の App Router (Server Components) から直接 import できるよう、クライアントコンポーネントとして出力する
  banner: { js: "'use client';" },
});
