// 操作节点的 增 删 改 查

export const nodeOps = {
  // 创建元素
  createElement(tag: string) {
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
  querySelector(selector: string) {
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
