/**
 * 把对象按照 js配置文件的格式进行格式化
 * @param obj 格式化的对象
 * @param dep 层级，此项无需传值
 * @returns {string}
 */
function formatConfig(obj, dep) {
  dep = dep || 1
  const LN = '\n', TAB = '  '
  let indent = ''
  for (let i = 0; i < dep; i++) {
    indent += TAB
  }
  let isArray = false, arrayLastIsObj = false
  let str = '', prefix = '{', subfix = '}'
  if (Array.isArray(obj)) {
    isArray = true
    prefix = '['
    subfix = ']'
    str = obj.map((item, index) => {
      let format = ''
      if (typeof item == 'function') {
        //
      } else if (typeof item == 'object') {
        arrayLastIsObj = true
        format = `${LN}${indent}${formatConfig(item,dep + 1)},`
      } else if ((typeof item == 'number' && !isNaN(item)) || typeof item == 'boolean') {
        format = `${item},`
      } else if (typeof item == 'string') {
        format = `'${item}',`
      }
      if (index == obj.length - 1) {
        format = format.substring(0, format.length - 1)
      } else {
        arrayLastIsObj = false
      }
      return format
    }).join('')
  } else if (typeof obj != 'function' && typeof obj == 'object') {
    str = Object.keys(obj).map((key, index, keys) => {
      const val = obj[key]
      let format = ''
      if (typeof val == 'function') {
        //
      } else if (typeof val == 'object') {
        format = `${LN}${indent}${key}: ${formatConfig(val,dep + 1)},`
      } else if ((typeof val == 'number' && !isNaN(val)) || typeof val == 'boolean') {
        format = `${LN}${indent}${key}: ${val},`
      } else if (typeof val == 'string') {
        format = `${LN}${indent}${key}: '${val}',`
      }
      if (index == keys.length - 1) {
        format = format.substring(0, format.length - 1)
      }
      return format
    }).join('')
  }
  const len = TAB.length
  if (indent.length >= len) {
    indent = indent.substring(0, indent.length - len)
  }
  if (!isArray || arrayLastIsObj) {
    subfix = LN + indent +subfix
  }
  return`${prefix}${str}${subfix}`
}

/**
 * 时间格式化
 * @param  {String/Object}      time     需要传入的时间
 * @param  {Number}     		type     需要返回的时间类型
**/
function parseTimeFun(time, type) {
  if (!time) { return '' }
  if (arguments.length === 0) { return '' }
  let format, iDate, timer;
  switch (type) {
    case 1: format = '{y}年{m}月{d}日'; break;
    case 2: format = '{y}-{m}-{d}'; break;
    case 3: format = '{y}年{m}月{d}日 周{a}'; break;
    case 4: format = '{h}:{i}:{s}'; break;
    case 5: format = '{m}-{d} {h}:{i}:{s}'; break;
    case 6: format = '{y}/{m}/{d}'; break;
    case 8: format = '{y}-{m}-{d}\n{h}:{i}:{s}'; break;
    default: format = '{y}-{m}-{d} {h}:{i}:{s}'; break;
  }
  if (typeof time === 'object') {
    iDate = time;
  } else if (time) {
    timer = time;
    let reg = /^[0-9]+$/, num = reg.test(time);
    if (('' + time).length === 10 && num) { timer = parseInt(time) * 1000 }
    if (('' + time).length === 13 && num) { timer = parseInt(time) }
    if (('' + time).length === 8) { timer = (time.substring(0, 4) + "/" + time.substring(4, 6) + "/" + time.substring(6)); }
    if (('' + time).indexOf('T') != -1) { time = time.replace(/T/, " "); timer = time; }
    if (('' + time).indexOf('-') != -1) { time = time.replace(/-/g, "/"); timer = time; }
    iDate = new Date(timer);
  } else {
    iDate = new Date();
  }
  let formatObj = {
    y: iDate.getFullYear(),
    m: iDate.getMonth() + 1,
    d: iDate.getDate(),
    h: iDate.getHours(),
    i: iDate.getMinutes(),
    s: iDate.getSeconds(),
    a: iDate.getDay()
  }
  let time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, function (result, key) {
    let value = formatObj[key];
    if (key === 'a') return ['日', '一', '二', '三', '四', '五', '六'][value];
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  })
  return time_str;
}

module.exports = {formatConfig, parseTimeFun}
