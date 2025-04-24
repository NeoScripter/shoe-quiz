import { answerDescriptions, Question, questions } from './data/questions';
import './style.css';
import { accessDomElement } from './utils/accessDomElement';
import { accessDomElements } from './utils/accessDomElements';
import { appendChildren } from './utils/appendChildren';
import { createClassedElement } from './utils/createClassedElement';

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

    private createArrow(): HTMLDivElement {
        const wrapper = createClassedElement('div', 'arrow-wrapper');
        wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
          <path fill-rule="evenodd" d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
          <path fill-rule="evenodd" d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clip-rule="evenodd"/>
        </svg>`;
        return wrapper;
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

            buttons.forEach((button, btnIndex) =>
                button.addEventListener('click', () => {
                    const answer = button.textContent;

                    if (answer == null) return;

                    answerCard.textContent = this.answerDescriptions[answer];
                    this.selectAnswer(btnIndex + 1, cardIndex);
                    this.deselectAnswers('.quiz__answer button', card);
                    this.selectBtnAnswer(button);
                })
            );
        });
    }

    public renderQuestions() {
        this.quizElement.innerHTML = '';

        this.questions.forEach((question) => {
            const wrapper = createClassedElement('div', 'quiz__card-wrapper');
            const currentQuestionId = question.id.toString();
            wrapper.dataset.questionId = currentQuestionId;

            const card = createClassedElement('div', 'quiz__card');
            const questionText = createClassedElement('p', 'quiz__question');
            questionText.textContent = question.question;
            const answerList = createClassedElement('ul', 'quiz__answers');
            const answerCard = createClassedElement('div', 'answer__card');
            answerCard.textContent = '';

            question.answers.forEach((answer) => {
                const item = createClassedElement('li', 'quiz__answer');

                const button = document.createElement('button');
                button.textContent = answer.label;

                item.appendChild(button);
                answerList.appendChild(item);
            });

            appendChildren(card, [questionText, answerList]);

            const topArrow = this.createArrow();
            const bottomArrow = this.createArrow();
            appendChildren(wrapper, [card, topArrow, answerCard, bottomArrow]);

            this.quizElement.appendChild(wrapper);
        });

        this.addBtnEventListeners();
    }
}

const quiz = new QuizHandler(questions, answerDescriptions);
quiz.renderQuestions();
