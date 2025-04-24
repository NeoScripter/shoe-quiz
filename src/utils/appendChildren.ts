export function appendChildren(
    parent: HTMLElement,
    elements: HTMLElement[]
): void {
    elements.forEach((el) => parent.appendChild(el));
}
