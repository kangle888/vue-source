var VueShared = (function (exports) {
    'use strict';

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

    exports.hasOwn = hasOwn;
    exports.isArray = isArray;
    exports.isFunction = isFunction;
    exports.isIntegerKey = isIntegerKey;
    exports.isNumber = isNumber;
    exports.isObject = isObject;
    exports.isString = isString;

    return exports;

})({});
//# sourceMappingURL=shared.global.js.map
