import Link from 'next/link';
import { Leaf, ScanLine, Camera } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Leaf size={48} className="text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">高原科技牧场</h1>
        <p className="text-lg text-gray-500 font-medium">每一份纯净的高原馈赠 · Web 版溯源系统</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* 农户端入口 */}
        <Link href="/trace-collect" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Camera size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">我是农户 (供给端)</h2>
            <p className="text-gray-500 leading-relaxed">
              进入溯源信息采集系统。支持弱网离线缓存、拍摄自动定位、语音描述转换。
            </p>
          </div>
        </Link>

        {/* 消费者端入口 */}
        <Link href="/product-detail?id=p1" className="group">
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ScanLine size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">我是消费者 (需求端)</h2>
            <p className="text-gray-500 leading-relaxed">
              扫码查看产品溯源档案。体验故事化成长轴、地理标志保护、以及源头直联服务。
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-16 text-sm text-gray-400 font-medium">
        Powered by Next.js 14 & Tailwind CSS
      </div>
    </main>
  );
}
