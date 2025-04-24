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
