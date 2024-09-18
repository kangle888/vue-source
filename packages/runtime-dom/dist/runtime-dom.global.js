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
          conmponent: {}, // 组件实例
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

  const componentPublicInstance = {
      get({ _: instance }, key) {
          const { setupState, props, data } = instance;
          if (key in setupState) {
              return setupState[key];
          }
          else if (key in props) {
              return props[key];
          }
          // else {
          //   return data[key];
          // }
      },
      set({ _: instance }, key, value) {
          const { setupState, props, data } = instance;
          if (key in setupState) {
              setupState[key] = value;
          }
          else if (key in props) {
              props[key] = value;
          }
          // else {
          //   data[key] = value;
          // }
      },
  };

  // 1. 创建组件实例
  const createComponentInstance = (vnode) => {
      const instance = {
          vnode,
          type: vnode.type,
          props: {}, //组件的属性
          attrs: {},
          setupState: {}, // setup返回的状态
          ctx: {}, //代理
          proxy: {}, // 代理
          render: null, // 组件的render方法
          data: { a: 1 }, // 组件的数据
          isMounted: false, // 是否挂载
      };
      instance.ctx = { _: instance };
      return instance;
  };
  // 2. 解析数据到这个实例对象上
  const setupComponent = (instance) => {
      // 设置值
      const { props, children } = instance.vnode;
      // 根据props解析到组件实例上
      instance.props = props; // initProps
      instance.children = children; // 插槽
      // 看一下这个组件是不是有setup函数
      let isStateFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
      if (isStateFlag) {
          // 有状态组件
          setupStatefulComponent(instance);
      }
  };
  // 处理setup函数
  function setupStatefulComponent(instance) {
      // 代理
      instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
      // setup 可以是一个对象 也可以是一个函数
      // 获取组件的类型  拿到setup 方法
      let Component = instance.vnode.type;
      let { setup } = Component;
      // 看一下这个组件有没有setup  render
      if (setup) {
          // 执行setup
          // 处理参数
          let setupContext = createSetupContext(instance);
          // 执行setup
          let setupResult = setup(instance.props, setupContext);
          // 问题 setupResult 可能是对象 也可能是函数
          handlerSetupResult(instance, setupResult); // 如果是对象就是值 如果是函数就是render
      }
      else {
          // 没有setup 直接执行render
          finishComponentSetup(instance);
      }
      Component.render(instance.proxy);
  }
  // 处理setup返回的结果
  function handlerSetupResult(instance, setupResult) {
      if (typeof setupResult === "object") {
          instance.setupState = setupResult;
      }
      else if (typeof setupResult === "function") {
          instance.render = setupResult;
      }
      // 走render方法
      finishComponentSetup(instance);
  }
  // 处理完setup后 走render方法
  function finishComponentSetup(instance) {
      // 判断一下 组件中有没有render方法
      let Component = instance.vnode.type;
      if (!instance.render) {
          // 没有render   // 这里是 模板 =》 render
          if (!Component.render && Component.template) {
              instance.render = Component.render;
          }
          instance.render = Component.render;
      }
      // console.log(instance.render.toString(), "render");
  }
  function createSetupContext(instance) {
      return {
          attrs: instance.attrs,
          slots: instance.slots,
          emit: () => { },
          expose: () => { },
      };
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

  // createRender
  function createRender(renderOptionDom) {
      // 创建一个effect 让这个render执行
      function setupRenderEffect(instance) {
          // 需要创建一个 effect 在 effect 中调用 render 方法，
          // 这样 render 方法中拿到的数据会收集这个 effect
          // 属性改变了 会重新执行 effect
          effect(function componentEffect() {
              // 判断是否挂载
              if (!instance.isMounted) {
                  // 获取到render  返回值
                  let proxy = instance.proxy;
                  instance.render.call(proxy, proxy);
              }
          });
      }
      const mountComponent = (InitialVnode, container) => {
          // 组件的渲染流程  核心
          // 1、创建一个组建的实例
          const instance = (InitialVnode.component =
              createComponentInstance(InitialVnode));
          // 2、解析数据到这个实例对象上
          setupComponent(instance);
          // 3 、创建一个effect 让这个render执行
          setupRenderEffect(instance);
      };
      // 组件的创建
      const processComponent = (n1, n2, container) => {
          {
              // 第一次挂载时
              // 组件的挂载
              mountComponent(n2);
          }
      };
      const patch = (n1, n2, container) => {
          // 针对不同的类型 1 组件  2  元素
          let { shapeFlag } = n2;
          if (shapeFlag & ShapeFlags.ELEMENT) ;
          else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
              processComponent(n1, n2);
          }
      };
      let render = (vnode, container) => {
          console.log("render~~~", vnode);
          // 这里就得到了虚拟dom ， 然后将虚拟dom转换成真实dom
          // 渲染  第一次
          patch(null, vnode); // 第一个参数 旧节点 第二个参数 新节点  第三个参数 位置
      };
      return {
          // 创建vNode
          createApp: apiCreateApp(render),
      };
  }
  // 给组件 创建一个instance 添加相关信息
  // 处理 setup  中 context 四个参数
  // 通过代理 方便 proxy 取值
  // render (1) setup 返回值是一个函数  就是 render
  // 如果 setup 返回值是一个函数 就执行  源码中  就 是通过一个判断 来解决
  // 如果 setup 返回值是一个对象 就是值

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
