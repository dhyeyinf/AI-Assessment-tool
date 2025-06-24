// services/auth.service.ts
import axiosInstance from '../utils/axiosConfig'; // use your axios instance with interceptors
import { ApiHandler, axiosWrapper } from "../utils/api-handler";

export const authService = {
    logout: async (refreshToken: string) => {
        return ApiHandler.handle(() =>
            axiosWrapper(
                axiosInstance.post('/api/logout/', { refresh: refreshToken })
            )
        );
    },

    deleteUser: async () => {
        return ApiHandler.handle(() =>
            axiosWrapper(
                axiosInstance.delete('/api/delete-user/')
            )
        );
    }
};

// export const authService = {
//     logout: async () => {
//         const refreshToken = localStorage.getItem('refresh');
//         const response: any = ApiHandler.handle<any>(() =>
//             axiosWrapper(
//                 axiosInstance.post('/api/logout/', { refresh: refreshToken })
//             ),
//             {
//                 showErrorMessage: true
//             }
//         );

//         if(response.error) {
//             return { error: response.error };
//         }
        
//         if (response.success) {
//         localStorage.removeItem('access');
//         localStorage.removeItem('refresh');}
//         return response
//     }
// };
