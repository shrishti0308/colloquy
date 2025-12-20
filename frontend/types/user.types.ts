export enum UserRole {
  USER = "user",
  INTERVIEWER = "interviewer",
  ADMIN = "admin",
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateUserProfile {
  name?: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}
