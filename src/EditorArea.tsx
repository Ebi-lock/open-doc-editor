import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type CSSProperties } from 'react';

export interface EditorAreaProps {
  // 制御コンポーネントとして使う時の値 (innerHTML)
  value?: string;
  // 非制御で使う時の初期値 (innerHTML)
  defaultValue?: string;
  // 入力のたびに、編集エリアの innerHTML を返す
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  // true (既定): 書式付きの貼り付けを受け付けず、プレーンテキストとして挿入する
  pastePlainText?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-label'?: string;
}

// 中身を全部消した時に残る <br> や空の <p> は空文字として扱う
function readHtml(el: HTMLElement): string {
  return el.textContent === '' && !el.querySelector('img,table,hr') ? '' : el.innerHTML;
}

// 入力中にカーソルが飛ばないよう、値が DOM と異なる時だけ DOM を書き換える。
export const EditorArea = forwardRef<HTMLDivElement, EditorAreaProps>(function EditorArea(
  {
    value,
    defaultValue = '',
    onChange,
    placeholder,
    readOnly = false,
    pastePlainText = true,
    className,
    style,
    id,
    'aria-label': ariaLabel,
  },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value ?? defaultValue);
  useImperativeHandle(forwardedRef, () => ref.current!, []);

  // 非制御: 初回だけ初期値を流し込む
  useLayoutEffect(() => {
    if (value === undefined && ref.current) {
      ref.current.innerHTML = defaultValue;
      ref.current.toggleAttribute('data-empty', readHtml(ref.current) === '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 制御: 外から値が変わった時だけ DOM に反映する
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || value === undefined) return;
    if (readHtml(el) !== value) el.innerHTML = value;
    lastEmitted.current = value;
    el.toggleAttribute('data-empty', readHtml(el) === '');
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const html = readHtml(el);
    el.toggleAttribute('data-empty', html === '');
    if (html === lastEmitted.current) return;
    lastEmitted.current = html;
    onChange?.(html);
  };

  return (
    <div
      ref={ref}
      id={id}
      className={className ? `oe-area ${className}` : 'oe-area'}
      style={style}
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      aria-readonly={readOnly || undefined}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={emit}
      onBlur={emit}
      onFocus={() => {
        // 改行時の段落を <div> ではなく <p> にする
        document.execCommand('defaultParagraphSeparator', false, 'p');
      }}
      onPaste={(e) => {
        if (!pastePlainText) return;
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
    />
  );
});
