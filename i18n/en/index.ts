import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
  setting: {
    mode: {
      title: 'Mode',
      description:
        'By default, display the current heading, the parent heading, and the siblings of the parent heading. In concise mode, only display the current heading and the parent heading.',
      default: 'Default',
      concise: 'Concise',
      disable: 'Disable',
    },
    max: {
      title: 'Display quantity limit',
      description: 'Maximum number of headings that can be displayed. 0 indicates no limit.',
    },
    scrollBehaviour: {
      title: 'Scroll behaviour',
      description: 'Choose between instant or smooth scrolling behaviour',
      smooth: 'Smooth',
      instant: 'Instant',
    },
    theme: {
      title: 'Theme',
    },
    indicators: {
      title: 'Display heading indicators',
      description: 'Toggle to display heading level indicators',
    },
    autoShowFileName: {
      title: 'Auto show file name',
      description:
        'When enabled, if the first heading in the note is not the unique highest-level title, an additional title with the filename as the highest-level title will be added to achieve a better document outline.',
    },
    showInStatusBar: 'Show in status bar',
  },
};

export default en;
