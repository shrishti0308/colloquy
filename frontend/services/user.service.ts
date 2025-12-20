import { axiosInstance } from "@/lib/api/axios";
import { ApiSuccessResponse } from "@/types/api.types";
import { IChangePassword, IUpdateUserProfile, IUser } from "@/types/user.types";

export const userService = {
  // Get current user profile
  getMyProfile: async (): Promise<IUser> => {
    const response = await axiosInstance.get<ApiSuccessResponse<IUser>>(
      "/users/me"
    );
    return response.data.data;
  },

  // Update current user profile
  updateMyProfile: async (data: IUpdateUserProfile): Promise<IUser> => {
    const response = await axiosInstance.put<ApiSuccessResponse<IUser>>(
      "/users/me",
      data
    );
    return response.data.data;
  },

  // Change password
  changePassword: async (data: IChangePassword): Promise<void> => {
    await axiosInstance.put("/users/me/password", data);
  },

  // Delete my account
  deleteMyAccount: async (): Promise<void> => {
    await axiosInstance.delete("/users/me");
  },

  // Admin: Get all users
  getAllUsers: async (): Promise<IUser[]> => {
    const response = await axiosInstance.get<ApiSuccessResponse<IUser[]>>(
      "/users"
    );
    return response.data.data;
  },

  // Admin: Get user by ID
  getUserById: async (id: string): Promise<IUser> => {
    const response = await axiosInstance.get<ApiSuccessResponse<IUser>>(
      `/users/${id}`
    );
    return response.data.data;
  },

  // Admin: Update user
  updateUser: async (id: string, data: Partial<IUser>): Promise<IUser> => {
    const response = await axiosInstance.put<ApiSuccessResponse<IUser>>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  },

  // Admin: Delete user
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  // Admin: Restore deleted user
  restoreUser: async (id: string): Promise<IUser> => {
    const response = await axiosInstance.put<ApiSuccessResponse<IUser>>(
      `/users/${id}/restore`
    );
    return response.data.data;
  },

  // Admin: Get deleted users
  getDeletedUsers: async (): Promise<IUser[]> => {
    const response = await axiosInstance.get<ApiSuccessResponse<IUser[]>>(
      "/users/deleted"
    );
    return response.data.data;
  },
};
