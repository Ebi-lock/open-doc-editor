// contentEditable の選択範囲まわりの小さなヘルパー

export function escapeAttr(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// 現在の選択範囲が el の中にあるか
export function isSelectionInside(el: HTMLElement | null): boolean {
  if (!el) return false;
  const node = document.getSelection()?.anchorNode;
  return !!node && el.contains(node);
}

export function saveRange(el: HTMLElement | null): Range | null {
  const selection = document.getSelection();
  if (!el || !selection || selection.rangeCount === 0 || !isSelectionInside(el)) return null;
  return selection.getRangeAt(0).cloneRange();
}

export function restoreRange(range: Range) {
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

// 選択範囲がエディタ外にある時は、エディタにフォーカスしてカーソルを末尾に置く
export function focusEditor(el: HTMLElement) {
  if (isSelectionInside(el)) return;
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  restoreRange(range);
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
