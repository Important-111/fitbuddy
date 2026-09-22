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

module.exports = {
  isAvailable: isAvailable,
  pullCheckins: pullCheckins,
  mergeCheckins: mergeCheckins,
  pushCheckin: pushCheckin,
  pullProfile: pullProfile,
  mergeProfile: mergeProfile,
  pushProfile: pushProfile,
  COLLECTION: COLLECTION,
  PROFILE_COLLECTION: PROFILE_COLLECTION
};
