// pages/product-detail/product-detail.ts
import { IProduct } from '../../typings/database';

Page({
  data: {
    productId: '',
    product: {} as IProduct,
    traceRecords: [] as any[],
    offset: 0,
    limit: 5,
    hasMore: true,
    isLoading: false,
    showSecurityNotice: false,
    pendingAction: '' as 'phone' | 'wechat' | ''
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      this.setData({ productId: id });
      this.fetchProductDetail(id);
      this.loadMore(); // 初始化加载第一页
    }
  },

  async fetchProductDetail(productId: string) {
    const db = wx.cloud.database();
    const res = await db.collection('products').doc(productId).get();
    this.setData({ product: res.data as IProduct });
  },

  /**
   * 分页加载溯源记录
   */
  async loadMore() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({ isLoading: true });
    try {
      const { result }: any = await wx.cloud.callFunction({
        name: 'manageTraceability',
        data: {
          action: 'getTraceRecords',
          data: {
            productId: this.data.productId,
            offset: this.data.offset,
            limit: this.data.limit
          }
        }
      });

      if (result.code === 0) {
        const newRecords = result.data.map((item: any) => {
          const d = new Date(item.timestamp);
          return {
            ...item,
            displayDate: `${d.getMonth() + 1}月${d.getDate()}日`,
            displayTime: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
          };
        });

        this.setData({
          traceRecords: [...this.data.traceRecords, ...newRecords],
          offset: this.data.offset + newRecords.length,
          hasMore: newRecords.length === this.data.limit,
          isLoading: false
        });
      }
    } catch (err) {
      console.error('加载失败', err);
      this.setData({ isLoading: false });
    }
  },

  previewImage(e: any) {
    const { current, list } = e.currentTarget.dataset;
    const urls = list.filter((m: any) => m.type === 'image').map((m: any) => m.fileId);
    wx.previewImage({ current, urls });
  },

  /**
   * 联系农户：触发安全提示
   */
  contactAction(e: any) {
    const { type } = e.currentTarget.dataset;
    this.setData({
      pendingAction: type,
      showSecurityNotice: true
    });
  },

  closeNotice() {
    this.setData({ showSecurityNotice: false });
  },

  doContact() {
    const type = this.data.pendingAction;
    this.closeNotice();
    
    if (type === 'phone') {
      wx.makePhoneCall({ phoneNumber: '13800000000' });
    } else if (type === 'wechat') {
      wx.setClipboardData({
        data: 'highland_farmer_001',
        success: () => wx.showToast({ title: '微信号已复制' })
      });
    }
  },

  stopBubble() {} // 阻止弹窗点击冒泡
});
