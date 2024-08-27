export declare function isObject(val: any): boolean;
export declare function isArray(val: any): val is any[];
export declare function isFunction(val: any): boolean;
export declare function isString(val: any): val is string;
export declare function isNumber(val: any): val is number;
export declare function hasOwn(target: any, key: any): any;
export declare function isIntegerKey(key: any): boolean;
export declare const hasChanged: (value: any, oldValue: any) => boolean;
