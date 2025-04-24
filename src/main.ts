import { answerDescriptions, Question, questions } from './data/questions';
import { segmentMap } from './data/segmentMap';
import { enrichedSegments, SegmentObject } from './data/segments';
import './style.css';
import { accessDomElement } from './utils/accessDomElement';
import { accessDomElements } from './utils/accessDomElements';
import { appendChildren } from './utils/appendChildren';
import { buildElement } from './utils/buildElement';
import Typewriter from './utils/typewriter';

type currentAnswer = number | null;

export class QuizHandler {
    private questions: Question[];
    private answerDescriptions: Record<string, string>;
    private quizElement: HTMLElement;
    private currentAnswers: currentAnswer[];

    constructor(
        questions: Question[],
        answerDescriptions: Record<string, string>,
        quizSelector: string = '.quiz'
    ) {
        this.questions = questions;
        this.answerDescriptions = answerDescriptions;
        this.currentAnswers = [null, null, null, null];

        const el = accessDomElement(quizSelector, HTMLElement);

        this.quizElement = el;
    }

    private selectAnswer(selectedId: number, questionIdx: number) {
        this.currentAnswers[questionIdx] = selectedId;
    }

    private deselectAnswers(btnSelector: string, card: HTMLDivElement) {
        const buttons = accessDomElements(btnSelector, HTMLButtonElement, card);

        buttons.forEach((button) => button.classList.remove('selected'));
    }

    private selectBtnAnswer(btn: HTMLButtonElement) {
        btn.classList.add('selected');
    }

    private addBtnEventListeners() {
        const cards = accessDomElements('.quiz__card-wrapper', HTMLDivElement);

        cards.forEach((card, cardIndex) => {
            const buttons = accessDomElements(
                'button',
                HTMLButtonElement,
                card
            );
            const answerCard = accessDomElement(
                '.answer__card',
                HTMLDivElement,
                card
            );

            const typewriter = new Typewriter(answerCard, {
                loop: false,
                typingSpeed: 20,
                deletingSpeed: 0,
            });

            buttons.forEach((button, btnIndex) =>
                button.addEventListener('click', () => {
                    const answer = button.textContent;

                    if (answer == null) return;

                    const content = this.answerDescriptions[answer];

                    typewriter.clearOut();
                    typewriter.typeString(content).start();

                    this.selectAnswer(btnIndex + 1, cardIndex);
                    this.deselectAnswers('.quiz__answer button', card);
                    this.selectBtnAnswer(button);

                    this.assignSegmentInvalidClasses();
                })
            );
        });
    }

    private renderQuestions() {
        this.quizElement.innerHTML = '';

        const animationClasses = ['right-animation', 'right-animation', 'left-animation', 'left-animation'];

        this.questions.forEach((question) => {
            const wrapper = buildElement('div', `quiz__card-wrapper ${animationClasses.pop()}`);
            const currentQuestionId = question.id.toString();
            wrapper.dataset.questionId = currentQuestionId;

            const card = buildElement('div', 'quiz__card');
            const questionText = buildElement(
                'p',
                'quiz__question',
                question.question
            );
            const answerList = buildElement('ul', 'quiz__answers');
            const answerCard = buildElement('div', 'answer__card');

            question.answers.forEach((answer) => {
                const item = buildElement('li', 'quiz__answer');
                const button = buildElement('button', '', answer.label);

                item.appendChild(button);
                answerList.appendChild(item);
            });

            appendChildren(card, [questionText, answerList]);

            appendChildren(wrapper, [
                card,
                createArrow(),
                answerCard,
                createArrow(),
            ]);

            this.quizElement.appendChild(wrapper);
        });

        this.addBtnEventListeners();
    }

    private renderSegments() {
        const container = accessDomElement(
            '.segments__content',
            HTMLUListElement
        );

        container.innerHTML = '';

      
        enrichedSegments.forEach((segment) => {
            const li = buildElement('li', '', segment.name);
            container.appendChild(li);
        });
    }

    private convertAnswersToString() {
        let result = '';
        this.currentAnswers.forEach((answer) => {
            if (answer === null) {
                result += '?';
            } else {
                result += answer.toString();
            }
        });

        return result;
    }

    private getValidSegments() {
        const key = this.convertAnswersToString();
        if (!(key in segmentMap)) return [];

        return segmentMap[key];
    }

    private removeSegmentClasses() {
        const segments = accessDomElements(
            '.segments__content li',
            HTMLLIElement
        );
        segments.forEach((segment) =>
            segment.classList.remove('success', 'danger')
        );
    }

    private isCompleted() {
        return !this.currentAnswers.includes(null);
    }

    private assignSegmentInvalidClasses() {
        this.removeSegmentClasses();
        const validSegments = this.getValidSegments();

        const segments = accessDomElements(
            '.segments__content li',
            HTMLLIElement
        );

        const completed = this.isCompleted();

        if (completed) {
            this.populateRefContainer(validSegments);
        }

        segments.forEach((segment, idx) => {
            if (validSegments.includes(idx + 1) && completed) {
                segment.classList.add('success');
            } else if (!validSegments.includes(idx + 1)) {
                segment.classList.add('danger');
            }
        });
    }

    private populateRefContainer(segmentIndices: number[]) {
        const container = accessDomElement('.refs', HTMLDivElement);

        try {
            accessDomElement('.segments + .arrow-wrapper', HTMLDivElement);
        } catch {
            container.insertAdjacentElement('beforebegin', createArrow());
        }

        container.innerHTML = "";

        const animationClasses = ['right-animation', 'left-animation', 'right-animation', 'left-animation'];
        segmentIndices.forEach(index => {
            this.createRefCard(enrichedSegments[index], container, animationClasses.pop() || '');
        })

        if (segmentIndices.length < 4) {
            const remaining = 4 - segmentIndices.length;
            Array.from({ length: remaining }, (_, i) => i).forEach(_ => {
                const emptyCard: SegmentObject = {
                    id: 1,
                    name: "Name of the segment",
                    description: "Sorry, we cant recommend you any additional segment.",
                    shoes: [],
                };

                this.createRefCard(emptyCard, container, animationClasses.pop() || '');
            })
        }
    }

    private createRefCard(segment: SegmentObject, container: HTMLDivElement, animationClass: string): void {
        const ref = buildElement('div', `ref ${animationClass}`);
        const title = buildElement('p', 'ref__title', segment.name);
        const description = buildElement(
            'p',
            'ref__description',
            segment.description
        );
        const listTitle = buildElement(
            'p',
            'ref__list-title',
            'List of shoes from this segment'
        );

        const ul = buildElement('ul', 'ref__list');

        segment.shoes.forEach((shoe) => {
            const li = buildElement('li', '', shoe);
            ul.appendChild(li);
        });

        ref.append(title, description, listTitle, ul);
        container.appendChild(ref);
    }

    public init() {
        this.renderQuestions();
        this.renderSegments();
    }
}

const quiz = new QuizHandler(questions, answerDescriptions);
quiz.init();

function createArrow(): HTMLDivElement {
    const wrapper = buildElement('div', 'arrow-wrapper');
    wrapper.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
    <path fill-rule="evenodd" d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
    <path fill-rule="evenodd" d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
  </svg>`;
    return wrapper;
}
