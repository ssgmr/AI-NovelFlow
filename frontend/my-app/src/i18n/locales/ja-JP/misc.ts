import enUS from '../en-US/misc';

// HTTP status and other translations - Japanese
export default {
  status: {
    pending: '保留中',
    processing: '処理中',
    completed: '完了',
    failed: '失敗',
    parsing: '解析中',
    generatingCharacters: 'キャラクター生成中',
    generatingShots: 'ショット生成中',
    generatingVideos: '動画生成中',
    compositing: '合成中',
  },

  http: {
    ...enUS.http,
    400: 'リクエストパラメータエラー',
    401: '未認証、再度ログインしてください',
    403: 'アクセス拒否',
    404: 'リソースが見つかりません',
    500: 'サーバー内部エラー',
    502: 'ゲートウェイエラー',
    503: 'サービス利用不可',
    networkError: 'ネットワークエラー、接続を確認してください',
    timeout: 'リクエストタイムアウト',
  },

  coffee: {
    ...enUS.coffee,
    buyMeACoffee: 'コーヒーを買ってください',
    title: 'コーヒーを買ってください',
    message: '創作は簡単ではありません。このプロジェクトがお役に立てば、サポートしていただけると幸いです！心から感謝いたします！これは私がこのプロジェクトの開発を続けるための大きな原動力となります！',
    wechatPay: 'WeChat Pay',
    alipay: 'Alipay',
    thankYou: 'ご支援ありがとうございます！',
    contactMe: '連絡先',
  },
};
