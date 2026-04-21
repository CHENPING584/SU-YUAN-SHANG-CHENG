/**
 * OfflineManager.ts (Web 版)
 * 基于 localStorage 实现离线队列管理
 */

const STORAGE_KEY = 'OFFLINE_TRACE_QUEUE';

export class OfflineManager {
  private static isSyncing = false;

  /**
   * 初始化网络状态监听
   */
  static init(onQueueChange?: (length: number) => void) {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('网络已恢复，准备启动后台同步...');
      this.startSync();
    });

    // 初始回调
    if (onQueueChange) {
      onQueueChange(this.getQueue().length);
    }
  }

  static getQueue(): any[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 保存至本地离线队列
   */
  static save(data: any) {
    if (typeof window === 'undefined') return 0;
    const queue = this.getQueue();
    const newItem = {
      ...data,
      offlineId: Date.now() + Math.random().toString(36).substring(7),
      savedAt: Date.now()
    };
    queue.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return queue.length;
  }

  /**
   * 启动同步任务
   */
  static async startSync() {
    if (this.isSyncing || !navigator.onLine) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    console.log(`正在同步 ${queue.length} 条离线数据...`);

    const remaining = [];
    for (const item of queue) {
      try {
        await this.uploadItem(item);
        console.log('离线数据同步成功');
      } catch (err) {
        console.error('单条数据同步失败:', err);
        remaining.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    this.isSyncing = false;

    if (remaining.length === 0) {
      // 成功提示可通过事件或回调通知 UI
      window.dispatchEvent(new CustomEvent('offline-sync-complete'));
    }
  }

  /**
   * 模拟上传接口逻辑
   */
  private static async uploadItem(data: any) {
    // 实际应调用后端 API (fetch /api/trace/upload)
    const response = await fetch('/api/trace/upload', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  }
}
