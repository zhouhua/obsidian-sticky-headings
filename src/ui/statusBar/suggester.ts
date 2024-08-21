import type { App } from 'obsidian';
import { FuzzySuggestModal } from 'obsidian';
import type { Heading } from 'src/types';

export class HeadingSuggester extends FuzzySuggestModal<Heading> {
  headings: Heading[];
  onSelect: (heading: Heading) => void;
  constructor(app: App, headings: Heading[], onSelect: (heading: Heading) => void) {
    super(app);
    this.headings = headings;
    this.onSelect = onSelect;
  }

  getItems(): Heading[] {
    return this.headings;
  }

  getItemText(item: Heading): string {
    return item.title;
  }

  onChooseItem(item: Heading): void {
    this.onSelect(item);
  }
}
