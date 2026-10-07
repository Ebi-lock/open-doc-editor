import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { escapeAttr, focusEditor, isSelectionInside, readAsDataUrl, restoreRange, saveRange } from './dom';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ImageIcon,
  IndentIcon,
  ListIcon,
  OrderedListIcon,
  RedoIcon,
  TableIcon,
  UndoIcon,
} from './icons';

export type ToolName =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'unorderedList'
  | 'orderedList'
  | 'image'
  | 'indent'
  | 'table'
  | 'undo'
  | 'redo';

// '|' はグループの区切り
export type ToolbarItem = ToolName | '|';

export const DEFAULT_TOOLS: ToolbarItem[] = [
  'bold',
  'underline',
  '|',
  'alignLeft',
  'alignCenter',
  'alignRight',
  '|',
  'image',
  'indent',
  'table',
];

export const ALL_TOOLS: ToolbarItem[] = [
  'undo',
  'redo',
  '|',
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  '|',
  'alignLeft',
  'alignCenter',
  'alignRight',
  '|',
  'unorderedList',
  'orderedList',
  '|',
  'image',
  'indent',
  'table',
];

export const DEFAULT_LABELS: Record<ToolName, string> = {
  bold: '太字',
  italic: '斜体',
  underline: '下線',
  strikeThrough: '取り消し線',
  alignLeft: '左寄せ',
  alignCenter: '中央寄せ',
  alignRight: '右寄せ',
  unorderedList: '箇条書き',
  orderedList: '番号付きリスト',
  image: '画像を挿入',
  indent: '字下げ',
  table: '表を挿入',
  undo: '元に戻す',
  redo: 'やり直す',
};

// document.execCommand で処理するボタン。state: true のものは押下状態を表示する
const COMMANDS: Partial<Record<ToolName, { command: string; icon: ReactNode; state?: boolean }>> = {
  bold: { command: 'bold', icon: <b>B</b>, state: true },
  italic: { command: 'italic', icon: <i>I</i>, state: true },
  underline: { command: 'underline', icon: <u>U</u>, state: true },
  strikeThrough: { command: 'strikeThrough', icon: <s>S</s>, state: true },
  alignLeft: { command: 'justifyLeft', icon: <AlignLeftIcon />, state: true },
  alignCenter: { command: 'justifyCenter', icon: <AlignCenterIcon />, state: true },
  alignRight: { command: 'justifyRight', icon: <AlignRightIcon />, state: true },
  unorderedList: { command: 'insertUnorderedList', icon: <ListIcon />, state: true },
  orderedList: { command: 'insertOrderedList', icon: <OrderedListIcon />, state: true },
  undo: { command: 'undo', icon: <UndoIcon /> },
  redo: { command: 'redo', icon: <RedoIcon /> },
};

export interface ToolbarProps {
  // 操作対象の編集エリア (EditorArea の ref)
  target: RefObject<HTMLElement | null>;
  tools?: ToolbarItem[];
  labels?: Partial<Record<ToolName, string>>;
  // 字下げボタンで挿入する空白の数
  indentSpaces?: number;
  // 表のサイズ選択のマス目の数 (縦横)
  tableGridSize?: number;
  // 画像を保存して URL を返す。省略時は data URL として本文に埋め込む
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
}

// 書式ツールバー
export function Toolbar({
  target,
  tools = DEFAULT_TOOLS,
  labels,
  indentSpaces = 4,
  tableGridSize = 20,
  onImageUpload = readAsDataUrl,
  disabled = false,
  className,
}: ToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const tableWrap = useRef<HTMLDivElement>(null);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [gridHover, setGridHover] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<ReadonlySet<ToolName>>(new Set());
  const label = (name: ToolName) => labels?.[name] ?? DEFAULT_LABELS[name];

  const closeTableGrid = () => {
    setShowTableGrid(false);
    setGridHover(null);
  };

  // カーソル位置の書式をボタンの押下状態に反映する
  useEffect(() => {
    const update = () => {
      if (!isSelectionInside(target.current)) return;
      const next = new Set<ToolName>();
      for (const [name, def] of Object.entries(COMMANDS)) {
        if (def?.state && document.queryCommandState(def.command)) next.add(name as ToolName);
      }
      setActive((prev) => (prev.size === next.size && [...next].every((n) => prev.has(n)) ? prev : next));
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, [target]);

  // 表のサイズ選択は、外側をクリックするか Esc で閉じる (マウスが離れただけでは閉じない)
  useEffect(() => {
    if (!showTableGrid) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!tableWrap.current?.contains(e.target as Node)) closeTableGrid();
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && closeTableGrid();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showTableGrid]);

  const exec = (command: string, arg?: string) => {
    const el = target.current;
    if (!el || disabled) return;
    focusEditor(el);
    document.execCommand(command, false, arg);
  };

  const insertHtml = (html: string, range: Range | null = null) => {
    const el = target.current;
    if (!el) return;
    if (range) {
      el.focus();
      restoreRange(range);
    }
    exec('insertHTML', html);
  };

  const onImageSelected = async (file: File | undefined) => {
    if (!file) return;
    const range = savedRange.current;
    const src = await onImageUpload(file);
    insertHtml(`<div class="oe-img"><img src="${escapeAttr(src)}" alt=""></div><p><br></p>`, range);
  };

  const insertTable = (cols: number, rows: number) => {
    const row = `<tr>${'<td><br></td>'.repeat(cols)}</tr>`;
    insertHtml(`<table class="oe-table"><tbody>${row.repeat(rows)}</tbody></table><p><br></p>`);
    closeTableGrid();
  };

  // ボタン押下でエディタのフォーカス・選択範囲が外れないようにする
  const keepSelection = (e: MouseEvent) => e.preventDefault();

  const renderTool = (name: ToolName) => {
    const def = COMMANDS[name];
    if (def) {
      return (
        <button
          key={name}
          type="button"
          disabled={disabled}
          onMouseDown={keepSelection}
          onClick={() => exec(def.command)}
          title={label(name)}
          aria-label={label(name)}
          aria-pressed={def.state ? active.has(name) : undefined}
        >
          {def.icon}
        </button>
      );
    }
    if (name === 'image') {
      return (
        <button
          key={name}
          type="button"
          disabled={disabled}
          onMouseDown={keepSelection}
          onClick={() => {
            savedRange.current = saveRange(target.current);
            fileInput.current?.click();
          }}
          title={label(name)}
          aria-label={label(name)}
        >
          <ImageIcon />
        </button>
      );
    }
    if (name === 'indent') {
      return (
        <button
          key={name}
          type="button"
          disabled={disabled || indentSpaces <= 0}
          onMouseDown={keepSelection}
          onClick={() => exec('insertText', ' '.repeat(indentSpaces))}
          title={label(name)}
          aria-label={label(name)}
        >
          <IndentIcon />
        </button>
      );
    }
    return (
      <div key={name} className="oe-tableWrap" ref={tableWrap}>
        <button
          type="button"
          disabled={disabled}
          onMouseDown={keepSelection}
          onClick={() => (showTableGrid ? closeTableGrid() : setShowTableGrid(true))}
          title={label(name)}
          aria-label={label(name)}
          aria-expanded={showTableGrid}
        >
          <TableIcon />
        </button>
        {showTableGrid && (
          <div className="oe-tableGrid" onMouseDown={keepSelection}>
            <div className="oe-tableGridLabel">{gridHover ? `${gridHover.x + 1} × ${gridHover.y + 1}` : label('table')}</div>
            <div
              className="oe-tableGridCells"
              style={{ gridTemplateColumns: `repeat(${tableGridSize}, 14px)` }}
              onMouseLeave={() => setGridHover(null)}
            >
              {Array.from({ length: tableGridSize * tableGridSize }, (_, i) => {
                const x = i % tableGridSize;
                const y = Math.floor(i / tableGridSize);
                return (
                  <div
                    key={i}
                    className={gridHover && x <= gridHover.x && y <= gridHover.y ? 'oe-tableGridCell isActive' : 'oe-tableGridCell'}
                    onMouseEnter={() => setGridHover({ x, y })}
                    onClick={() => insertTable(x + 1, y + 1)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // '|' ごとにグループへ分ける
  const groups: ToolName[][] = [[]];
  for (const item of tools) {
    if (item === '|') groups.push([]);
    else groups[groups.length - 1].push(item);
  }

  return (
    <div className={className ? `oe-toolbar ${className}` : 'oe-toolbar'} role="toolbar" aria-label="書式ツールバー">
      {tools.includes('image') && (
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void onImageSelected(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      )}
      {groups
        .filter((group) => group.length > 0)
        .map((group, i) => (
          <div key={i} className="oe-toolGroup" role="group">
            {group.map(renderTool)}
          </div>
        ))}
    </div>
  );
}
