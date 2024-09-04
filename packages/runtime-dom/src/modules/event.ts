// 处理事件
//  div  @click="handleClick"  ->  div @click = "handleClick1"
// 元素绑定 是 通过 addEventListener 来绑定的

export const patchEvent = (el, key, value) => {
  // 1、 对函数进行缓存
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[key];
  if (value && existingInvoker) {
    // 2、新的和老的都有，更新事件
    existingInvoker.value = value;
  } else {
    const eventName = key.slice(2).toLowerCase();
    if (value) {
      //3、新的有,老的没有，添加事件
      let invoker = (invokers[key] = createInvoker(value));
      el.addEventListener(eventName, invoker);
    } else {
      //4、新的没有，老的有，移除事件
      el.removeEventListener(eventName, existingInvoker);
      invokers[key] = undefined; // 清除缓存
    }
  }
};

const createInvoker = (value) => {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = value;
  return invoker;
};
