import { isArray, isObject } from "@vue/shared";
import { createVNode, isVnode } from "./vnode";

export function h(type, propsOrChildren, children) {
  // 创建虚拟节点
  const i = arguments.length; // 参数的长度

  if (i === 2) {
    // 如果参数的长度为2
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 如果是对象并且不是数组
      if (isVnode) {
        // 如果是虚拟节点
        return createVNode(type, null, [propsOrChildren]);
      }
      // 没有 儿子
      return createVNode(type, propsOrChildren);
    } else {
      // 就是 儿子  children
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    // 三个参数
    if (i > 3) {
      // 如果参数的长度大于3
      children = Array.prototype.slice.call(arguments, 2);
    } else if (i === 3 && isVnode(children)) {
      // 如果参数的长度等于3 并且是虚拟节点
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}


// h函数是变成虚拟dom的函数