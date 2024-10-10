var VueShared = (function (exports) {
  'use strict';

  exports.ShapeFlags = void 0;
  (function (ShapeFlags) {
      ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
      ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
      ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
      ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
      ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
      ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
      ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
      ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
      ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
      ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
      ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
  })(exports.ShapeFlags || (exports.ShapeFlags = {}));

  // 公共方法
  function isObject(val) {
      return typeof val === "object" && val !== null;
  }
  function isArray(val) {
      return Array.isArray(val);
  }
  function isFunction(val) {
      return typeof val === "function";
  }
  function isString(val) {
      return typeof val === "string";
  }
  function isNumber(val) {
      return typeof val === "number";
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(target, key) {
      return hasOwnProperty.call(target, key);
  }
  // 判断是否是整数的key
  function isIntegerKey(key) {
      return parseInt(key) + "" === key;
  }
  const hasChanged = (value, oldValue) => value !== oldValue;
  // 合并
  const extend = Object.assign;

  exports.extend = extend;
  exports.hasChanged = hasChanged;
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
