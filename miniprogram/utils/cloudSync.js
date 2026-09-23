/* ===== FitBuddy 云开发同步层（打卡模块试点） =====
 *
 * 设计原则：本地优先 + 云端异步同步
 *  1. 本地缓存始终是主数据源，页面逻辑保持同步读写不变
 *  2. 云端只承担「多设备同步 + 备份」职责
 *  3. 任何云操作失败都静默降级，绝不打断用户操作
 *  4. 未开通云开发 / 集合不存在时，小程序与改造前完全一致
 *
 * 需要的云数据库集合：checkins（打卡记录）、profiles（用户资料）
 * 建议权限：仅创建者可读写（默认值，正好符合个人数据场景）
 *
 * 注意：项目未开启增强编译，故全部使用 Promise 链而非 async/await。
 */

const COLLECTION = 'checkins';
const PROFILE_COLLECTION = 'profiles';
const DIET_COLLECTION = 'diet_logs';
const WORKOUT_COLLECTION = 'workout_progress';
const FEEDBACK_COLLECTION = 'feedback';
const PAGE_SIZE = 20;      // 小程序端单次读取上限为 20 条
const MAX_PAGES = 30;      // 最多同步 600 条，防止异常时死循环

let _available = null;

function isAvailable() {
  if (_available !== null) return _available;
  try {
    _available = !!(wx.cloud && typeof wx.cloud.database === 'function');
  } catch (e) {
    _available = false;
  }
  return _available;
}

function getDb() {
  return wx.cloud.database();
}

function stripMeta(r) {
  return {
    date: r.date,
    completion: r.completion,
    weight: r.weight,
    water: r.water,
    sleep: r.sleep,
    fatigue: r.fatigue,
    mood: r.mood,
    pains: r.pains || [],
    updatedAt: r.updatedAt || 0
  };
}

/**
 * 分页拉取云端全部打卡记录
 * @returns {Promise<Array|null>} 失败或未开通返回 null，调用方据此降级
 */
function pullCheckins() {
  if (!isAvailable()) return Promise.resolve(null);
  let all = [];
  let page = 0;

  function nextPage() {
    const db = getDb();
    return db.collection(COLLECTION)
      .orderBy('date', 'desc')
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(function (res) {
        const batch = res && res.data ? res.data : [];
        all = all.concat(batch);
        page++;
        if (batch.length < PAGE_SIZE || page >= MAX_PAGES) {
          return all.map(stripMeta);
        }
        return nextPage();
      });
  }

  return Promise.resolve()
    .then(nextPage)
    .catch(function (e) {
      console.warn('[cloudSync] 拉取失败，改用本地数据：', e && e.errMsg);
      return null;
    });
}

/**
 * 合并本地与云端记录：以 date 为键，取 updatedAt 较新的一方
 * @param {Array} localList
 * @param {Array|null} cloudList
 * @returns {Array} 合并后按日期升序的数组
 */
function mergeCheckins(localList, cloudList) {
  if (!cloudList || !cloudList.length) return localList || [];
  const map = {};
  (localList || []).forEach(function (r) { if (r && r.date) map[r.date] = r; });
  cloudList.forEach(function (r) {
    if (!r || !r.date) return;
    const old = map[r.date];
    if (!old || (r.updatedAt || 0) >= (old.updatedAt || 0)) {
      map[r.date] = r;
    }
  });
  return Object.keys(map).sort().map(function (k) { return map[k]; });
}

/**
 * 推送单条打卡到云端（按 date 做 upsert）
 * @param {Object} record 打卡记录
 * @returns {Promise<boolean>} 是否成功
 */
function pushCheckin(record) {
  if (!isAvailable() || !record || !record.date) return Promise.resolve(false);
  const payload = Object.assign({}, record, { updatedAt: Date.now() });

  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(COLLECTION)
        .where({ date: record.date })
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(COLLECTION).doc(res.data[0]._id).update({ data: payload });
          }
          return db.collection(COLLECTION).add({ data: payload });
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 推送失败，数据已存本地：', e && e.errMsg);
      return false;
    });
}

/* ==================== 用户资料（profiles 集合，单文档） ==================== */

function stripProfileMeta(p) {
  const clean = {};
  Object.keys(p || {}).forEach(function (k) {
    if (k !== '_id' && k !== '_openid' && k !== 'updatedAt') clean[k] = p[k];
  });
  return clean;
}

/**
 * 拉取云端的用户资料（当前用户仅有一份）
 * @returns {Promise<Object|null>} 云端资料（含 updatedAt）或 null（无数据/失败/未开通）
 */
function pullProfile() {
  if (!isAvailable()) return Promise.resolve(null);
  return Promise.resolve()
    .then(function () {
      return getDb().collection(PROFILE_COLLECTION).limit(1).get();
    })
    .then(function (res) {
      const doc = res && res.data && res.data[0];
      return doc ? stripProfileMeta(doc) : null;
    })
    .catch(function (e) {
      console.warn('[cloudSync] 拉取资料失败：', e && e.errMsg);
      return null;
    });
}

/**
 * 合并本地与云端资料：updatedAt 较新者胜出
 * @returns {Object|null} null 表示无可合并数据
 */
function mergeProfile(localProfile, cloudProfile) {
  if (!cloudProfile) return localProfile || null;
  if (!localProfile) return cloudProfile;
  return (cloudProfile.updatedAt || 0) >= (localProfile.updatedAt || 0)
    ? cloudProfile
    : localProfile;
}

/**
 * 推送用户资料到云端（单文档 upsert）
 * @returns {Promise<boolean>}
 */
function pushProfile(profile) {
  if (!isAvailable() || !profile) return Promise.resolve(false);
  const payload = Object.assign(stripProfileMeta(profile), { updatedAt: Date.now() });

  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(PROFILE_COLLECTION)
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(PROFILE_COLLECTION).doc(res.data[0]._id).update({ data: payload });
          }
          return db.collection(PROFILE_COLLECTION).add({ data: payload });
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 推送资料失败，数据已存本地：', e && e.errMsg);
      return false;
    });
}

/* ==================== 饮食记录（diet_logs 集合，按 id upsert） ==================== */

const DIET_FIELDS = ['foodName', 'mealType', 'calories', 'protein', 'carbs', 'fat', 'createdAt'];

function stripDietMeta(r) {
  const clean = { id: r.id };
  DIET_FIELDS.forEach(function (k) { clean[k] = r[k]; });
  clean.updatedAt = r.updatedAt || 0;
  return clean;
}

/**
 * 分页拉取云端全部饮食记录
 * @returns {Promise<Array|null>}
 */
function pullDietLogs() {
  if (!isAvailable()) return Promise.resolve(null);
  let all = [];
  let page = 0;

  function nextPage() {
    return getDb().collection(DIET_COLLECTION)
      .orderBy('createdAt', 'desc')
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(function (res) {
        const batch = res && res.data ? res.data : [];
        all = all.concat(batch);
        page++;
        if (batch.length < PAGE_SIZE || page >= MAX_PAGES) {
          return all.map(stripDietMeta);
        }
        return nextPage();
      });
  }

  return Promise.resolve()
    .then(nextPage)
    .catch(function (e) {
      console.warn('[cloudSync] 拉取饮食记录失败，改用本地数据：', e && e.errMsg);
      return null;
    });
}

/**
 * 合并本地与云端饮食记录：以 id 为键，取 updatedAt 较新的一方
 * @returns {Array} 合并后按 id 升序
 */
function mergeDietLogs(localList, cloudList) {
  if (!cloudList || !cloudList.length) return localList || [];
  const map = {};
  (localList || []).forEach(function (r) { if (r && r.id) map[r.id] = r; });
  cloudList.forEach(function (r) {
    if (!r || !r.id) return;
    const old = map[r.id];
    if (!old || (r.updatedAt || 0) >= (old.updatedAt || 0)) map[r.id] = r;
  });
  return Object.keys(map)
    .sort(function (a, b) { return Number(a) - Number(b); })
    .map(function (k) { return map[k]; });
}

/**
 * 推送单条饮食记录到云端（按 id upsert）
 * @returns {Promise<boolean>}
 */
function pushDietLog(record) {
  if (!isAvailable() || !record || !record.id) return Promise.resolve(false);
  const payload = Object.assign(stripDietMeta(record), { updatedAt: Date.now() });

  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(DIET_COLLECTION)
        .where({ id: record.id })
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(DIET_COLLECTION).doc(res.data[0]._id).update({ data: payload });
          }
          return db.collection(DIET_COLLECTION).add({ data: payload });
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 推送饮食记录失败，数据已存本地：', e && e.errMsg);
      return false;
    });
}

/**
 * 删除云端对应饮食记录（本地删除已成功后调用）
 * @returns {Promise<boolean>}
 */
function removeDietLog(id) {
  if (!isAvailable() || !id) return Promise.resolve(false);
  // 云端存储的 id 是数值型，这里做一次归一，避免字符串型 id 查不到文档
  const targetId = isNaN(Number(id)) ? id : Number(id);
  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(DIET_COLLECTION)
        .where({ id: targetId })
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(DIET_COLLECTION).doc(res.data[0]._id).remove();
          }
          return null;
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 删除云端饮食记录失败：', e && e.errMsg);
      return false;
    });
}

/* ==================== 训练进度（workout_progress 集合，按日期单文档） ==================== */

/**
 * 拉取云端训练完成进度
 * @returns {Promise<Object|null>} { '2026-09-22': { done: true } } 或 null
 */
function pullWorkoutProgress() {
  if (!isAvailable()) return Promise.resolve(null);
  let out = {};
  let page = 0;

  function nextPage() {
    return getDb().collection(WORKOUT_COLLECTION)
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(function (res) {
        const batch = res && res.data ? res.data : [];
        batch.forEach(function (r) {
          if (r && r.date) out[r.date] = { done: !!r.done, updatedAt: r.updatedAt || 0 };
        });
        page++;
        if (batch.length < PAGE_SIZE || page >= MAX_PAGES) return out;
        return nextPage();
      });
  }

  return Promise.resolve()
    .then(nextPage)
    .catch(function (e) {
      console.warn('[cloudSync] 拉取训练进度失败，改用本地数据：', e && e.errMsg);
      return null;
    });
}

/**
 * 合并本地与云端训练进度：任一标记完成即视为完成
 * @returns {Object}
 */
function mergeWorkoutProgress(local, cloud) {
  const out = Object.assign({}, local || {});
  if (!cloud) return out;
  Object.keys(cloud).forEach(function (date) {
    out[date] = { done: true, updatedAt: cloud[date].updatedAt || 0 };
  });
  return out;
}

/**
 * 标记某天训练完成并推送云端（按 date upsert）
 * @returns {Promise<boolean>}
 */
function pushWorkoutProgress(date) {
  if (!isAvailable() || !date) return Promise.resolve(false);
  const payload = { date: date, done: true, updatedAt: Date.now() };

  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(WORKOUT_COLLECTION)
        .where({ date: date })
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(WORKOUT_COLLECTION).doc(res.data[0]._id).update({ data: payload });
          }
          return db.collection(WORKOUT_COLLECTION).add({ data: payload });
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 推送训练进度失败，数据已存本地：', e && e.errMsg);
      return false;
    });
}

/* ==================== 账号注销：清空云端数据 ==================== */

/**
 * 清空单个集合中属于当前用户的全部文档。
 * 小程序端 SDK 不支持 where().remove() 批量删除，只能先查 _id 再逐条 remove。
 *
 * 不设总量上限：长期用户的记录可能远超几百条，按「本轮是否真有删除进展」判断终止，
 * 这样既能删干净，又能避免异常时死循环。
 * 删除失败不吞错——必须让调用方感知，否则会出现「云端没删干净却提示注销成功」。
 *
 * @returns {Promise<number>} 已删除的文档数
 */
function clearCollection(name) {
  let removed = 0;

  function removeBatch() {
    const db = getDb();
    return db.collection(name).limit(PAGE_SIZE).get().then(function (res) {
      const batch = res && res.data ? res.data : [];
      if (!batch.length) return removed;
      const before = removed;
      return Promise.all(batch.map(function (doc) {
        return db.collection(name).doc(doc._id).remove().then(function () {
          removed++;
        });
      })).then(function () {
        // 兜底：本轮一条都没删掉，说明异常（权限/数据问题），抛错中止避免死循环
        if (removed === before) throw new Error('清空集合无进展：' + name);
        return removeBatch();
      });
    });
  }

  // 包一层，确保 getDb() 的同步抛错也变成 rejection，由调用方捕获
  return Promise.resolve().then(removeBatch);
}

/**
 * 清空当前用户在云端保存的全部数据（注销账号时调用）。
 * 四个集合并行清理，单个集合失败不影响其余集合。
 * @returns {Promise<boolean>} 是否全部清理成功
 */
function clearAllData() {
  if (!isAvailable()) return Promise.resolve(false);
  const collections = [COLLECTION, PROFILE_COLLECTION, DIET_COLLECTION, WORKOUT_COLLECTION, FEEDBACK_COLLECTION];
  let allOk = true;

  return Promise.resolve()
    .then(function () {
      return Promise.all(collections.map(function (name) {
        return clearCollection(name).catch(function (e) {
          console.warn('[cloudSync] 清空集合失败 ' + name + '：', e && e.errMsg);
          allOk = false;
          return 0;
        });
      }));
    })
    .then(function () { return allOk; })
    .catch(function (e) {
      console.warn('[cloudSync] 清空云端数据失败：', e && e.errMsg);
      return false;
    });
}

/* ===== 用户反馈 =====
 * 改造前「提交反馈」只把内容写进本地缓存 + 弹「反馈已提交」，而全项目没有任何地方
 * 消费那条队列，开发者永远收不到 —— 属虚假功能。
 * 现在真正写进云数据库 feedback 集合；开发者在云开发控制台即可看到全部提交
 * （控制台有管理员权限，不受「仅创建者可读写」限制）。
 * 同时该集合也是「开发者回复」的回显来源：后台改 status / admin_reply，客户端能读到。
 */

function stripFeedbackMeta(r) {
  return {
    feedback_id_local: r.feedback_id_local,
    user_id: r.user_id || '',
    nickname: r.nickname || '',
    type: r.type || 'other',
    content: r.content || '',
    contact: r.contact || '',
    device_info: r.device_info || '',
    ts: r.ts || 0,
    status: r.status || 'pending'
  };
}

/**
 * 提交一条反馈到云端
 * @returns {Promise<boolean>} false 表示未送达，调用方应入重试队列并如实告知用户
 */
function pushFeedback(record) {
  if (!isAvailable() || !record || !record.feedback_id_local) return Promise.resolve(false);
  const payload = Object.assign(stripFeedbackMeta(record), { updatedAt: Date.now() });

  return Promise.resolve()
    .then(function () {
      const db = getDb();
      return db.collection(FEEDBACK_COLLECTION)
        .where({ feedback_id_local: record.feedback_id_local })
        .limit(1)
        .get()
        .then(function (res) {
          if (res && res.data && res.data.length) {
            return db.collection(FEEDBACK_COLLECTION).doc(res.data[0]._id).update({ data: payload });
          }
          return db.collection(FEEDBACK_COLLECTION).add({ data: payload });
        });
    })
    .then(function () { return true; })
    .catch(function (e) {
      console.warn('[cloudSync] 提交反馈失败，已入重试队列：', e && e.errMsg);
      return false;
    });
}

/**
 * 拉取本人提交过的反馈（含开发者在后台填写的 status / admin_reply）
 */
function pullFeedback() {
  if (!isAvailable()) return Promise.resolve(null);
  let all = [];
  let page = 0;

  function nextPage() {
    const db = getDb();
    return db.collection(FEEDBACK_COLLECTION)
      .orderBy('ts', 'desc')
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(function (res) {
        const batch = res && res.data ? res.data : [];
        all = all.concat(batch);
        page++;
        if (batch.length < PAGE_SIZE || page >= 5) return all;
        return nextPage();
      });
  }

  return Promise.resolve()
    .then(nextPage)
    .catch(function (e) {
      console.warn('[cloudSync] 拉取反馈失败，改用本地记录：', e && e.errMsg);
      return null;
    });
}

/**
 * 合并反馈记录：处理状态与开发者回复以云端为准（这两项只由开发者在后台修改），
 * 其余字段保留本地版本，避免刚提交、云端还没回读时把内容覆盖成空。
 */
function mergeFeedback(localList, cloudList) {
  const map = {};
  (localList || []).forEach(function (r) {
    if (r && r.feedback_id_local) map[r.feedback_id_local] = r;
  });

  (cloudList || []).forEach(function (c) {
    if (!c || !c.feedback_id_local) return;
    const local = map[c.feedback_id_local] || {};
    map[c.feedback_id_local] = Object.assign({}, local, {
      ts: local.ts || c.ts || 0,
      type: local.type || c.type || 'other',
      content: local.content || c.content || '',
      status: c.status || local.status || 'pending',
      admin_reply: c.admin_reply || local.admin_reply || ''
    });
  });

  const out = Object.keys(map).map(function (k) { return map[k]; });
  out.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  return out;
}

/**
 * 重试此前未送达的反馈（由 app 启动时调用），成功后从队列移除
 * @returns {Promise<number>} 本次成功送达的条数
 */
function flushPendingFeedback() {
  if (!isAvailable()) return Promise.resolve(0);
  let list = [];
  try {
    list = wx.getStorageSync('pending_feedback_sync') || [];
  } catch (e) {
    list = [];
  }
  if (!list.length) return Promise.resolve(0);

  const sentIds = [];
  return list.reduce(function (chain, rec) {
    return chain.then(function () {
      return pushFeedback(rec).then(function (ok) {
        if (ok) sentIds.push(rec.feedback_id_local);
        return ok;
      });
    });
  }, Promise.resolve()).then(function () {
    const rest = list.filter(function (r) {
      return sentIds.indexOf(r.feedback_id_local) < 0;
    });
    try {
      wx.setStorageSync('pending_feedback_sync', rest);
    } catch (e) {}
    return sentIds.length;
  });
}

module.exports = {
  isAvailable: isAvailable,
  FEEDBACK_COLLECTION: FEEDBACK_COLLECTION,
  pushFeedback: pushFeedback,
  pullFeedback: pullFeedback,
  mergeFeedback: mergeFeedback,
  flushPendingFeedback: flushPendingFeedback,
  clearAllData: clearAllData,
  pullCheckins: pullCheckins,
  mergeCheckins: mergeCheckins,
  pushCheckin: pushCheckin,
  pullProfile: pullProfile,
  mergeProfile: mergeProfile,
  pushProfile: pushProfile,
  pullDietLogs: pullDietLogs,
  mergeDietLogs: mergeDietLogs,
  pushDietLog: pushDietLog,
  removeDietLog: removeDietLog,
  pullWorkoutProgress: pullWorkoutProgress,
  mergeWorkoutProgress: mergeWorkoutProgress,
  pushWorkoutProgress: pushWorkoutProgress,
  COLLECTION: COLLECTION,
  PROFILE_COLLECTION: PROFILE_COLLECTION,
  DIET_COLLECTION: DIET_COLLECTION,
  WORKOUT_COLLECTION: WORKOUT_COLLECTION
};
