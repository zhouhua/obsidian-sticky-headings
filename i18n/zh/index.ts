import type { Translation } from '../i18n-types';

const zh: Translation = {
  setting: {
    mode: {
      title: '模式',
      description: '默认情况下，显示当前标题、父标题和父标题的兄弟标题。简洁模式下，仅显示当前标题和父标题。',
      default: '默认',
      concise: '简洁',
    },
    max: {
      title: '显示数量限制',
      description: '最大显示标题数量，0 表示不限制。',
    },
    scrollBehaviour: {
      title: '滚动效果',
      description: '选择滚动效果',
      smooth: '平滑滚动',
      instant: '即时滚动',
    },
  },
};

export default zh;
