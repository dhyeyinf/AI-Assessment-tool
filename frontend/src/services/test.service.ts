import axiosInstance from "../utils/axiosConfig";  // ← custom axios with JWT
import { ApiHandler, axiosWrapper } from "../utils/api-handler";

export interface QuestionData {
    id: number,
    role: string;
    question: string;
    function_name: string;
    language: string;
    answered: {
        code: string;
        evaluation: string;
    };
    answeredcheck: boolean;
    test_cases: {
        input: string,
        output: string
    }[]


}

export interface AnswerData {
    question: string;
    answer: string;
    evaluation: string;
}

export interface CandidateDetails {
    name: string;
    email: string;
    password: string | number;
}

class TestService {

    async createAssessment(payload: any): Promise<any> {
        return await ApiHandler.handle<any>(
            () => axiosWrapper(axiosInstance.post("api/assessment/create/", payload))
        )
    }

    async validateCandidate(details: CandidateDetails): Promise<any> {

        const payload = {
            username: details.email,
            password: details.password
        }
        const response = await ApiHandler.handle<any>(() =>
            axiosWrapper(axiosInstance.post("/api/token/", payload))
        );
        localStorage.setItem('candidateDetail', JSON.stringify(details))
        return response;
    }

    async getAllQuestions(): Promise<any> {
        return await ApiHandler.handle<void>(() =>
            axiosWrapper(axiosInstance.get("/api/assessment/get-redis-data/?key=questions"))
        );
    }

    async getQuestion(): Promise<any> {
        const response = await ApiHandler.handle<any>(() =>
            axiosWrapper(axiosInstance.get(`/api/assessment/get-question/`))
        );
        console.log(response)
        return response;
    }

    async runCode(data: QuestionData, code: string): Promise<any> {
        const payload = {
            code,
            function_name: data.function_name,
            test_cases: data.test_cases,
        };
        const response = await ApiHandler.handle<any>(() =>
            axiosWrapper(axiosInstance.post("/api/assessment/run-code/", payload))
        );
        return response;
    }

    async submitCode(data: QuestionData, code: string): Promise<any> {
        const payload = {
            code,
            questionData: data
        };
        const response = await ApiHandler.handle<any>(() =>
            axiosWrapper(axiosInstance.post("/api/assessment/submit-code/", payload))
        );
        return response;
    }

    async submitPDF(time_taken: string): Promise<any> {
        const rawData = localStorage.getItem('candidateDetail')
        let candidateDetail = undefined
        if (rawData != null)
            candidateDetail = JSON.parse(rawData)
        const payload = {
            candidate_name: candidateDetail?.name,
            time_taken: time_taken,
        };
        console.log(payload)

        const response = await ApiHandler.handle<any>(() =>
            axiosWrapper(axiosInstance.post("/api/assessment/generate-pdf/", payload))
        );
        return response;
    }
}

export const testService = new TestService();
