/* ===== FitBuddy 云开发同步层（打卡模块试点） =====
 *
 * 设计原则：本地优先 + 云端异步同步
 *  1. 本地缓存始终是主数据源，页面逻辑保持同步读写不变
 *  2. 云端只承担「多设备同步 + 备份」职责
 *  3. 任何云操作失败都静默降级，绝不打断用户操作
 *  4. 未开通云开发 / 集合不存在时，小程序与改造前完全一致
 *
 * 需要的云数据库集合：checkins
 * 建议权限：仅创建者可读写（默认值，正好符合个人数据场景）
 *
 * 注意：项目未开启增强编译，故全部使用 Promise 链而非 async/await。
 */

const COLLECTION = 'checkins';
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

module.exports = {
  isAvailable: isAvailable,
  pullCheckins: pullCheckins,
  mergeCheckins: mergeCheckins,
  pushCheckin: pushCheckin,
  COLLECTION: COLLECTION
};
