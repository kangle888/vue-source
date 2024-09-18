var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
    ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
    ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
    ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
})(ShapeFlags || (ShapeFlags = {}));

// 公共方法
function isObject(val) {
    return typeof val === "object" && val !== null;
}
function isArray(val) {
    return Array.isArray(val);
}
function isFunction(val) {
    return typeof val === "function";
}
function isString(val) {
    return typeof val === "string";
}
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(target, key) {
    return hasOwnProperty.call(target, key);
}
// 判断是否是整数的key
function isIntegerKey(key) {
    return parseInt(key) + "" === key;
}
const hasChanged = (value, oldValue) => value !== oldValue;
// 合并
const extend = Object.assign;

// 操作节点的 增 删 改 查
const nodeOps = {
    // 创建元素
    createElement(tag) {
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
    querySelector(selector) {
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

const patchClass = (el, value) => {
    if (value == null) {
        value = "";
    }
    else {
        el.className = value;
    }
};

const patchStyle = (el, prev, next) => {
    // style 处理
    const style = el.style;
    if (!next) {
        el.removeAttribute("style");
    }
    else {
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

// 自定义的属性
const patchAttr = (el, key, value) => {
    if (value == null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, value);
    }
};

// 处理事件
//  div  @click="handleClick"  ->  div @click = "handleClick1"
// 元素绑定 是 通过 addEventListener 来绑定的
const patchEvent = (el, key, value) => {
    // 1、 对函数进行缓存
    const invokers = el._vei || (el._vei = {});
    const existingInvoker = invokers[key];
    if (value && existingInvoker) {
        // 2、新的和老的都有，更新事件
        existingInvoker.value = value;
    }
    else {
        const eventName = key.slice(2).toLowerCase();
        if (value) {
            //3、新的有,老的没有，添加事件
            let invoker = (invokers[key] = createInvoker(value));
            el.addEventListener(eventName, invoker);
        }
        else {
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

// 属性 操作
// 使用了策略模式
const patchProps = (el, key, prevValue, nextValue) => {
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
            }
            else {
                // 自定义属性
                patchAttr(el, key, nextValue);
            }
    }
};

// 创建虚拟节点 createVNode  和 h 函数 一样
// 创建虚拟节点
// type 组件的类型
// props 组件的属性
// children 子节点
// key
// el 真实节点
// shapeFlag
// import { ShapeFlags } from "@vue/shared";
const createVNode = (type, props, children = null) => {
    // 虚拟节点
    // console.log("创建虚拟节点", rootComponent, rootProps);
    // vnode  {} 区别是组件还是元素 使用了位移运算符
    let shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
        : isObject(type)
            ? ShapeFlags.STATEFUL_COMPONENT
            : 0;
    const vnode = {
        _v_isVNode: true, // 是否是虚拟节点
        type, // 组件的类型
        props, // 组件的属性
        children, // 子节点
        key: props && props.key, // key
        el: null, // 真实节点
        conmponent: {}, // 组件实例
        shapeFlag,
    };
    // 如果有儿子节点
    normalizeChildren(vnode, children);
    return vnode;
};
function normalizeChildren(vnode, children) {
    let type = 0;
    if (children === null) {
        type = 0;
    }
    else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN;
    }
    else {
        type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type; // 位运算符 这里是位运算
    // 例如 0000100 | 0000010 = 0000110
}
function isVnode(vnode) {
    // 判断是不是虚拟节点
    return vnode._v_isVNode;
}
// 元素的children 变成vnode
const TEXT = Symbol("text");
function CVnode(child) {
    if (isObject(child)) {
        return child;
    }
    return createVNode(TEXT, null, child + "");
}

function apiCreateApp(render) {
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

const componentPublicInstance = {
    get({ _: instance }, key) {
        const { setupState, props, data } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        else if (key in props) {
            return props[key];
        }
        // else {
        //   return data[key];
        // }
    },
    set({ _: instance }, key, value) {
        const { setupState, props, data } = instance;
        if (key in setupState) {
            setupState[key] = value;
        }
        else if (key in props) {
            props[key] = value;
        }
        // else {
        //   data[key] = value;
        // }
    },
};

// 1. 创建组件实例
const createComponentInstance = (vnode) => {
    const instance = {
        vnode,
        type: vnode.type,
        props: {}, //组件的属性
        attrs: {},
        setupState: {}, // setup返回的状态
        ctx: {}, //代理
        proxy: {}, // 代理
        render: null, // 组件的render方法
        data: { a: 1 }, // 组件的数据
        isMounted: false, // 是否挂载
    };
    instance.ctx = { _: instance };
    return instance;
};
// 2. 解析数据到这个实例对象上
const setupComponent = (instance) => {
    // 设置值
    const { props, children } = instance.vnode;
    // 根据props解析到组件实例上
    instance.props = props; // initProps
    instance.children = children; // 插槽
    // 看一下这个组件是不是有setup函数
    let isStateFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
    if (isStateFlag) {
        // 有状态组件
        setupStatefulComponent(instance);
    }
};
// 处理setup函数
function setupStatefulComponent(instance) {
    // 代理
    instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
    // setup 可以是一个对象 也可以是一个函数
    // 获取组件的类型  拿到setup 方法
    let Component = instance.vnode.type;
    let { setup } = Component;
    // 看一下这个组件有没有setup  render
    if (setup) {
        // 执行setup
        // 处理参数
        let setupContext = createSetupContext(instance);
        // 执行setup
        let setupResult = setup(instance.props, setupContext);
        // 问题 setupResult 可能是对象 也可能是函数
        handlerSetupResult(instance, setupResult); // 如果是对象就是值 如果是函数就是render
    }
    else {
        // 没有setup 直接执行render
        finishComponentSetup(instance);
    }
    Component.render(instance.proxy);
}
// 处理setup返回的结果
function handlerSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    else if (typeof setupResult === "function") {
        instance.render = setupResult;
    }
    // 走render方法
    finishComponentSetup(instance);
}
// 处理完setup后 走render方法
function finishComponentSetup(instance) {
    // 判断一下 组件中有没有render方法
    let Component = instance.vnode.type;
    if (!instance.render) {
        // 没有render   // 这里是 模板 =》 render
        if (!Component.render && Component.template) {
            instance.render = Component.render;
        }
        instance.render = Component.render;
    }
    // console.log(instance.render.toString(), "render");
}
function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: () => { },
        expose: () => { },
    };
}

// 定义了 effect 函数，用于创建一个响应式的副作用函数
// effect 函数接收两个参数，第一个参数是一个函数，第二个参数是一个配置对象
// effect 函数返回一个函数，这个函数就是响应式的副作用函数
function effect(fn, options = {}) {
    if (fn.effect) {
        fn = fn.effect;
    }
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect();
    }
    return effect;
}
let uid = 0;
let activeEffect; // 用于保存当前的effect
const effectStack = []; // 存储effect的栈
function createReactiveEffect(fn, options) {
    //返回一个函数
    const effect = function reactiveEffect() {
        // 执行
        // 判断effect是否在effectStack中 如果不在则执行 /
        // 这里的意思 就是 如果重新执行了effect，不会再次添加到effectStack中
        if (!effectStack.includes(effect)) {
            try {
                // 入栈
                effectStack.push(effect);
                activeEffect = effect;
                return fn();
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    // 为effect添加属性 effect是函数对象 可以添加属性
    effect.id = uid++; // 唯一标识区别effect
    effect._isEffect = true; // 标识是一个effect，区分effect是不是响应式
    effect.raw = fn; // 保存原函数
    effect.options = options; // 报存用户传入的配置
    return effect;
}
// 收集effect依赖, 在获取数据的时候触发get  收集effect
let targetMap = new WeakMap();
function Track(target, type, key) {
    console.log("收集依赖", target, type, key, activeEffect);
    // 对应的effect
    // key 和我们的effect 一一对应 map=> key = target => 属性 => [effect] set
    if (activeEffect === undefined) {
        // 没有effect依赖
        return;
    }
    // 获取effect  {target:{key:(name)}}
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    // 获取key对应的effect
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    // 如果没有收集过依赖
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
    console.log("targetMap", targetMap);
}
// 问题  effect 会有嵌套的问题存在
// effect(() => {
//   state.name = 'lisi'
//   state.age = 20
//    effect(() => {
//       state.name = 'lisi'
//         state.age = 20
//      }
// })
// 触发更新
//1、处理对象
function trigger(target, type, key, newValue, oldValue) {
    console.log("触发更新", target, type, key, newValue, oldValue);
    // 获取对应的effect
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    // 有目标对象
    let effectSet = new Set(); // 如果有多个同时修改一个值，set过滤掉重复的effect
    const add = (effectsAdd) => {
        if (effectsAdd) {
            effectsAdd.forEach((effect) => {
                effectSet.add(effect);
            });
        }
    };
    add(depsMap.get(key));
    // 处理数组 就是  key = length
    if (key === "length" && isArray(target)) {
        depsMap.forEach((dep, key) => {
            // 如果改变的是数组长度，那么length也要触发更新
            if (key === "length" || key >= newValue) {
                add(dep);
            }
        });
    }
    else {
        // 对象
        if (key !== undefined) {
            add(depsMap.get(key));
        }
        // 数组  使用 索引进行修改
        switch (type) {
            case 1 /* TrackOpTypes.ADD */:
                if (isArray(target) && isIntegerKey(key)) {
                    add(depsMap.get("length"));
                }
        }
    }
    // 执行effectSet
    effectSet.forEach((effect) => {
        // effect();
        if (effect.options.scheduler) {
            effect.options.scheduler(effect);
        }
        else {
            effect();
        }
    });
}

// get 柯里化方法
const get = createGetter(); // 不是仅读的 可以修改(深度)
const shallowReactiveGet = createGetter(false, true); // 不是仅读的 可以修改(浅层)
const readonlyGet = createGetter(true); // 仅读的 不能修改
const shallowReadonlyGet = createGetter(true, true); // 仅读的 不能修改
// set 柯里化方法
const set = createSetter();
const shallowReactiveSet = createSetter(true);
/**
 *
 * @param shallow 是否是浅层
 * @returns
 */
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        // 这里需要先获取老值
        const oldValue = target[key];
        // 这里是将target 设置为最新的值
        const res = Reflect.set(target, key, value, receiver);
        console.log("响应式设置", key, value);
        // 注意 1 如果是新增属性 2 如果是修改属性
        // 如果是新增属性 会触发两次 1.添加属性 2.修改属性
        // 如果是修改属性 会触发一次
        // 判断数组还是对象  [1,2,3]  Number(key) < target.length这里判断为修改数组
        let hasKey = isArray(target) && isIntegerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        if (!hasKey) {
            console.log("新增属性");
            // 新增属性
            trigger(target, 1 /* TrackOpTypes.ADD */, key, value);
        }
        else if (oldValue !== value) {
            console.log("修改属性");
            // 修改属性
            trigger(target, 2 /* TrackOpTypes.SET */, key, value, oldValue);
        }
        return res;
    };
}
/**
 *
 * @param isReadonly  是否是只读
 * @param shall  是否是浅层
 * @returns
 */
function createGetter(isReadonly = false, shall = false) {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        console.log("响应式获取", key, res);
        if (!isReadonly) {
            // 如果不是仅读的
            // 收集effect依赖
            Track(target, 0 /* TrackOpTypes.GET */, key);
        }
        if (shall) {
            // 浅层代理
            return res;
        }
        // 如果是对象 递归代理
        // 面试 懒代理  如果不使用 先不代理
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const reactiveHandlers = {
    get,
    set,
};
const shallowReactiveHandlers = {
    get: shallowReactiveGet,
    set: shallowReactiveSet,
};
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`);
        return true;
    },
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: (target, key, value) => {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`);
        return true;
    },
};
// 面试 ： 响应式 api  reactive  proxy 懒代理
//  readonly   effect  {}

function reactive(target) {
    /**
     * 1. target 是不是对象
     * 2. false 代表不是 readonly
     * 3. reactiveHandlers 代表深层代理
     */
    return createReactiveObject(target, false, reactiveHandlers); // 高阶函数
}
function shallowReactive(target) {
    /**
     * 1. target 是不是对象
     * 2. false 代表不是 readonly
     * 3. shallowReactiveHandlers 代表浅层代理
     */
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    /**
     * 1. target 是不是对象
     * 2. true 代表是 readonly
     * 3. readonlyHandlers 代表深层代理
     */
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    /**
     * 1. target 是不是对象
     * 2. true 代表是 readonly
     * 3. shallowReadonlyHandlers 代表浅层代理
     */
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
// 核心代理函数实现
// 
const reactiveMap = new WeakMap(); // key 只能是对象 自动垃圾回收
const readonlyMap = new WeakMap();
function createReactiveObject(target, isReadonly = false, baseHandlers) {
    // 判断是否是对象
    if (!isObject(target)) {
        return target;
    }
    // 1. 查找缓存
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    const exisitingProxy = proxyMap.get(target); // 如果已经代理过了 直接返回
    if (exisitingProxy) {
        return exisitingProxy;
    }
    // 2. 创建 Proxy
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
// 注意 核心 proxy

function ref(value) {
    return createRef(value);
}
function shallowRef(value) {
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
    rawValue;
    shallow;
    _value;
    __v_isRef = true;
    constructor(rawValue, shallow) {
        this.rawValue = rawValue;
        this.shallow = shallow;
        this._value = rawValue;
    }
    get value() {
        // 收集依赖
        Track(this, 0 /* TrackOpTypes.GET */, "value");
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._value)) {
            this._value = newVal;
            this.rawValue = newVal;
            // 触发更新
            console.log("ref触发更新");
            trigger(this, 2 /* TrackOpTypes.SET */, "value", newVal);
        }
    }
}
// 实现toRef
function toRef(object, key) {
    return new ObjectRefImpl(object, key);
}
class ObjectRefImpl {
    object;
    key;
    __v_isRef = true;
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    get value() {
        return this.object[this.key];
    }
    set value(newVal) {
        this.object[this.key] = newVal;
    }
}
// 实现toRefs
function toRefs(object) {
    const ret = Array.isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}

function computed(getterOrOptions) {
    // 这里的getterOrOptions 可能是一个函数，也可能是一个对象
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = () => {
            console.warn("Write operation failed: computed value is readonly");
        };
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    // 返回值
    return new ComputedRefImpl(getter, setter);
}
class ComputedRefImpl {
    _setter;
    // 定义属性
    _dirty = true; // 默认执行
    _value; // 缓存值
    effect; // 用于收集依赖
    constructor(getter, _setter) {
        this._setter = _setter;
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

// createRender
function createRender(renderOptionDom) {
    // 获取全部的操作dom的方法
    const { insert: hostInsert, remove: hostRemove, patchProps: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setElementText: hostSetElementText, setText: hostSetText } = renderOptionDom;
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
                let subTree = instance.subTree = instance.render.call(proxy, proxy);
                console.log("subTree", subTree);
                // 组件渲染的节点 =》真实dom、
                // 渲染子树 创建元素
                patch(null, subTree, container);
                instance.isMounted = true;
            }
            else {
                // 更新逻辑
                console.log("更新逻辑");
                // 对比新 旧
                let proxy = instance.proxy;
                instance.subTree;
                instance.render.call(proxy, proxy);
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
        setupRenderEffect(instance, container);
    };
    // 组件的创建
    const processComponent = (n1, n2, container) => {
        {
            // 第一次挂载时
            // 组件的挂载
            mountComponent(n2, container);
        }
    };
    // -----------------------处理文本-----------------------
    const processText = (n1, n2, container) => {
        {
            // 初始化
            // 创建文本 渲染到页面中
            hostInsert(hostCreateText(n2.children), container);
        }
    };
    // -----------------------处理元素-----------------------
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            let child = CVnode(children[i]);
            patch(null, child, container);
        }
    };
    const patch = (n1, n2, container) => {
        // 针对不同的类型 1 组件  2  元素 3 文本
        let { shapeFlag, type } = n2;
        console.log("type", type);
        switch (type) {
            case TEXT:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理元素 =》 创建元素
                    processElement(n1, n2, container);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container);
                }
        }
    };
    const processElement = (n1, n2, container) => {
        {
            // 初始化
            mountElement(n2, container);
        }
    };
    const mountElement = (vnode, container) => {
        // 递归 渲染 h('div',{},h('span',{},'hello')) => dom操作 =》放到对应的页面中
        let { type, props, shapeFlag, children } = vnode;
        // 创建元素
        let el = hostCreateElement(type);
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
        if (children) {
            if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                console.log("children-走到这里了吗");
                hostSetElementText(el, children);
            }
            else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                mountChildren(children, el);
            }
            // 放到对应的位置
            hostInsert(el, container);
        }
    };
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

function h(type, propsOrChildren, children) {
    // 创建虚拟节点
    const i = arguments.length; // 参数的长度
    if (i === 2) {
        // 如果参数的长度为2
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 如果是对象并且不是数组
            if (isVnode) {
                // 如果是虚拟节点
                return createVNode(type, null, [propsOrChildren]);
            }
            // 没有 儿子
            return createVNode(type, propsOrChildren);
        }
        else {
            // 就是 儿子  children
            return createVNode(type, null, propsOrChildren);
        }
    }
    else {
        // 三个参数
        if (i > 3) {
            // 如果参数的长度大于3
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (i === 3 && isVnode(children)) {
            // 如果参数的长度等于3 并且是虚拟节点
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
}
// h函数是变成虚拟dom的函数

// runtime-dom  这个文件时操作dom的核心文件 1、创建dom 2、更新dom 3、删除dom
// vue3 dom 的 全部 操作
const renderOptionDom = extend({ patchProps }, nodeOps);
// createApp
const createApp = (rootComponent, rootProps = null) => {
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

export { computed, createApp, createRender, effect, h, reactive, readonly, ref, renderOptionDom, shallowReactive, shallowReadonly, shallowRef, toRef, toRefs };
//# sourceMappingURL=runtime-dom.esm-bundler.js.map
