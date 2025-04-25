
import { segmentMap } from './data/segmentMap';
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

function createArrow(): HTMLDivElement {
    const wrapper = buildElement('div', 'arrow-wrapper');
    wrapper.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
    <path fill-rule="evenodd" d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
    <path fill-rule="evenodd" d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
  </svg>`;
    return wrapper;
}

export const ANSWERS = {
    BELOW_1_HOUR: { value: 1, label: 'Below 1 hours per week' },
    HOURS_1_TO_3: { value: 2, label: '1-3 hours per week' },
    ABOVE_4_HOURS: { value: 3, label: 'Above 4 hours per week' },
    BELOW_70_KG: { value: 1, label: 'Below 70kg' },
    ABOVE_80_KG: { value: 2, label: 'Above 80kg' },
    COMFORT_PACE: { value: 1, label: 'Comfort pace' },
    FAST_PACE: { value: 2, label: 'Fast pace' },
    SEVERE_OVERPRONATION_YES: { value: 1, label: 'Yes' },
    SEVERE_OVERPRONATION_NO: { value: 2, label: 'No' },
} as const;

export type AnswerOption = {
    value: number;
    label: string;
};
export type Question = {
    id: number;
    question: string;
    answers: AnswerOption[];
};

export const questions: Question[] = [
    {
        id: 1,
        question: 'How many hours of sports do you practice per week?',
        answers: [
            ANSWERS.BELOW_1_HOUR,
            ANSWERS.HOURS_1_TO_3,
            ANSWERS.ABOVE_4_HOURS,
        ],
    },
    {
        id: 2,
        question: 'What is your weight?',
        answers: [ANSWERS.BELOW_70_KG, ANSWERS.ABOVE_80_KG],
    },
    {
        id: 3,
        question: 'How do you plan to use your shoes?',
        answers: [ANSWERS.COMFORT_PACE, ANSWERS.FAST_PACE],
    },
    {
        id: 4,
        question: 'Do you have severe overpronation?',
        answers: [
            ANSWERS.SEVERE_OVERPRONATION_YES,
            ANSWERS.SEVERE_OVERPRONATION_NO,
        ],
    },
];

export const answerDescriptions: Record<string, string> = {
    [ANSWERS.BELOW_1_HOUR.label]:
        'Your stability muscles and ligaments are not yet developed. This means we should focus on shoes with average or increased stability.',
    [ANSWERS.HOURS_1_TO_3.label]:
        'Your stability muscles and ligaments are developed enough to use shoes with average or slightly increased stability. However, highly unstable shoes are still risky.',
    [ANSWERS.ABOVE_4_HOURS.label]:
        'Your stability muscles and ligaments are well prepared to handle any shoes. Therefore, we can focus on faster models, although they offer lower stability.',
    [ANSWERS.BELOW_70_KG.label]:
        'Your weight is relatively low, so we recommend lighter shoes. However, they will provide less cushioning.',
    [ANSWERS.ABOVE_80_KG.label]:
        'You are above average weight, so we suggest choosing shoes with increased cushioning.',
    [ANSWERS.COMFORT_PACE.label]:
        'We prioritize shoes that offer maximum comfort and safety.',
    [ANSWERS.FAST_PACE.label]:
        'We prioritize shoes that enhance your running speed.',
    [ANSWERS.SEVERE_OVERPRONATION_YES.label]:
        'Severe overpronation increases instability, so you should avoid unstable shoes (this applies only to untrained runners).',
    [ANSWERS.SEVERE_OVERPRONATION_NO.label]:
        'Without overpronation problems, you have no specific limitations.',
};

export type SegmentObject = {
    id: number;
    name: string;
    description: string;
    shoes: string[];
  };

export const enrichedSegments: SegmentObject[] = [
    {
        id: 1,
        name: 'Stability',
        description: 'Offers exceptional lightness and foot support.',
        shoes: ['Sprint Edge', 'Runner Pro', 'CushionX'],
    },
    {
        id: 2,
        name: 'Stability with extra cushioning',
        description: 'Perfect for long distances with enhanced cushioning.',
        shoes: ['GlideForm', 'AirFlow Max'],
    },
    {
        id: 3,
        name: 'Stability with extra lightness',
        description: 'Recommended for daily training with great lightness.',
        shoes: ['TrailBlazer', 'Speedster', 'CushionX'],
    },
    {
        id: 4,
        name: 'Support',
        description:
            'Ideal for cushioning runners looking for balance and performance.',
        shoes: ['Runner Pro', 'GlideForm'],
    },
    {
        id: 5,
        name: 'Support with extra cushioning',
        description: 'Designed for maximum stability and style.',
        shoes: ['TrailBlazer', 'AirFlow Max', 'Sprint Edge'],
    },
    {
        id: 6,
        name: 'Support with extra lightness',
        description: 'Perfect for long distances with enhanced stability.',
        shoes: ['Speedster', 'CushionX'],
    },
    {
        id: 7,
        name: 'Balance',
        description: 'Recommended for daily training with great grip.',
        shoes: ['AirFlow Max', 'Runner Pro'],
    },
    {
        id: 8,
        name: 'Balance with extra cushioning',
        description:
            'Ideal for cushioning runners looking for balance and performance.',
        shoes: ['TrailBlazer', 'Sprint Edge'],
    },
    {
        id: 9,
        name: 'Balance with extra lightness',
        description: 'Offers exceptional cushioning and foot support.',
        shoes: ['Speedster', 'CushionX', 'GlideForm'],
    },
    {
        id: 10,
        name: 'Swing',
        description: 'Perfect for long distances with enhanced grip.',
        shoes: ['GlideForm', 'Runner Pro'],
    },
    {
        id: 11,
        name: 'Swing with extra cushioning',
        description: 'Recommended for daily training with great comfort.',
        shoes: ['Sprint Edge', 'TrailBlazer'],
    },
    {
        id: 12,
        name: 'Swing with extra lightness',
        description: 'Offers exceptional grip and foot support.',
        shoes: ['AirFlow Max', 'CushionX'],
    },
    {
        id: 13,
        name: 'Bounce',
        description: 'Perfect for long distances with enhanced lightness.',
        shoes: ['Speedster', 'GlideForm'],
    },
    {
        id: 14,
        name: 'Bounce with extra cushioning',
        description:
            'Ideal for stability runners looking for balance and performance.',
        shoes: ['Sprint Edge', 'AirFlow Max', 'Runner Pro'],
    },
    {
        id: 15,
        name: 'Bounce with extra lightness',
        description: 'Recommended for daily training with great cushioning.',
        shoes: ['TrailBlazer', 'Speedster'],
    },
    {
        id: 16,
        name: 'Speed illegal',
        description: 'Designed for maximum comfort and style.',
        shoes: ['CushionX', 'Runner Pro', 'Sprint Edge'],
    },
    {
        id: 17,
        name: 'Speed Swing',
        description: 'Perfect for long distances with enhanced comfort.',
        shoes: ['Speedster', 'AirFlow Max'],
    },
    {
        id: 18,
        name: 'Speed lightness',
        description: 'Offers exceptional grip and foot support.',
        shoes: ['TrailBlazer', 'GlideForm'],
    },
    {
        id: 19,
        name: 'Speed lightness bouncy',
        description:
            'Ideal for grip runners looking for balance and performance.',
        shoes: ['Runner Pro', 'CushionX'],
    },
];

const quiz = new QuizHandler(questions, answerDescriptions);
quiz.init();


