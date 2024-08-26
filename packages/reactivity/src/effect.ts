// 定义了 effect 函数，用于创建一个响应式的副作用函数
// effect 函数接收两个参数，第一个参数是一个函数，第二个参数是一个配置对象
// effect 函数返回一个函数，这个函数就是响应式的副作用函数

export function effect(fn, options: any = {}) {
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
      } finally {
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
export function Track(target, type, key) {
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
