import { isObject } from '@vue/shared'
import{
  reactiveHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandlers'



export function reactive(target) {
  /**
   * 1. target 是不是对象
   * 2. false 代表不是 readonly
   * 3. reactiveHandlers 代表深层代理
   */
    return createReactiveObject(target, false, reactiveHandlers)  // 高阶函数

}

export function shallowReactive(target) {

  /**
   * 1. target 是不是对象
   * 2. false 代表不是 readonly
   * 3. shallowReactiveHandlers 代表浅层代理
   */
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  /**
   * 1. target 是不是对象
   * 2. true 代表是 readonly
   * 3. readonlyHandlers 代表深层代理
   */
  return createReactiveObject(target, true, readonlyHandlers)
} 

export function shallowReadonly(target) {
  /**
   * 1. target 是不是对象
   * 2. true 代表是 readonly
   * 3. shallowReadonlyHandlers 代表浅层代理
   */
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}


// 核心代理函数实现
// 
const reactiveMap = new WeakMap() // key 只能是对象 自动垃圾回收
const readonlyMap = new WeakMap()
function createReactiveObject(target, isReadonly = false, baseHandlers) {
  // 判断是否是对象
  if (!isObject(target)) {
    return target
  }

  // 1. 查找缓存
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const exisitingProxy = proxyMap.get(target) // 如果已经代理过了 直接返回
  if (exisitingProxy) {
    return exisitingProxy
  }

  // 2. 创建 Proxy
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

// 注意 核心 proxy 