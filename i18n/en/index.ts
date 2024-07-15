import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
  setting: {
    mode: {
      title: 'Mode',
      description: 'By default, display the current heading, the parent heading, and the siblings of the parent heading. In concise mode, only display the current heading and the parent heading.',
      default: 'Default',
      concise: 'Concise',
    },
    max: {
      title: 'Display quantity limit',
      description: 'Maximum number of headings that can be displayed. 0 indicates no limit.',
    },
    indicators: {
      title: 'Display heading indicators',
      description: 'Toggle to display heading level indicators'
    },
    style: {
        title: 'Style',
        description:
            'Use a simple heading style, or copy in file heading styles',
        simple: 'Simple',
        default: 'Default'
    }
  },
};

export default en;
