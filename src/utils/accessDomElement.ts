export function accessDomElement<T extends Element>(
    selector: string,
    expectedElementType: new () => T,
    parent: HTMLElement = document.body
): T {
    const element = parent.querySelector(selector);

    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }

    if (!(element instanceof expectedElementType)) {
        throw new Error(
            `Expected ${expectedElementType.name}, but found ${element.constructor.name}`
        );
    }

    return element;
}
