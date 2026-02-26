import enUS from '../en-US/scenes';

// Scenes translations - Korean
export default {
  scenes: {
    ...enUS.scenes,
    title: '장면 라이브러리',
    subtitle: '소설의 장면 관리',
    addScene: '장면 추가',
    importScenes: '장면 가져오기',
    sceneName: '장면 이름',
    name: '장면 이름',
    description: '설명',
    descriptionLabel: '설명',
    setting: '설정',
    settingPlaceholder: '예: 실내, 밤, 촛불...',
    settingTip: '먼저 장면 설명을 입력하세요',
    noScenes: '장면이 없습니다',
    noScenesTip: '"AI 장면 분석"을 클릭하여 자동 추출하거나 "생성"을 클릭하여 수동으로 추가하세요',
    noImage: '장면 이미지 없음',
    generateImage: '장면 이미지 생성',
    generateAllImages: '모든 장면 이미지 생성',
    generateSetting: 'AI 환경 설정 생성',
    deleteAll: '현재 소설의 모든 장면 삭제',
    deleteAllTitle: '모든 장면 삭제',
    deleteAllConfirm: '경고: 이 작업은 되돌릴 수 없습니다. 이 소설의 모든 장면 데이터가 삭제됩니다!',
    searchScenes: '장면 검색...',
    namePlaceholder: '예: 샤오가 대문',
    parseScenes: 'AI 장면 분석',
    parseScenesTip: 'AI가 소설 내용을 분석하고 장면 정보를 자동으로 추출합니다. 계속하시겠습니까?',
    promptLabel: '생성 프롬프트',
    regenerate: '재생성',
  },
};
