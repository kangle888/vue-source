export declare function ref(value: any): RefImpl;
export declare function shallowRef(value: any): RefImpl;
declare class RefImpl {
    rawValue: any;
    shallow: any;
    private _value;
    __v_isRef: boolean;
    constructor(rawValue: any, shallow: any);
    get value(): any;
    set value(newVal: any);
}
export {};
