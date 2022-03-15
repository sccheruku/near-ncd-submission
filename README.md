This project is inspired by the Brave browser's Basic Attention Token - But tailored towards surveys.


We'll allow creating a campaign for surveys. 

```
Survey = {
    survey_id: string
    name: string
    categories: [string]
    amount: number
    minumum_participants: number
    maximum_participants: number
    start_date: Date
    end_date: Date
    questions: [SurveyQuestions]
    responses: [SurveyAnswers]
}

SurveyQuestions = {
    question: string
    options: [string]
}

SurveyAnswers = {
    answers: [string]
}

```