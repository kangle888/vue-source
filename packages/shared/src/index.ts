// 公共方法

export function isObject(val) {
  return typeof val === "object" && val !== null;
}

export function isArray(val) {
  return Array.isArray(val);
}
export function isFunction(val) {
  return typeof val === "function";
}

export function isString(val) {
  return typeof val === "string";
}

export function isNumber(val) {
  return typeof val === "number";
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn(target, key) {
  return hasOwnProperty.call(target, key);
}

// 判断是否是整数的key
export function isIntegerKey(key) {
  return parseInt(key) + "" === key;
}

export const hasChanged = (value, oldValue) => value !== oldValue;
