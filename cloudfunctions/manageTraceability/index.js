// cloudfunctions/manageTraceability/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_TYPE_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 标准化返回格式
 */
const response = (code, message, data = null) => {
  return { code, message, data };
};

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'uploadRecord':
        return await uploadRecord(data, OPENID);
      case 'auditRecord':
        return await auditRecord(data, OPENID);
      case 'getTraceRecords':
        return await getTraceRecords(data);
      default:
        return response(404, '未找到对应的操作路由');
    }
  } catch (err) {
    console.error('云函数执行异常:', err);
    return response(500, '服务器内部错误', err.message);
  }
};

/**
 * 获取溯源记录列表 (带分页)
 */
async function getTraceRecords(data) {
  const { productId, offset = 0, limit = 5 } = data;

  if (!productId) {
    return response(400, 'productId 必填');
  }

  const res = await db.collection('traceability_records')
    .where({
      productId,
      status: 'approved' // 仅返回已审核通过的
    })
    .orderBy('timestamp', 'desc')
    .skip(offset)
    .limit(limit)
    .get();

  return response(0, '获取成功', res.data);
}

/**
 * 农户上传溯源记录
 */
async function uploadRecord(data, openid) {
  const { productId, mediaFiles, location, remark, timestamp } = data;

  if (!productId || !mediaFiles || mediaFiles.length === 0) {
    return response(400, '必填参数缺失');
  }

  const res = await db.collection('traceability_records').add({
    data: {
      productId,
      farmerId: openid, // 记录上传者的 OpenID
      mediaFiles,
      location,
      remark,
      timestamp,
      status: 'pending', // 初始状态为待审核
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }
  });

  return response(0, '上传成功，请等待管理员审核', { recordId: res._id });
}

/**
 * 管理员审核记录
 */
async function auditRecord(data, openid) {
  const { recordId, status, auditRemark } = data;

  if (!recordId || !['approved', 'rejected'].includes(status)) {
    return response(400, '参数错误');
  }

  // 1. 权限校验（实际应查询 users 表确认 openid 角色为 admin）
  const user = await db.collection('users').where({ _openid: openid, role: 'admin' }).get();
  if (user.data.length === 0) {
    return response(403, '无权进行此操作');
  }

  const updateData = {
    status,
    auditRemark: auditRemark || '',
    auditorId: openid,
    auditTime: db.serverDate(),
    updateTime: db.serverDate()
  };

  // 2. 如果审核通过，生成专属溯源标识 (Trace Code)
  if (status === 'approved') {
    // 生成规则：时间戳 + 6位随机码
    const traceCode = `TR${Date.now()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    updateData.traceCode = traceCode;
  }

  await db.collection('traceability_records').doc(recordId).update({
    data: updateData
  });

  return response(0, `记录已${status === 'approved' ? '批准' : '驳回'}`, {
    traceCode: updateData.traceCode || null
  });
}
