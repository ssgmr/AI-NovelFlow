import enUS from '../en-US/misc';

// HTTP status and other translations - Korean
export default {
  http: {
    ...enUS.http,
    400: '잘못된 요청',
    401: '인증되지 않음, 다시 로그인하세요',
    403: '접근 금지',
    404: '리소스를 찾을 수 없음',
    500: '낶부 서버 오류',
    502: '게이트웨이 오류',
    503: '서비스를 사용할 수 없음',
    networkError: '네트워크 오류, 연결을 확인하세요',
    timeout: '요청 시간 초과',
  },

  coffee: {
    ...enUS.coffee,
    buyMeACoffee: '커피 한 잔 사주세요',
    title: '커피 한 잔 사주세요',
    message: '창작은 쉽지 않습니다. 이 프로젝트가 도움이 되셨다면 후원해 주시면 감사하겠습니다! 진심으로 감사드립니다! 이는 제가 이 프로젝트를 계속 개발하는데 더 큰 동기가 될 것입니다!',
    wechatPay: 'WeChat Pay',
    alipay: 'Alipay',
    thankYou: '후원해 주셔서 감사합니다!',
    contactMe: '연락처',
  },
};
