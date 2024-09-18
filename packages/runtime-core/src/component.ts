import { ShapeFlags } from "@vueshared";
import { componentPublicInstance } from "./componentPublicIntance";

// 1. 创建组件实例
export const createComponentInstance = (vnode) => {
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
export const setupComponent = (instance) => {
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
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance as any);

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
  } else {
    // 没有setup 直接执行render
    finishComponentSetup(instance);
  }

  Component.render(instance.proxy);
}
// 处理setup返回的结果
function handlerSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  } else if (typeof setupResult === "function") {
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
    emit: () => {},
    expose: () => {},
  };
}
