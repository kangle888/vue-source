export const patchStyle = (el, prev, next) => {
  // style 处理
  const style = el.style;
  if (!next) {
    el.removeAttribute("style");
  } else {
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
