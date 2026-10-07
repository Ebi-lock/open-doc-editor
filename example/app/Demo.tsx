'use client';

import { useState } from 'react';
import { ALL_TOOLS, OpenEditor } from 'open-doc-editor';

export function Demo() {
  const [html, setHtml] = useState('<p>ここに文章を入力してください。</p>');

  return (
    <>
      <OpenEditor value={html} onChange={setHtml} tools={ALL_TOOLS} placeholder="本文を入力" stickyToolbar />
      <h2>value (innerHTML)</h2>
      <pre>{html}</pre>
    </>
  );
}
