import type { App, FuzzyMatch } from 'obsidian';
import { FuzzySuggestModal, setIcon } from 'obsidian';
import type { Heading } from 'src/types';

export class HeadingSuggester extends FuzzySuggestModal<Heading> {
  headings: Heading[];
  onSelect: (heading: Heading) => Promise<void>;
  currentIndex: number;
  constructor(
    app: App,
    headings: Heading[],
    currentIndex: number | undefined,
    onSelect: (heading: Heading) => Promise<void>
  ) {
    super(app);
    this.headings = headings;
    this.onSelect = onSelect;
    this.currentIndex = currentIndex ?? -1;
  }

  getItems(): Heading[] {
    return this.headings;
  }

  getItemText(item: Heading): string {
    const div = createDiv();
    div.innerHTML = item.title;
    const text = div.textContent || '';
    div.remove();
    return text;
  }

  renderSuggestion(item: FuzzyMatch<Heading>, el: HTMLElement): void {
    el.style.paddingLeft = item.item.indentLevel + 'em';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = '8px';
    el.style.flexDirection = 'row';
    if (item.item.index === this.currentIndex) {
      el.style.color = 'var(--text-accent)';
    }
    setIcon(el, 'heading-' + item.item.level);
    const textEl = el.createEl('span');
    textEl.innerHTML = item.item.title;
  }

  onChooseItem(item: Heading): void {
    this.onSelect(item);
  }
}
