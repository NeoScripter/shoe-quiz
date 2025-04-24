export function accessDomElements<T extends Element>(
    selector: string,
    expectedElementType: new () => T,
    parent: HTMLElement = document.body
): T[] {
    const elements = Array.from(parent.querySelectorAll(selector));

    if (elements.length === 0) {
        throw new Error(`No elements found for selector: ${selector}`);
    }

    const filteredElements = elements.filter(
        (el): el is T => el instanceof expectedElementType
    );

    if (filteredElements.length !== elements.length) {
        throw new Error(
            `Some elements do not match expected type ${expectedElementType.name}`
        );
    }

    return filteredElements;
}
