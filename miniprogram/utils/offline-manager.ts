/**
 * OfflineUploadManager.ts
 * 负责离线数据持久化、网络状态监听及自动同步
 */

const STORAGE_KEY = 'OFFLINE_TRACE_QUEUE';

export class OfflineUploadManager {
  private static isSyncing = false;

  /**
   * 初始化网络监听
   */
  static init(onQueueChange?: (length: number) => void) {
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected && (res.networkType === '4g' || res.networkType === '5g' || res.networkType === 'wifi')) {
        console.log('检测到优质网络，启动后台自动同步...');
        this.startSync();
      }
    });

    // 初始触发一次回调
    if (onQueueChange) {
      const queue = this.getQueue();
      onQueueChange(queue.length);
    }
  }

  /**
   * 获取当前队列
   */
  static getQueue(): any[] {
    return wx.getStorageSync(STORAGE_KEY) || [];
  }

  /**
   * 添加到离线队列
   */
  static save(data: any) {
    const queue = this.getQueue();
    queue.push({
      ...data,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    });
    wx.setStorageSync(STORAGE_KEY, queue);
    return queue.length;
  }

  /**
   * 启动自动同步
   */
  static async startSync() {
    if (this.isSyncing) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    const remaining = [];

    for (const item of queue) {
      try {
        await this.uploadItem(item);
        console.log('同步成功一条离线数据');
      } catch (err) {
        console.error('同步失败，保留在队列:', err);
        remaining.push(item);
      }
    }

    wx.setStorageSync(STORAGE_KEY, remaining);
    this.isSyncing = false;

    if (remaining.length === 0) {
      wx.showToast({ title: '离线记录已同步', icon: 'success' });
    }
  }

  /**
   * 单条上传逻辑 (内部调用)
   */
  private static async uploadItem(data: any) {
    // 1. 上传图片/视频
    const uploadTasks = data.tempMediaList.map((file: any) => {
      const ext = file.fileType === 'image' ? 'jpg' : 'mp4';
      return wx.cloud.uploadFile({
        cloudPath: `trace/${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`,
        filePath: file.tempFilePath
      });
    });

    const results = await Promise.all(uploadTasks);
    const mediaFiles = results.map((res, i) => ({
      fileId: res.fileID,
      type: data.tempMediaList[i].fileType
    }));

    // 2. 写入数据库
    return wx.cloud.callFunction({
      name: 'manageTraceability',
      data: {
        action: 'uploadRecord',
        data: {
          ...data,
          mediaFiles
        }
      }
    });
  }
}
