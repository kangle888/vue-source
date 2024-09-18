// createRender
import { ShapeFlags } from "@vueshared";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { effect } from "@vue/reactivity";
export function createRender(renderOptionDom) {
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
    if (n1 == null) {
      // 第一次挂载时
      // 组件的挂载
      mountComponent(n2, container);
    } else {
      // 组件的更新
      // updateComponent(n1, n2, container);
    }
  };

  const patch = (n1, n2, container) => {
    // 针对不同的类型 1 组件  2  元素
    let { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // processElement(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container);
    }
  };
  let render = (vnode, container) => {
    console.log("render~~~", vnode);
    // 这里就得到了虚拟dom ， 然后将虚拟dom转换成真实dom
    // 渲染  第一次
    patch(null, vnode, container); // 第一个参数 旧节点 第二个参数 新节点  第三个参数 位置
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
