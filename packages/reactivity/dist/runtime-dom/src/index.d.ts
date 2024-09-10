declare const renderOptionDom: {
    patchProps: (el: any, key: any, prevValue: any, nextValue: any) => void;
} & {
    createElement(tag: string): HTMLElement;
    remove(child: any): void;
    insert(child: any, parent: any, anchor?: any): void;
    querySelector(selector: string): Element;
    setElementText(el: any, text: any): void;
    createText(text: any): Text;
};
export { renderOptionDom };
export declare const createApp: (rootComponent: any, rootProps?: any) => {
    mount(rootContainer: any): void;
};
