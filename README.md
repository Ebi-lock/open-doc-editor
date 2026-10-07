# open-doc-editor

React / Next.js 向けの軽量リッチテキストエディタです。書式ツールバーと `contentEditable` の編集エリアで構成され、値は **innerHTML の文字列** として受け渡しします。

- 依存ライブラリなし (peer: `react` / `react-dom` 18 以上)
- `'use client'` 付きで出力しているので、Next.js App Router の Server Component からそのまま配置可能
- 太字・斜体・下線・取り消し線・寄せ・リスト・画像・字下げ・表 (サイズをマス目で選択)・元に戻す/やり直す
- 貼り付けはプレーンテキストとして挿入 (既定)

## インストール

```bash
npm install open-doc-editor
```

## 使い方

```tsx
'use client';

import { useState } from 'react';
import { OpenEditor } from 'open-doc-editor';
import 'open-doc-editor/styles.css'; // app/layout.tsx で一度だけ読み込んでもよい

export function MyForm() {
  const [html, setHtml] = useState('<p>こんにちは</p>');
  return <OpenEditor value={html} onChange={setHtml} placeholder="本文を入力" />;
}
```

非制御で使う場合は `defaultValue` を渡し、`onChange` で innerHTML を受け取ります。

```tsx
<OpenEditor defaultValue="<p>初期値</p>" onChange={(html) => console.log(html)} />
```

### Props (`OpenEditor`)

| prop | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 制御コンポーネントとしての値 (innerHTML) |
| `defaultValue` | `string` | `''` | 非制御時の初期値 |
| `onChange` | `(html: string) => void` | — | 入力のたびに innerHTML を返す。空の時は `''` |
| `placeholder` | `string` | — | 空の時に表示する文字 |
| `readOnly` | `boolean` | `false` | 編集不可にする (ツールバーも非表示) |
| `tools` | `ToolbarItem[]` | `DEFAULT_TOOLS` | 表示するボタン。縦棒の文字列でグループを区切る。全部入りは `ALL_TOOLS` |
| `labels` | `Partial<Record<ToolName, string>>` | 日本語 | ボタンの title / aria-label |
| `indentSpaces` | `number` | `4` | 字下げボタンで挿入する空白の数 |
| `tableGridSize` | `number` | `20` | 表のサイズ選択のマス目 (縦横) |
| `onImageUpload` | `(file: File) => Promise<string>` | data URL 化 | 画像を保存して URL を返す |
| `pastePlainText` | `boolean` | `true` | 書式付き貼り付けをプレーンテキスト化する |
| `stickyToolbar` | `boolean` | `false` | ツールバーをスクロールに追従させる |
| `hideToolbar` | `boolean` | `false` | ツールバーを表示しない |
| `className` / `style` | | | 編集エリアに付く |
| `rootClassName` / `rootStyle` / `toolbarClassName` | | | 外枠・ツールバーに付く |

`ref` には編集エリアの `HTMLDivElement` が渡ります。

### ツール名 (`ToolName`)

`bold` `italic` `underline` `strikeThrough` `alignLeft` `alignCenter` `alignRight` `unorderedList` `orderedList` `image` `indent` `table` `undo` `redo`

```tsx
import { OpenEditor, ALL_TOOLS } from 'open-doc-editor';

<OpenEditor tools={['bold', 'italic', '|', 'table']} />
<OpenEditor tools={ALL_TOOLS} />
```

### 画像のアップロード

既定では画像を data URL として本文に埋め込みます。ストレージに保存する場合は `onImageUpload` で URL を返してください。

```tsx
<OpenEditor
  onImageUpload={async (file) => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body });
    return (await res.json()).url;
  }}
/>
```

### ツールバーと編集エリアを別々に配置する

`Toolbar` と `EditorArea` を個別に使うと、レイアウトを自由に組めます。

```tsx
'use client';

import { useRef, useState } from 'react';
import { EditorArea, Toolbar } from 'open-doc-editor';

export function CustomLayout() {
  const area = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');
  return (
    <div className="oe-root">
      <header>
        <Toolbar target={area} tools={['bold', 'underline']} />
      </header>
      <EditorArea ref={area} value={html} onChange={setHtml} />
    </div>
  );
}
```

> スタイルの CSS 変数は `.oe-root` に定義しているので、個別に使う場合も親要素に `oe-root` を付けてください。

## スタイルのカスタマイズ

`.oe-root` (または親要素) で CSS 変数を上書きします。ダークモードは `prefers-color-scheme` に追従し、`data-theme="light"` を付けると無効になります。

```css
.my-editor {
  --oe-toolbar-bg: #1f2937;
  --oe-toolbar-ink: #f9fafb;
  --oe-bg: #ffffff;
  --oe-min-height: 20em;
  --oe-sticky-top: 64px;
}
```

主な変数: `--oe-bg` `--oe-ink` `--oe-muted` `--oe-line` `--oe-line-strong` `--oe-focus` `--oe-toolbar-bg` `--oe-toolbar-ink` `--oe-radius` `--oe-min-height` `--oe-sticky-top` `--oe-font`

挿入される表は `<table class="oe-table">`、画像は `<div class="oe-img"><img></div>` です。表示側でも `styles.css` を読み込めば同じ見た目になります。

## セキュリティ

`onChange` で返る HTML はブラウザ上の DOM そのものです。**保存・表示する前に必ずサーバー側でサニタイズしてください** (例: [sanitize-html](https://www.npmjs.com/package/sanitize-html))。

## 開発

```bash
npm install
npm run build        # dist/ に ESM・CJS・型定義・styles.css を出力
npm run dev          # ウォッチビルド

cd example
npm install
npm run dev          # http://localhost:3002 でサンプルを確認
```

ライブラリを変更したら `npm run build` してからサンプルを再起動してください。

## 補足

編集操作には `document.execCommand` を使っています。非推奨扱いの API ですが、主要ブラウザでは引き続き動作します。

## License

MIT
