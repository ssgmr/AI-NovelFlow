// 繁体中文HTTP状态和其他翻译 - 继承自简体中文
import zhCN from '../zh-CN/misc';

export default {
  http: {
    ...zhCN.http,
    400: '請求參數錯誤',
    401: '未授權，請重新登入',
    403: '拒絕存取',
    404: '請求的資源不存在',
    500: '伺服器內部錯誤',
    502: '閘道器錯誤',
    503: '服務不可用',
    networkError: '網路錯誤，請檢查網路連線',
    timeout: '請求逾時',
  },

  coffee: {
    ...zhCN.coffee,
    buyMeACoffee: '請我喝咖啡',
    title: '請我喝咖啡',
    message: '創作不易，如果您覺得這個專案對您有幫助，希望您能打賞一二！本人感激不盡！這將為我繼續開發這個專案提供更大的動力！',
    wechatPay: '微信支付',
    alipay: '支付寶',
    thankYou: '感謝您的支持！',
    contactMe: '聯絡方式',
  },
};
