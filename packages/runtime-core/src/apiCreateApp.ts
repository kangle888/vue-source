import { createVNode } from "./vnode";

export function apiCreateApp(render) {
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
