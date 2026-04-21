"use client";

import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, ShieldCheck, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { IProduct, ITraceabilityRecord } from '@/types/database';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [traceRecords, setTraceRecords] = useState<ITraceabilityRecord[]>([]);
  const [showSecurityNotice, setShowSecurityNotice] = useState(false);

  useEffect(() => {
    // 模拟从 API 获取数据
    const mockProduct: IProduct = {
      id: 'p1',
      name: '高原特产牦牛肉',
      category: 'livestock',
      description: '产自海拔 4500 米以上的那曲高原，纯天然牧养，肉质紧实，鲜嫩可口。',
      unitPrice: 15800,
      unit: '斤',
      images: ['https://images.unsplash.com/photo-1582030000000-000000000000?auto=format&fit=crop&q=80&w=1200'],
      standard: '绿色有机认证',
      origin: '青海省·那曲高原纯净牧场'
    };
    
    const mockRecords: ITraceabilityRecord[] = [
      {
        id: 'r1',
        productId: 'p1',
        farmerId: 'f1',
        farmerName: '牧民 索南',
        mediaFiles: [{ url: 'https://images.unsplash.com/photo-1594914104206-81673966580e?auto=format&fit=crop&q=80&w=800', type: 'image' }],
        location: { latitude: 35.1, longitude: 92.5, address: '青海省玉树州治多县索加乡', timestamp: Date.now() },
        remark: '今日天气晴朗，牧场草质茂盛，牦牛群正在水源附近进食，状态良好。',
        timestamp: Date.now(),
        status: 'approved'
      },
      {
        id: 'r2',
        productId: 'p1',
        farmerId: 'f1',
        farmerName: '牧民 索南',
        mediaFiles: [{ url: 'https://images.unsplash.com/photo-1518491755924-dfb3428ceae1?auto=format&fit=crop&q=80&w=800', type: 'image' }],
        location: { latitude: 35.2, longitude: 92.6, address: '那曲高原核心保护区', timestamp: Date.now() - 86400000 },
        remark: '常规体检记录：牛群已完成季度疫苗接种，体型匀称，生长指标符合标准。',
        timestamp: Date.now() - 86400000,
        status: 'approved'
      }
    ];

    setProduct(mockProduct);
    setTraceRecords(mockRecords);
  }, []);

  if (!product) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-32">
      {/* 1. Hero 区域 */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={product.images[0]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex gap-3 mb-4">
            <div className="bg-accent px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <Award size={14} className="text-black font-bold" />
              <span className="text-[10px] font-black text-black uppercase tracking-wider">大学生严选</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1 rounded-full text-[10px] font-bold text-white tracking-wider">
              地理标志保护产品
            </div>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-2">{product.name}</h1>
          <p className="text-white/70 text-sm font-medium">产地：{product.origin}</p>
        </div>
      </div>

      {/* 2. 价格条 */}
      <div className="flex justify-between items-center p-8 bg-gray-50 border-b border-gray-100">
        <div className="flex items-baseline gap-1">
          <span className="text-red-600 font-bold text-xl">¥</span>
          <span className="text-red-600 font-black text-5xl tracking-tighter">{product.unitPrice / 100}</span>
          <span className="text-gray-400 text-sm font-bold ml-1">/{product.unit}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-md border border-primary/20">顺丰包邮</span>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-md border border-primary/20">产地直发</span>
        </div>
      </div>

      {/* 3. 故事轴 Timeline */}
      <div className="p-8">
        <header className="mb-10 flex flex-col gap-1">
          <h2 className="text-3xl font-black text-black tracking-tight">成长故事轴</h2>
          <p className="text-gray-400 font-bold text-sm">每一刻的真实记录 · APPROVED BY BLOCKCHAIN</p>
        </header>

        <div className="space-y-12">
          {traceRecords.map((item, index) => (
            <div key={item.id} className="flex gap-6 group">
              {/* 左侧时间线 */}
              <div className="flex flex-col items-center">
                <div className="text-center mb-2">
                  <span className="text-lg font-black block leading-none">
                    {new Date(item.timestamp).getDate()}
                  </span>
                  <span className="text-[10px] text-gray-400 font-black uppercase">
                    {new Date(item.timestamp).getMonth() + 1}月
                  </span>
                </div>
                <div className="flex-1 w-0.5 bg-gray-100 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm ring-4 ring-primary/5" />
                </div>
              </div>

              {/* 右侧内容卡片 */}
              <div className="flex-1 pb-10">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-50">
                  <div className="bg-black text-white px-6 py-3 flex items-center gap-2">
                    <MapPin size={12} className="text-primary" />
                    <span className="text-[10px] font-bold tracking-wide truncate">{item.location.address}</span>
                  </div>
                  
                  <div className="aspect-square relative overflow-hidden">
                    {item.mediaFiles[0].type === 'image' ? (
                      <img 
                        src={item.mediaFiles[0].url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <video src={item.mediaFiles[0].url} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="p-8">
                    <p className="text-gray-800 text-lg leading-relaxed font-medium mb-6">{item.remark}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" className="w-full h-full" />
                        </div>
                        <span className="text-xs font-black text-gray-400">记录人：{item.farmerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-primary">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">已验证</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 底部工具栏 */}
      <div className="fixed bottom-8 left-8 right-8 z-50">
        <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-2xl rounded-full shadow-2xl border border-white/50">
          <button 
            onClick={() => setShowSecurityNotice(true)}
            className="flex-1 h-16 bg-primary text-white rounded-full font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            <Phone size={20} />
            <span>联系牧民</span>
          </button>
          <button 
            onClick={() => setShowSecurityNotice(true)}
            className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center active:scale-95 transition-all"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* 安全提示弹窗 */}
      <AnimatePresence>
        {showSecurityNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecurityNotice(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 w-full relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-black mb-6 text-center">安全交易提示</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 text-center">
                该交易为线下直接撮合，平台仅提供源头溯源信息，不参与资金流转。请务必确认货品后再付款，注意个人财产安全。
              </p>
              <button 
                onClick={() => {
                  setShowSecurityNotice(false);
                  window.location.href = 'tel:13800000000';
                }}
                className="w-full h-16 bg-primary text-white rounded-full font-black text-lg shadow-xl shadow-primary/20"
              >
                我知道了，继续联系
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
