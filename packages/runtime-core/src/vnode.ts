// 创建虚拟节点 createVNode  和 h 函数 一样
// 创建虚拟节点
// type 组件的类型
// props 组件的属性
// children 子节点
// key
// el 真实节点
// shapeFlag
import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";
// import { ShapeFlags } from "@vue/shared";
export const createVNode = (type, props, children = null) => {
  // 虚拟节点
  // console.log("创建虚拟节点", rootComponent, rootProps);
  // vnode  {} 区别是组件还是元素 使用了位移运算符
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
  const vnode = {
    _v_isVNode: true, // 是否是虚拟节点
    type, // 组件的类型
    props, // 组件的属性
    children, // 子节点
    key: props && props.key, // key
    el: null, // 真实节点
    shapeFlag,
  };
  // 如果有儿子节点

  normalizeChildren(vnode, children);

  return vnode;
};

function normalizeChildren(vnode, children) {
  let type = 0;
  if (children === null) {
    type = 0;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }
  vnode.shapeFlag |= type; // 位运算符 这里是位运算
  // 例如 0000100 | 0000010 = 0000110
}
