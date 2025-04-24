export function createClassedElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}
