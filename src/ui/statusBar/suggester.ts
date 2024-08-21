import type { App, FuzzyMatch, SearchMatchPart } from 'obsidian';
import { FuzzySuggestModal, setIcon } from 'obsidian';
import type { Heading } from 'src/types';

function hightlight(text: string, matches: SearchMatchPart[]) {
  if (!matches.length) return text;
  let newString = '';
  for (let i = 0; i < matches.length; i++) {
    const [start, end] = matches[i];
    newString += text.slice(i === 0 ? 0 : matches[i - 1][1], start);
    newString += `<mark>${text.slice(start, end)}</mark>`;
    newString += text.slice(end, i === matches.length - 1 ? text.length : matches[i + 1][0]);
  }
  return newString;
}

export class HeadingSuggester extends FuzzySuggestModal<Heading> {
  headings: Heading[];
  onSelect: (heading: Heading) => void;
  currentIndex: number;
  constructor(app: App, headings: Heading[], currentIndex: number | undefined, onSelect: (heading: Heading) => void) {
    super(app);
    this.headings = headings;
    this.onSelect = onSelect;
    this.currentIndex = currentIndex ?? -1;
  }

  getItems(): Heading[] {
    return this.headings;
  }

  getItemText(item: Heading): string {
    return item.title;
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
    textEl.innerHTML = hightlight(item.item.title, item.match.matches);
  }

  onChooseItem(item: Heading): void {
    this.onSelect(item);
  }
}
