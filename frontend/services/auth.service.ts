import { axiosInstance } from "@/lib/api/axios";
import { ApiSuccessResponse } from "@/types/api.types";
import {
  IAuthResponse,
  IForgotPasswordData,
  ILoginData,
  IRegisterData,
  IResetPasswordData,
} from "@/types/auth.types";
import { IUser } from "@/types/user.types";

export const authService = {
  // Register new user
  register: async (data: IRegisterData): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<
      ApiSuccessResponse<IAuthResponse>
    >("/auth/register", data);
    return response.data.data;
  },

  // Login user
  login: async (data: ILoginData): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<
      ApiSuccessResponse<IAuthResponse>
    >("/auth/login", data);
    return response.data.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  // Get current user (me)
  getMe: async (): Promise<IUser> => {
    const response = await axiosInstance.get<ApiSuccessResponse<IUser>>(
      "/users/me"
    );
    return response.data.data;
  },

  // Forgot password
  forgotPassword: async (data: IForgotPasswordData): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", data);
  },

  // Reset password
  resetPassword: async (data: IResetPasswordData): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<
      ApiSuccessResponse<IAuthResponse>
    >("/auth/reset-password", data);
    return response.data.data;
  },
};
