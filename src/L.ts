import type { Locales } from '../i18n/i18n-types';
import { i18n } from '../i18n/i18n-util';
import { loadAllLocales } from '../i18n/i18n-util.sync';

loadAllLocales();

declare global {
  interface Window {
    i18next: {
      language: string;
    };
  }
}

let locale: Locales = 'en';
try {
  locale = (window.i18next.language || '').startsWith('zh') ? 'zh' : 'en';
}
catch (e) {
  /* empty */
}

const L = i18n()[locale];

export default L;
