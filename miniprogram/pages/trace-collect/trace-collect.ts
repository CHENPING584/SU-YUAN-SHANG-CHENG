import { OfflineUploadManager } from '../../utils/offline-manager';

const recorderManager = wx.getRecorderManager();

Page({
  data: {
    tempMediaList: [] as any[],
    remark: '',
    locationInfo: {} as any,
    isSubmitting: false,
    isRecording: false,
    offlineQueueLength: 0,
    isConnected: true
  },

  onLoad() {
    // 初始化离线管理器
    OfflineUploadManager.init((len) => {
      this.setData({ offlineQueueLength: len });
    });
    this.checkNetwork();
  },

  checkNetwork() {
    wx.getNetworkType({
      success: (res) => {
        this.setData({ isConnected: res.networkType !== 'none' });
      }
    });
    wx.onNetworkStatusChange((res) => {
      this.setData({ isConnected: res.isConnected });
    });
  },

  /**
   * 核心功能：强制实时拍摄
   */
  async captureMedia() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image', 'video'],
        sourceType: ['camera'], // 强制相机，禁止相册
        maxDuration: 30,
        camera: 'back'
      });

      const file = res.tempFiles[0];
      let finalPath = file.tempFilePath;

      // 如果是图片，执行前端压缩
      if (file.fileType === 'image') {
        wx.showLoading({ title: '压缩中...' });
        const compressRes = await wx.compressImage({
          src: finalPath,
          quality: 60 // 压缩质量 60%
        });
        finalPath = compressRes.tempFilePath;
        wx.hideLoading();
      }

      // 静默获取地理位置
      this.updateLocation();

      this.setData({
        tempMediaList: [...this.data.tempMediaList, {
          tempFilePath: finalPath,
          fileType: file.fileType
        }]
      });
    } catch (err) {
      console.error('拍摄失败', err);
    }
  },

  async updateLocation() {
    try {
      const loc = await wx.getLocation({ type: 'gcj02' });
      this.setData({
        locationInfo: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: '正在自动解析地址...', // 实际应调用逆地址解析
          timestamp: Date.now()
        }
      });
    } catch (e) {
      console.error('定位失败', e);
    }
  },

  removeMedia(e: any) {
    const { index } = e.currentTarget.dataset;
    const list = [...this.data.tempMediaList];
    list.splice(index, 1);
    this.setData({ tempMediaList: list });
  },

  /**
   * 语音功能：按住说话
   */
  startVoice() {
    this.setData({ isRecording: true });
    recorderManager.start({ format: 'mp3' });
    wx.vibrateShort({ type: 'medium' });
  },

  endVoice() {
    this.setData({ isRecording: false });
    recorderManager.stop();
    recorderManager.onStop(async (res) => {
      wx.showLoading({ title: '语音转文字...' });
      // 模拟调用语音识别接口
      // 在实际项目中，应使用微信同声传译插件或将 tempFilePath 上传至云函数处理
      setTimeout(() => {
        const mockText = " [语音识别内容：今日牧草长势良好，牦牛精神状态优。]";
        this.setData({
          remark: this.data.remark + mockText
        });
        wx.hideLoading();
      }, 1000);
    });
  },

  onRemarkInput(e: any) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 提交存档：优先在线，失败/断网则离线
   */
  async submitAll() {
    if (this.data.tempMediaList.length === 0) return;

    const recordData = {
      tempMediaList: this.data.tempMediaList,
      remark: this.data.remark,
      location: this.data.locationInfo,
      timestamp: Date.now(),
      productId: 'p1' // 示例 ID
    };

    if (!this.data.isConnected) {
      this.handleOffline(recordData);
      return;
    }

    this.setData({ isSubmitting: true });
    try {
      // 尝试直接上传
      await this.doUpload(recordData);
      wx.showToast({ title: '上传成功', icon: 'success' });
      this.resetPage();
    } catch (err) {
      console.error('在线上传失败，转入离线队列', err);
      this.handleOffline(recordData);
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  handleOffline(data: any) {
    const len = OfflineUploadManager.save(data);
    this.setData({ offlineQueueLength: len });
    wx.showModal({
      title: '已存入离线缓存',
      content: '当前信号较弱，记录已保存。回到有网的地方会自动为您同步。',
      showCancel: false,
      confirmText: '我知道了'
    });
    this.resetPage();
  },

  async doUpload(data: any) {
    // 复用离线管理器的单条上传逻辑（为了保持一致性）
    // 实际生产环境建议将该方法提取为独立的 Service
    return (OfflineUploadManager as any).uploadItem(data);
  },

  resetPage() {
    this.setData({
      tempMediaList: [],
      remark: '',
      locationInfo: {}
    });
  }
});
