function getScrollHeight(element: HTMLTextAreaElement): void {
  const savedValue = element.value;
  element.value = "";
  element.dataset.baseScrollHeight = String(element.scrollHeight);
  element.value = savedValue;
}

export function onExpandableTextareaInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement) || !target.classList.contains("auto_expand")) return;

  const minRows = Number.parseInt(target.dataset.minRows ?? "0", 10) || 0;
  if (!target.dataset.baseScrollHeight) getScrollHeight(target);
  const baseScrollHeight = Number(target.dataset.baseScrollHeight);
  target.rows = minRows;
  const additionalRows = Math.ceil((target.scrollHeight - baseScrollHeight) / 24);
  target.rows = minRows + Math.max(0, additionalRows);
}
