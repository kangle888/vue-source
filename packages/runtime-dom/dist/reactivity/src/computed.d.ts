export declare function computed(getterOrOptions: any): ComputedRefImpl;
declare class ComputedRefImpl {
    private _setter;
    _dirty: boolean;
    _value: any;
    effect: any;
    constructor(getter: any, _setter: any);
    get value(): any;
    set value(newValue: any);
}
export {};
