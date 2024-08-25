import { isObject ,isArray, isFunction, isNumber, isString, isIntegerKey,hasOwn} from '@vue/shared'
import { reactive, readonly } from './reacvtive'
import { TrackOpTypes } from './operations'
import { Track } from './effect'
// get 柯里化方法

const get = createGetter() // 不是仅读的 可以修改(深度)
const shallowReactiveGet = createGetter(false, true) // 不是仅读的 可以修改(浅层)
const readonlyGet = createGetter(true) // 仅读的 不能修改 
const shallowReadonlyGet = createGetter(true, true) // 仅读的 不能修改

// set 柯里化方法
const set = createSetter()
const shallowReactiveSet = createSetter(true)

/**
 * 
 * @param shallow 是否是浅层
 * @returns 
 */

function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    console.log('响应式设置', key, value)
    // 注意 1 如果是新增属性 2 如果是修改属性
    // 如果是新增属性 会触发两次 1.添加属性 2.修改属性
    // 如果是修改属性 会触发一次
    const oldValue = target[key]
    // 判断数组还是对象
    let hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
    if (!hasKey) {
      console.log('新增属性')
      // 新增属性
      // Track(target, TrackOpTypes.ADD, key)
    }
    return res
  }
}

/**
 * 
 * @param isReadonly  是否是只读
 * @param shall  是否是浅层
 * @returns 
 */
function createGetter(isReadonly = false, shall = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    console.log('响应式获取', key, res)
    if (!isReadonly) {
      // 如果不是仅读的 
      // 收集effect依赖
      Track(target, TrackOpTypes.GET, key)
    }
    if (shall) { 
      // 浅层代理
      return res
    }
    // 如果是对象 递归代理 
    // 面试 懒代理  如果不使用 先不代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

export const reactiveHandlers = {
  get,
  set

}
export const shallowReactiveHandlers = {
  get: shallowReactiveGet,
  set: shallowReactiveSet
 
}
export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value) => {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    return true
  }
  
}
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: (target, key, value) => {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    return true
  }
  
}