// runtime-dom  这个文件时操作dom的核心文件 1、创建dom 2、更新dom 3、删除dom

import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProp";
import { createRender } from "@vue/runtime-core";

// vue3 dom 的 全部 操作

const renderOptionDom = extend({ patchProps }, nodeOps);

export { renderOptionDom };

// createApp
export const createApp = (rootComponent, rootProps = null) => {
  let app = createRender(renderOptionDom).createApp(rootComponent, rootProps);
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
