export declare function isObject(val: any): boolean;
export declare function isArray(val: any): val is any[];
export declare function isFunction(val: any): boolean;
export declare function isString(val: any): val is string;
export declare function isNumber(val: any): val is number;
export declare function hasOwn(target: any, key: any): any;
export declare function isIntegerKey(key: any): boolean;
export declare const hasChanged: (value: any, oldValue: any) => boolean;
export declare const extend: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
