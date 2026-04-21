"use client";

import { useState, useEffect, useRef } from 'react';
import { Camera, Mic, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OfflineManager } from '@/utils/offline-manager';
import { motion, AnimatePresence } from 'framer-motion';

export default function TraceCollectPage() {
  const [tempMediaList, setTempMediaList] = useState<any[]>([]);
  const [remark, setRemark] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 初始化离线管理器
    OfflineManager.init((len) => setOfflineQueueLength(len));
    
    // 监听在线状态
    const updateOnlineStatus = () => setIsConnected(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // 监听同步完成事件
    const handleSyncComplete = () => setOfflineQueueLength(0);
    window.addEventListener('offline-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  /**
   * 模拟拍摄采集
   */
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia = Array.from(files).map(file => ({
      tempFilePath: URL.createObjectURL(file),
      fileType: file.type.startsWith('image') ? 'image' : 'video',
      file: file
    }));

    setTempMediaList(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setTempMediaList(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 提交存档
   */
  const handleSubmit = async () => {
    if (tempMediaList.length === 0) return;

    const recordData = {
      tempMediaList: tempMediaList.map(m => ({
        tempFilePath: m.tempFilePath,
        fileType: m.fileType
      })),
      remark,
      timestamp: Date.now(),
      productId: 'p1' // 示例 ID
    };

    if (!isConnected) {
      const len = OfflineManager.save(recordData);
      setOfflineQueueLength(len);
      alert('已存入本地离线缓存，网络恢复后自动同步');
      resetForm();
      return;
    }

    setIsSubmitting(true);
    try {
      // 在线提交逻辑 (模拟 API 调用)
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('上传成功！');
      resetForm();
    } catch (err) {
      const len = OfflineManager.save(recordData);
      setOfflineQueueLength(len);
      alert('上传失败，已转入离线队列');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTempMediaList([]);
    setRemark('');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-24">
      {/* 离线通告栏 */}
      <AnimatePresence>
        {offlineQueueLength > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-orange-50 px-6 py-3 flex items-center gap-3 text-orange-600 text-sm font-medium sticky top-0 z-50 overflow-hidden border-b border-orange-100"
          >
            <AlertCircle size={16} />
            <span>有 {offlineQueueLength} 条记录等待网络恢复后同步</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-black leading-tight">采集溯源信息</h1>
          <p className="text-gray-500 mt-3 text-lg">拍摄实况照片或视频，记录纯净高原</p>
        </header>

        {/* 核心操作：拍摄 */}
        <section className="card">
          <h2 className="text-xl font-bold mb-6 text-gray-800">第一步：拍摄现场</h2>
          <div className="flex flex-wrap gap-4">
            {tempMediaList.map((item, index) => (
              <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm group">
                {item.fileType === 'image' ? (
                  <img src={item.tempFilePath} className="w-full h-full object-cover" />
                ) : (
                  <video src={item.tempFilePath} className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={() => removeMedia(index)}
                  className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[10px] py-1 font-bold"
                >
                  删除
                </button>
              </div>
            ))}
            
            {tempMediaList.length < 3 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 bg-white border-4 border-black rounded-2xl flex flex-col items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Camera size={32} className="mb-1" />
                <span className="text-[12px] font-black uppercase">拍摄</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            capture="environment" // 强制后置摄像头
            onChange={handleCapture}
            multiple
          />
        </section>

        {/* 核心操作：语音描述 */}
        <section className="card">
          <h2 className="text-xl font-bold mb-6 text-gray-800">第二步：说话描述</h2>
          <textarea 
            className="input-field h-40 resize-none mb-6"
            placeholder="描述一下现在的情况（或使用语音输入）"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <button 
            className={`w-full h-16 rounded-full flex items-center justify-center gap-3 text-xl font-bold transition-all ${
              isRecording ? 'bg-primary text-white scale-[0.98]' : 'bg-black text-white'
            }`}
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
          >
            <Mic size={24} />
            <span>{isRecording ? '松开 结束' : '按住 说话'}</span>
          </button>
        </section>

        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={tempMediaList.length === 0 || isSubmitting}
            className="btn-primary w-full h-16 text-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={24} />
                <span>提交存档</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
