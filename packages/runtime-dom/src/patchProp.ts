// 属性 操作

import { patchClass } from "./modules/class";
import { patchStyle } from "./modules/style";
import { patchAttr } from "./modules/attr";
import { patchEvent } from "./modules/event";

// 使用了策略模式

export const patchProps = (el, key, prevValue, nextValue) => {
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
      } else {
        // 自定义属性
        patchAttr(el, key, nextValue);
      }
  }
};
