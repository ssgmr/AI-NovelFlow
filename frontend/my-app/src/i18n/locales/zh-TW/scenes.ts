// 繁体中文场景库翻译 - 继承自简体中文
import zhCN from '../zh-CN/scenes';

export default {
  scenes: {
    ...zhCN.scenes,
    title: '場景庫',
    subtitle: '管理小說中的場景',
    addScene: '新增場景',
    importScenes: '匯入場景',
    sceneName: '場景名稱',
    name: '場景名稱',
    description: '場景描述',
    descriptionLabel: '描述',
    setting: '環境設定',
    settingPlaceholder: '如：室內、夜晚、燭光...',
    settingTip: '請先填寫場景描述',
    noScenes: '暫無場景',
    noScenesTip: '點擊「AI解析場景」自動提取場景，或點擊「建立」手動新增',
    noImage: '無場景圖',
    generateImage: '產生場景圖',
    generateAllImages: '產生所有場景圖',
    generateSetting: 'AI生成環境設定',
    deleteAll: '刪除當前小說所有場景',
    deleteAllTitle: '刪除所有場景',
    deleteAllConfirm: '警告：此操作不可恢復，將刪除該小說下的所有場景資料！',
    searchScenes: '搜尋場景...',
    namePlaceholder: '如：蕭家大院',
    parseScenes: 'AI解析場景',
    parseScenesTip: '將使用 AI 分析小說內容並自動提取場景資訊，是否繼續？',
    promptLabel: '生成提示詞',
    regenerate: '重新生成',
  },
};
