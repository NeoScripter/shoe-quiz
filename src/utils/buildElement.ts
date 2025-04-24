export function buildElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    textContent = ''
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = textContent;
    return element;
}
