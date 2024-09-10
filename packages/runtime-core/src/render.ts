// createRender
import { apiCreateApp } from "./apiCreateApp";
export function createRender(renderOptionDom) {
  let render = (vnode, container) => {
    console.log("render~~~", vnode);
  };
  return {
    // 创建vNode
    createApp: apiCreateApp(render),
  };
}
