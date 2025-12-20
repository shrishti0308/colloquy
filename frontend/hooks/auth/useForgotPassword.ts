import { authService } from "@/services/auth.service";
import { IForgotPasswordData } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: IForgotPasswordData) => authService.forgotPassword(data),
  });
};
