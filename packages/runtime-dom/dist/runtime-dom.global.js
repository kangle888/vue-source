var VueRuntimeDom = (function (exports) {
  'use strict';

  var ShapeFlags;
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
  })(ShapeFlags || (ShapeFlags = {}));

  // 公共方法
  function isObject(val) {
      return typeof val === "object" && val !== null;
  }
  function isArray(val) {
      return Array.isArray(val);
  }
  function isString(val) {
      return typeof val === "string";
  }
  // 合并
  const extend = Object.assign;

  // 操作节点的 增 删 改 查
  const nodeOps = {
      // 创建元素
      createElement(tag) {
          return document.createElement(tag);
      },
      // 删除元素
      remove(child) {
          const parent = child.parentNode;
          if (parent) {
              parent.removeChild(child);
          }
      },
      // 插入元素
      insert(child, parent, anchor = null) {
          parent.insertBefore(child, anchor || null); // anchor 为插入位置
      },
      // 查询元素
      querySelector(selector) {
          return document.querySelector(selector);
      },
      // 设置元素文本
      setElementText(el, text) {
          el.textContent = text;
      },
      // 创建文本节点
      createText(text) {
          return document.createTextNode(text);
      },
  };

  const patchClass = (el, value) => {
      if (value == null) {
          value = "";
      }
      else {
          el.className = value;
      }
  };

  const patchStyle = (el, prev, next) => {
      // style 处理
      const style = el.style;
      if (!next) {
          el.removeAttribute("style");
      }
      else {
          // 新的有老的没有，直接赋值
          for (const key in next) {
              style[key] = next[key];
          }
          // 老的有新的没有，直接置空
          if (prev) {
              for (const key in prev) {
                  if (!next[key]) {
                      style[key] = "";
                  }
              }
          }
      }
  };

  // 自定义的属性
  const patchAttr = (el, key, value) => {
      if (value == null) {
          el.removeAttribute(key);
      }
      else {
          el.setAttribute(key, value);
      }
  };

  // 处理事件
  //  div  @click="handleClick"  ->  div @click = "handleClick1"
  // 元素绑定 是 通过 addEventListener 来绑定的
  const patchEvent = (el, key, value) => {
      // 1、 对函数进行缓存
      const invokers = el._vei || (el._vei = {});
      const existingInvoker = invokers[key];
      if (value && existingInvoker) {
          // 2、新的和老的都有，更新事件
          existingInvoker.value = value;
      }
      else {
          const eventName = key.slice(2).toLowerCase();
          if (value) {
              //3、新的有,老的没有，添加事件
              let invoker = (invokers[key] = createInvoker(value));
              el.addEventListener(eventName, invoker);
          }
          else {
              //4、新的没有，老的有，移除事件
              el.removeEventListener(eventName, existingInvoker);
              invokers[key] = undefined; // 清除缓存
          }
      }
  };
  const createInvoker = (value) => {
      const invoker = (e) => {
          invoker.value(e);
      };
      invoker.value = value;
      return invoker;
  };

  // 属性 操作
  // 使用了策略模式
  const patchProps = (el, key, prevValue, nextValue) => {
      switch (key) {
          case "class":
              patchClass(el, nextValue);
              break;
          case "style":
              patchStyle(el, prevValue, nextValue);
              break;
          default:
              if (/^on[^a-z]/.test(key)) {
                  // 事件
                  patchEvent(el, key, nextValue);
              }
              else {
                  // 自定义属性
                  patchAttr(el, key, nextValue);
              }
      }
  };

  // 创建虚拟节点 createVNode  和 h 函数 一样
  // 创建虚拟节点
  // type 组件的类型
  // props 组件的属性
  // children 子节点
  // key
  // el 真实节点
  // shapeFlag
  // import { ShapeFlags } from "@vue/shared";
  const createVNode = (type, props, children = null) => {
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
      }
      else if (isArray(children)) {
          type = ShapeFlags.ARRAY_CHILDREN;
      }
      else {
          type = ShapeFlags.TEXT_CHILDREN;
      }
      vnode.shapeFlag |= type; // 位运算符 这里是位运算
      // 例如 0000100 | 0000010 = 0000110
  }

  function apiCreateApp(render) {
      return function createApp(rootComponent, rootProps) {
          const app = {
              _component: rootComponent,
              _props: rootProps,
              _container: null,
              mount(rootContainer) {
                  //组件的渲染
                  // 1、创建组件的虚拟dom
                  // 2、将虚拟dom转换成真实dom
                  // 3、将真实dom插入到rootContainer中
                  let vnode = createVNode(rootComponent, rootProps);
                  // console.log(vnode, "打印vnode");
                  render(vnode, rootContainer);
                  app._container = rootContainer;
              },
          };
          return app;
      };
  }

  // createRender
  function createRender(renderOptionDom) {
      let render = (vnode, container) => {
          console.log("render~~~", vnode);
      };
      return {
          // 创建vNode
          createApp: apiCreateApp(render),
      };
  }

  // runtime-dom  这个文件时操作dom的核心文件 1、创建dom 2、更新dom 3、删除dom
  // vue3 dom 的 全部 操作
  const renderOptionDom = extend({ patchProps }, nodeOps);
  // createApp
  const createApp = (rootComponent, rootProps = null) => {
      let app = createRender().createApp(rootComponent, rootProps);
      let { mount } = app;
      app.mount = (container) => {
          container = nodeOps.querySelector(container);
          if (!container) {
              console.warn(`挂载的元素不存在`);
              return;
          }
          // 挂载时清空容器
          container.innerHTML = "";
          mount(container);
      };
      return app;
  };

  exports.createApp = createApp;
  exports.renderOptionDom = renderOptionDom;

  return exports;

})({});
//# sourceMappingURL=runtime-dom.global.js.map
