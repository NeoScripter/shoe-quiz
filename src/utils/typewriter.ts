type QueueItem = () => Promise<void>;

export default class Typewriter {
    #queue: QueueItem[] = [];
    #element: HTMLElement;
    #loop: boolean;
    #typingSpeed: number;
    #deletingSpeed: number;
    #currentInterval: number | null = null;

    constructor(
        parent: HTMLElement,
        { loop = false, typingSpeed = 50, deletingSpeed = 50 } = {}
    ) {
        this.#element = document.createElement('div');
        parent.append(this.#element);
        this.#loop = loop;
        this.#typingSpeed = typingSpeed;
        this.#deletingSpeed = deletingSpeed;
    }

    typeString(string: string) {
        this.#addToQueue((resolve) => {
            let i = 0;
            this.#currentInterval = window.setInterval(() => {
                this.#element.append(string[i]);
                i++;
                if (i >= string.length) {
                    clearInterval(this.#currentInterval!);
                    this.#currentInterval = null;
                    resolve();
                }
            }, this.#typingSpeed);
        });

        return this;
    }

    deleteChars(number: number) {
        this.#addToQueue((resolve) => {
            let i = 0;
            this.#currentInterval = window.setInterval(() => {
                this.#element.innerText = this.#element.innerText.slice(0, -1);
                i++;
                if (i >= number) {
                    clearInterval(this.#currentInterval!);
                    this.#currentInterval = null;
                    resolve();
                }
            }, this.#deletingSpeed);
        });

        return this;
    }

    deleteAll(deleteSpeed = this.#deletingSpeed) {
        this.#addToQueue((resolve) => {
            this.#currentInterval = window.setInterval(() => {
                this.#element.innerText = this.#element.innerText.slice(0, -1);
                if (this.#element.innerText.length === 0) {
                    clearInterval(this.#currentInterval!);
                    this.#currentInterval = null;
                    resolve();
                }
            }, deleteSpeed);
        });

        return this;
    }

    clearOut() {
        this.#queue.length = 0;

        if (this.#currentInterval !== null) {
            clearInterval(this.#currentInterval);
            this.#currentInterval = null;
        }

        this.#element.innerText = '';

        return this;
    }

    pauseFor(duration: number) {
        this.#addToQueue((resolve) => {
            setTimeout(resolve, duration);
        });

        return this;
    }

    async start() {
        let cb = this.#queue.shift();
        while (cb != null) {
            await cb();
            if (this.#loop) this.#queue.push(cb);
            cb = this.#queue.shift();
        }

        return this;
    }

    #addToQueue(cb: (resolve: () => void) => void) {
        this.#queue.push(() => new Promise(cb));
    }
}
