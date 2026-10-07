import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { EditorArea, type EditorAreaProps } from './EditorArea';
import { Toolbar, type ToolbarProps } from './Toolbar';

export interface OpenEditorProps extends EditorAreaProps, Omit<ToolbarProps, 'target' | 'className' | 'disabled'> {
  // ツールバーをスクロールに追従させる
  stickyToolbar?: boolean;
  // ツールバーを表示しない (readOnly の時も表示しない)
  hideToolbar?: boolean;
  // 外側の要素の class / style。className / style は編集エリアに付く
  rootClassName?: string;
  rootStyle?: CSSProperties;
  toolbarClassName?: string;
}

// ツールバーと編集エリアを組み合わせたエディタ。値は innerHTML の文字列で受け渡しする
export const OpenEditor = forwardRef<HTMLDivElement, OpenEditorProps>(function OpenEditor(
  {
    tools,
    labels,
    indentSpaces,
    tableGridSize,
    onImageUpload,
    stickyToolbar = false,
    hideToolbar = false,
    rootClassName,
    rootStyle,
    toolbarClassName,
    ...areaProps
  },
  forwardedRef,
) {
  const area = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => area.current!, []);

  const classes = ['oe-root', stickyToolbar && 'oe-sticky', rootClassName].filter(Boolean).join(' ');

  return (
    <div className={classes} style={rootStyle}>
      {!hideToolbar && !areaProps.readOnly && (
        <Toolbar
          target={area}
          tools={tools}
          labels={labels}
          indentSpaces={indentSpaces}
          tableGridSize={tableGridSize}
          onImageUpload={onImageUpload}
          className={toolbarClassName}
        />
      )}
      <EditorArea ref={area} {...areaProps} />
    </div>
  );
});
