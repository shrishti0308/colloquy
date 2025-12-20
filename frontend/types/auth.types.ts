import { IUser } from "./user.types";

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

export interface IForgotPasswordData {
  email: string;
}

export interface IResetPasswordData {
  token: string;
  newPassword: string;
}

export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: ILoginData) => Promise<IAuthResponse>;
  register: (data: IRegisterData) => Promise<IAuthResponse>;
  logout: () => Promise<void>;
  updateUser: (user: IUser) => void;
}
