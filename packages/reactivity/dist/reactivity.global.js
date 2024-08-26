var VueReactivity = (function (exports) {
  'use strict';

  // 公共方法
  function isObject(val) {
      return typeof val === "object" && val !== null;
  }
  function isArray(val) {
      return Array.isArray(val);
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(target, key) {
      return hasOwnProperty.call(target, key);
  }
  // 判断是否是整数的key
  function isIntegerKey(key) {
      return parseInt(key) + "" === key;
  }

  // 定义了 effect 函数，用于创建一个响应式的副作用函数
  // effect 函数接收两个参数，第一个参数是一个函数，第二个参数是一个配置对象
  // effect 函数返回一个函数，这个函数就是响应式的副作用函数
  function effect(fn, options = {}) {
      if (fn.effect) {
          fn = fn.effect;
      }
      const effect = createReactiveEffect(fn, options);
      if (!options.lazy) {
          effect();
      }
      return effect;
  }
  let uid = 0;
  let activeEffect; // 用于保存当前的effect
  const effectStack = []; // 存储effect的栈
  function createReactiveEffect(fn, options) {
      //返回一个函数
      const effect = function reactiveEffect() {
          // 执行
          // 判断effect是否在effectStack中 如果不在则执行 /
          // 这里的意思 就是 如果重新执行了effect，不会再次添加到effectStack中
          if (!effectStack.includes(effect)) {
              try {
                  // 入栈
                  effectStack.push(effect);
                  activeEffect = effect;
                  return fn();
              }
              finally {
                  effectStack.pop();
                  activeEffect = effectStack[effectStack.length - 1];
              }
          }
      };
      // 为effect添加属性 effect是函数对象 可以添加属性
      effect.id = uid++; // 唯一标识区别effect
      effect._isEffect = true; // 标识是一个effect，区分effect是不是响应式
      effect.raw = fn; // 保存原函数
      effect.options = options; // 报存用户传入的配置
      return effect;
  }
  // 收集effect依赖, 在获取数据的时候触发get  手机effect
  let targetMap = new WeakMap();
  function Track(target, type, key) {
      console.log("收集依赖", target, type, key, activeEffect);
      // 对应的effect
      // key 和我们的effect 一一对应 map=> key = target => 属性 => [effect] set
      if (activeEffect === undefined) {
          // 没有effect依赖
          return;
      }
      // 获取effect  {target:{key:(name)}}
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      // 获取key对应的effect
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      // 如果没有收集过依赖
      if (!dep.has(activeEffect)) {
          dep.add(activeEffect);
      }
      console.log("targetMap", targetMap);
  }
  // 问题  effect 会有嵌套的问题存在
  // effect(() => {
  //   state.name = 'lisi'
  //   state.age = 20
  //    effect(() => {
  //       state.name = 'lisi'
  //         state.age = 20
  //      }
  // })

  // get 柯里化方法
  const get = createGetter(); // 不是仅读的 可以修改(深度)
  const shallowReactiveGet = createGetter(false, true); // 不是仅读的 可以修改(浅层)
  const readonlyGet = createGetter(true); // 仅读的 不能修改
  const shallowReadonlyGet = createGetter(true, true); // 仅读的 不能修改
  // set 柯里化方法
  const set = createSetter();
  const shallowReactiveSet = createSetter(true);
  /**
   *
   * @param shallow 是否是浅层
   * @returns
   */
  function createSetter(shallow = false) {
      return function set(target, key, value, receiver) {
          const res = Reflect.set(target, key, value, receiver);
          console.log("响应式设置", key, value);
          // 注意 1 如果是新增属性 2 如果是修改属性
          // 如果是新增属性 会触发两次 1.添加属性 2.修改属性
          // 如果是修改属性 会触发一次
          const oldValue = target[key];
          // 判断数组还是对象  [1,2,3]  Number(key) < target.length这里判断为修改数组
          let hasKey = isArray(target) && isIntegerKey(key)
              ? Number(key) < target.length
              : hasOwn(target, key);
          if (!hasKey) {
              console.log("新增属性");
              // 新增属性
              // Track(target, TrackOpTypes.ADD, key)
          }
          else if (oldValue !== value) {
              console.log("修改属性");
              // 修改属性
              // trigger(target, TrackOpTypes.SET, key, value, oldValue)
          }
          return res;
      };
  }
  /**
   *
   * @param isReadonly  是否是只读
   * @param shall  是否是浅层
   * @returns
   */
  function createGetter(isReadonly = false, shall = false) {
      return function get(target, key, receiver) {
          const res = Reflect.get(target, key, receiver);
          console.log("响应式获取", key, res);
          if (!isReadonly) {
              // 如果不是仅读的
              // 收集effect依赖
              Track(target, 0 /* TrackOpTypes.GET */, key);
          }
          if (shall) {
              // 浅层代理
              return res;
          }
          // 如果是对象 递归代理
          // 面试 懒代理  如果不使用 先不代理
          if (isObject(res)) {
              return isReadonly ? readonly(res) : reactive(res);
          }
          return res;
      };
  }
  const reactiveHandlers = {
      get,
      set,
  };
  const shallowReactiveHandlers = {
      get: shallowReactiveGet,
      set: shallowReactiveSet,
  };
  const readonlyHandlers = {
      get: readonlyGet,
      set: (target, key, value) => {
          console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`);
          return true;
      },
  };
  const shallowReadonlyHandlers = {
      get: shallowReadonlyGet,
      set: (target, key, value) => {
          console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`);
          return true;
      },
  };
  // 面试 ： 响应式 api  reactive  proxy 懒代理
  //  readonly   effect  {}

  function reactive(target) {
      /**
       * 1. target 是不是对象
       * 2. false 代表不是 readonly
       * 3. reactiveHandlers 代表深层代理
       */
      return createReactiveObject(target, false, reactiveHandlers); // 高阶函数
  }
  function shallowReactive(target) {
      /**
       * 1. target 是不是对象
       * 2. false 代表不是 readonly
       * 3. shallowReactiveHandlers 代表浅层代理
       */
      return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
      /**
       * 1. target 是不是对象
       * 2. true 代表是 readonly
       * 3. readonlyHandlers 代表深层代理
       */
      return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
      /**
       * 1. target 是不是对象
       * 2. true 代表是 readonly
       * 3. shallowReadonlyHandlers 代表浅层代理
       */
      return createReactiveObject(target, true, shallowReadonlyHandlers);
  }
  // 核心代理函数实现
  // 
  const reactiveMap = new WeakMap(); // key 只能是对象 自动垃圾回收
  const readonlyMap = new WeakMap();
  function createReactiveObject(target, isReadonly = false, baseHandlers) {
      // 判断是否是对象
      if (!isObject(target)) {
          return target;
      }
      // 1. 查找缓存
      const proxyMap = isReadonly ? readonlyMap : reactiveMap;
      const exisitingProxy = proxyMap.get(target); // 如果已经代理过了 直接返回
      if (exisitingProxy) {
          return exisitingProxy;
      }
      // 2. 创建 Proxy
      const proxy = new Proxy(target, baseHandlers);
      proxyMap.set(target, proxy);
      return proxy;
  }
  // 注意 核心 proxy

  exports.effect = effect;
  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
