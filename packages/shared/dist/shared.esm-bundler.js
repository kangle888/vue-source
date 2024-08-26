// 公共方法
function isObject(val) {
    return typeof val === 'object' && val !== null;
}
function isArray(val) {
    return Array.isArray(val);
}
function isFunction(val) {
    return typeof val === 'function';
}
function isString(val) {
    return typeof val === 'string';
}
function isNumber(val) {
    return typeof val === 'number';
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(target, key) {
    return hasOwnProperty.call(target, key);
}
// 判断是否是整数的key
function isIntegerKey(key) {
    return parseInt(key) + '' === key;
}

export { hasOwn, isArray, isFunction, isIntegerKey, isNumber, isObject, isString };
//# sourceMappingURL=shared.esm-bundler.js.map
