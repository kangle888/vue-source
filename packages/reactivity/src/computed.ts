import { isFunction } from "@vueshared";
import { effect, trigger } from "./effect";

export function computed(getterOrOptions) {
  // 这里的getterOrOptions 可能是一个函数，也可能是一个对象

  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("Write operation failed: computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  // 返回值
  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  // 定义属性
  public _dirty = true; // 默认执行
  public _value; // 缓存值
  public effect; // 用于收集依赖
  constructor(getter, private _setter) {
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          // 触发更新
          // trigger(this, "set", "value");
        }
      },
    });
  }

  get value() {
    // 获取执行
    if (this._dirty) {
      // 这个effect就是  构造函数中的 this.effect
      this._value = this.effect();
      this._dirty = false;
    }
    // 收集依赖
    return this._value;
  }

  set value(newValue) {
    this._setter(newValue);
  }
}
