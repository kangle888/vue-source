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
      let nextTree = instance.render.call(proxy, proxy);
      instance.subTree = nextTree;
      patch(preTree, nextTree, container); // 更新 1、 旧的元素 2、新的虚拟dom
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

  const isSameVnodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  }
  const unmount = (vnode) => {
    // 删除元素
    hostRemove(vnode.el);
  }


  const patch = (n1, n2, container, anchor=null ) => {
    // 针对不同的类型 1 组件  2  元素 3 文本
     // 比对  vue2中 1：判断是不是同一个元素 
     // 2: 是同一个元素的话，比对属性，递归比对儿子
     // 判断是不是同一个元素
    if (n1 && !isSameVnodeType(n1, n2)) {
      // 删除老的元素
      unmount(n1);
      n1 = null;  
    }


    let { shapeFlag , type} = n2;
    console.log("type",type);
    switch(type){
      case TEXT:
        processText(n1,n2,container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理元素 =》 创建元素
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container);
        }
    }


    
  };

  const patchProps = (el, oldProps, newProps) => {
    // 注意 1、老的有 新的没有 2、新的有 老的没有 3、新的和老的都有
    // <div class style></div>  新 <div class ></div>
    if (oldProps !== newProps) {
      // 新的属性覆盖老的属性
      for (let key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      // 老的有 新的没有
      for (let key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

// 儿子都是数组的情况
const patchKeyedChildren = (c1, c2, container) => {
  // vue2 采用的是双指针的方式 
  // vue3 采用的sync from start : 从头开始比对
  let i = 0;
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  //sync from start 从头开始比对 (1) 同一位置比对
  // 2 那个数组先比对完就结束
  // 旧的 <div> <p></p> <h2></h2> </div>
  // 新的 <div><p></p> <span></span> <p></p> </div>
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVnodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }
    i++;
  }

  // sync from end 从尾部开始比对

  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVnodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }
    e1--;
    e2--;
  }
  // 1、旧的先比对完  新的多  说明有新增的
  if(i > e1){
    // 添加数据：有可能是向前插入  有可能是向后插入
    const nextPos = e2 + 1; // 插入的位置
    // 如果是前插入 
    const anchor = nextPos < c2.length ? c2[nextPos].el : null; // 参考物
    while(i <= e2){
      patch(null, c2[i], container , anchor);
      i++;
    }
  } 

  // 2、新的先比对完  旧的多  说明有删除的
  if (i <= e1) {
    // 删除操作
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  }


  // 3、都没有比对完  说明是乱序的情况

}



  const patchChildren = (n1, n2, container) => {
   const c1 = n1.children;
    const c2 = n2.children;

    const prevShapeFlag = n1.shapeFlag;
    const newShapeFlag = n2.shapeFlag;
    // 儿子对比 
    // 1、旧的有 新的没有  删除 2、新的有 旧的没有  增加  3、新的和旧的都有  更新

    // 新的是文本
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      // 不是文本的情况 新的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 都有儿子的情况  就要走diff算法
        patchKeyedChildren(c1, c2, container);

      }else {
          // 新的是数组
          hostSetElementText(container, "");
          mountChildren(c2, container);
        }
  }
}


  
  // 同一个元素的比对
  const patchElement = (n1, n2, container) => {
    let el = (n2.el = n1.el); // 获取真实的节点
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // 比对属性
    patchProps(el, oldProps, newProps);
    // 比对儿子
    patchChildren(n1, n2, el);
  }


  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      // 初始化   会重新执行
      mountElement(n2, container, anchor);
    } else {
      // 更新
      // 处理同一个元素  1、先处理属性 2、再处理儿子
      patchElement(n1, n2, container);
    }
  }

  const mountElement = (vnode, container,anchor) => {
    // 递归 渲染 h('div',{},h('span',{},'hello')) => dom操作 =》放到对应的页面中
    let { type, props, shapeFlag, children } = vnode;
    
    // 创建元素
    let el = vnode.el =  hostCreateElement(type);
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
    hostInsert(el, container, anchor);

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