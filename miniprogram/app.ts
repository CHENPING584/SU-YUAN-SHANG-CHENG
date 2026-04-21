// app.ts
App<IAppOption>({
  globalData: {
    userInfo: null,
  },
  onLaunch() {
    // 1. 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        // 此处请填入环境 ID, 环境 ID 可打开云开发控制台查看
        // 如不填则使用默认环境（第一个创建的环境）
        env: 'highland-tech-ranch-xxxxxx',
        traceUser: true, // 是否在将用户访问记录到用户管理中，在控制台中可见
      });
    }

    // 2. 获取用户信息（如果需要）
    this.checkUserSession();
  },

  /**
   * 检查用户会话并获取身份
   */
  async checkUserSession() {
    try {
      // 可以在这里调用云函数获取用户的 openid 和角色
      // const { result } = await wx.cloud.callFunction({ name: 'login' });
      // console.log('登录成功', result);
    } catch (err) {
      console.error('登录失败', err);
    }
  }
});

// 定义全局 App 接口
interface IAppOption {
  globalData: {
    userInfo?: wx.UserInfo | null;
  };
  checkUserSession: () => Promise<void>;
}
