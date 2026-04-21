/**
 * 高原科技牧场 - 云数据库接口定义
 */

/** 用户角色类型 */
export type UserRole = 'consumer' | 'farmer' | 'enterprise' | 'admin';

/** 溯源记录审核状态 */
export type AuditStatus = 'pending' | 'approved' | 'rejected';

/** 基础数据库字段 */
interface IBaseDoc {
  _id?: string;
  _openid?: string; // 微信云开发自动生成的 OpenID
  createTime?: Date | number;
  updateTime?: Date | number;
}

/** 1. 用户集合 (users) */
export interface IUser extends IBaseDoc {
  nickname: string;
  avatarUrl: string;
  role: UserRole;
  phone?: string;
  enterpriseName?: string; // 仅 enterprise 角色有效
  realName?: string; // 农户实名
  location?: string; // 所属地区
}

/** 2. 农牧产品基础信息 (products) */
export interface IProduct extends IBaseDoc {
  name: string; // 产品名称，如：牦牛肉、青稞
  category: 'livestock' | 'crop'; // 类别：畜牧/农作物
  description: string; // 产品介绍
  unitPrice: number; // 统一售价 (单位：分)
  unit: string; // 单位，如：斤、头
  images: string[]; // 产品展示图 (FileID)
  standard: string; // 质量标准
}

/** 3. 溯源记录 (traceability_records) */
export interface ITraceabilityRecord extends IBaseDoc {
  productId: string; // 关联 products 表的 _id
  farmerId: string; // 关联 users 表的 _id (farmer/enterprise)
  
  // 溯源数据内容
  mediaFiles: {
    fileId: string;
    type: 'image' | 'video';
  }[];
  
  // 地理位置
  location: {
    latitude: number;
    longitude: number;
    address: string; // 详细地址
    name?: string; // 地点名称
  };
  
  timestamp: number; // 记录发生的时间戳
  
  // 审核信息
  status: AuditStatus;
  auditRemark?: string; // 审核拒绝原因或备注
  auditorId?: string; // 审核员（admin）的 _id
  auditTime?: Date | number;
  
  // 其他扩展信息
  batchNumber?: string; // 生产批次号
  growthStage?: string; // 生长阶段描述
}
