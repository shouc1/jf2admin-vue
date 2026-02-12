// 日期格式化工具函数

/**
 * 将时间戳转换为日期字符串
 * @param {number|string} timestamp - 时间戳（毫秒）
 * @param {string} format - 日期格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return ''
  
  // 确保 timestamp 是数字类型
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  
  // 处理秒级时间戳（10位）
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts
  
  const date = new Date(finalTs)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 检查日期是否是今天
 * @param {number|string} timestamp - 时间戳
 * @returns {boolean} 是否是今天
 */
export function isToday(timestamp) {
  if (!timestamp) return false
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts
  
  const date = new Date(finalTs)
  const today = new Date()
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

/**
 * 检查日期是否在本周
 * @param {number|string} timestamp - 时间戳
 * @returns {boolean} 是否在本周
 */
export function isThisWeek(timestamp) {
  if (!timestamp) return false
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts
  
  const date = new Date(finalTs)
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  
  return date >= weekStart
}

/**
 * 检查日期是否在本月
 * @param {number|string} timestamp - 时间戳
 * @returns {boolean} 是否在本月
 */
export function isThisMonth(timestamp) {
  if (!timestamp) return false
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const finalTs = ts.toString().length === 10 ? ts * 1000 : ts
  
  const date = new Date(finalTs)
  const today = new Date()
  
  return date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}