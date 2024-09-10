export declare const nodeOps: {
    createElement(tag: string): HTMLElement;
    remove(child: any): void;
    insert(child: any, parent: any, anchor?: any): void;
    querySelector(selector: string): Element;
    setElementText(el: any, text: any): void;
    createText(text: any): Text;
};
