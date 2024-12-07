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
    theme: {
      title: '外观主题',
    },
    indicators: {
      title: '显示标题图标',
      description: '是否展示标题级别图标',
    },
    autoShowFileName: {
      title: '自动显示文件名',
      description:
        '开启后，如果笔记的第一个标题不是唯一最高级标题，则会额外添加一个以文件名为标题的最高级标题，以达到更好的文档大纲效果。',
    },
    showInStatusBar: '在状态栏显示',
  },
};

export default zh;
