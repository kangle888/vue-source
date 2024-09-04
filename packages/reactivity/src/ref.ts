import { hasChanged } from "@vueshared";
import { Track, trigger } from "./effect";
import { TrackOpTypes } from "./operations";

export function ref(value) {
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(rawValue, shallow = false) {
  // if (isRef(rawValue)) {
  //   return rawValue;
  // }
  return new RefImpl(rawValue, shallow);
}

// 创建类
class RefImpl {
  private _value;
  public __v_isRef = true;
  constructor(public rawValue, public shallow) {
    this._value = rawValue;
  }
  get value() {
    // 收集依赖
    Track(this, TrackOpTypes.GET, "value");
    return this._value;
  }
  set value(newVal) {
    if (hasChanged(newVal, this._value)) {
      this._value = newVal;
      this.rawValue = newVal;
      // 触发更新
      console.log("ref触发更新");
      trigger(this, TrackOpTypes.SET, "value", newVal);
    }
  }
}

// 实现toRef
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public object, public key) {}
  get value() {
    return this.object[this.key];
  }
  set value(newVal) {
    this.object[this.key] = newVal;
  }
}

// 实现toRefs
export function toRefs(object) {
  const ret = Array.isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
