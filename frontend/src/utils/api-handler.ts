import { message } from "antd";
import type { AxiosResponse } from "axios";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

interface ApiHandlerOptions {
    successMessage?: string;
    errorMessage?: string;
    showSuccessMessage?: boolean;
    showErrorMessage?: boolean;
    allowEmptyResponse?: boolean;
    ignoreAuthErrors?: boolean;
}

export class ApiHandler {
    static async handle<T, R = T extends void ? void : T>(
        apiCall: () => Promise<ApiResponse<T>>,
        options: ApiHandlerOptions = {}
    ): Promise<R> {
        const {
            successMessage,
            errorMessage,
            showSuccessMessage = true,
            showErrorMessage = true,
            allowEmptyResponse = false,
            ignoreAuthErrors = false,
        } = options;

        try {
            const response = await apiCall();

            if (!response) {
                throw new Error("No response received from server");
            }

            if (!response.success) {
                throw new Error(response.error || "Operation failed");
            }

            if (showSuccessMessage && (successMessage || response.message)) {
                message.success(successMessage || response.message);
            }

            if (!allowEmptyResponse && response.data === undefined) {
                throw new Error("Response is missing required data");
            }

            return response.data as R;
        } catch (error: any) {
            console.error("ApiHandler error:", error);

            const isAuthError = error.message?.toLowerCase().includes("not authenticated") ||
                error.message?.toLowerCase().includes("unauthorized") ||
                error.message?.toLowerCase().includes("session expired");

            const shouldShowError = showErrorMessage && !(isAuthError && ignoreAuthErrors);

            if (shouldShowError) {
                message.error(errorMessage || error.message || "An unexpected error occurred");
            }

            throw error;
        }
    }
}

export function axiosWrapper<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    return request
        .then((res: any) => ({
            success: true,
            data: res.data,
            message: res.data?.message,
        }))
        .catch((err) => {
            console.error("AxiosWrapper error:", err);
            return {
                success: false,
                error:
                    err.response?.data?.error ||
                    err.response?.data?.detail || // DRF-style error
                    err.message ||
                    "Unknown error",
            };
        });
}
