// createRender
import { ShapeFlags } from "@vueshared";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { effect } from "@vue/reactivity";
import { CVnode, TEXT } from "./vnode";
export function createRender(renderOptionDom) {
  // 获取全部的操作dom的方法
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProps: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setElementText: hostSetElementText,
    setText : hostSetText
  } = renderOptionDom;




  // 创建一个effect 让这个render执行
  function setupRenderEffect(instance, container) {
    // 需要创建一个 effect 在 effect 中调用 render 方法，
    // 这样 render 方法中拿到的数据会收集这个 effect
    // 属性改变了 会重新执行 effect
    effect(function componentEffect() {
      // 判断是否挂载
      if (!instance.isMounted) {
        // 获取到render  返回值
        let proxy = instance.proxy;
        let subTree =  instance.subTree =   instance.render.call(proxy, proxy);
        console.log("subTree", subTree);
        // 组件渲染的节点 =》真实dom、
        // 渲染子树 创建元素
      patch(null, subTree, container);  
      instance.isMounted = true;    
    }else{
      // 更新逻辑
      console.log("更新逻辑");
      // 对比新 旧
      let proxy = instance.proxy;
      let preTree = instance.subTree;
      let next = instance.render.call(proxy, proxy);}
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
    setupRenderEffect(instance,container);
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

  // -----------------------处理文本-----------------------

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化
      // 创建文本 渲染到页面中
      hostInsert(hostCreateText(n2.children), container);
    } else {
      // 更新
      // patchText(n1, n2);
    }
  };



  // -----------------------处理元素-----------------------


  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = CVnode(children[i]);
      patch(null, child, container);
    }
  }

  const patch = (n1, n2, container) => {
    // 针对不同的类型 1 组件  2  元素 3 文本
    let { shapeFlag , type} = n2;
    console.log("type",type);
    switch(type){
      case TEXT:
        processText(n1,n2,container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理元素 =》 创建元素
          processElement(n1, n2, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container);
        }
    }


    
  };
  
  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化
      mountElement(n2, container);
    } else {
      // 更新
      // patchElement(n1, n2, container);
    }
  }
  const mountElement = (vnode, container) => {
    // 递归 渲染 h('div',{},h('span',{},'hello')) => dom操作 =》放到对应的页面中
    let { type, props, shapeFlag, children } = vnode;
    
    // 创建元素
    let el = hostCreateElement(type);
    // 添加属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 处理儿子
    // h('div, {style:{color:'red'}},'text')  //儿子是文本
    // h('div, {style:{color:'red'}},['text1','text2'])   //儿子是数组
    // h('div, {style:{color:'red'}},h('span',{},'hello')) // 儿子是元素
    if(children){
      if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        console.log("children-走到这里了吗");
        hostSetElementText(el, children);
      }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
        mountChildren(children,el);
      }

    // 放到对应的位置
    hostInsert(el, container);

  }
}
let render = (vnode, container) => {
  console.log("render~11111111~~", vnode);
  // 这里就得到了虚拟dom ， 然后将虚拟dom转换成真实dom
  // 渲染  第一次
  patch(null, vnode, container); // 第一个参数 旧节点 第二个参数 新节点  第三个参数 位置
};
return {
  // 创建vNode
  createApp: apiCreateApp(render),
};
// 给组件 创建一个instance 添加相关信息
// 处理 setup  中 context 四个参数
// 通过代理 方便 proxy 取值

// render (1) setup 返回值是一个函数  就是 render
// 如果 setup 返回值是一个函数 就执行  源码中  就 是通过一个判断 来解决
// 如果 setup 返回值是一个对象 就是值
}