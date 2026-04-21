/**
 * 高原科技牧场 - 核心数据模型迁移
 */

export type UserRole = 'consumer' | 'farmer' | 'enterprise' | 'admin';
export type AuditStatus = 'pending' | 'approved' | 'rejected';

export interface IProduct {
  id: string;
  name: string;
  category: 'livestock' | 'crop';
  description: string;
  unitPrice: number;
  unit: string;
  images: string[];
  standard: string;
  origin?: string;
}

export interface ITraceabilityRecord {
  id: string;
  productId: string;
  farmerId: string;
  farmerName?: string;
  mediaFiles: {
    url: string;
    type: 'image' | 'video';
  }[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: number;
  };
  remark: string;
  timestamp: number;
  status: AuditStatus;
  traceCode?: string;
  auditRemark?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
