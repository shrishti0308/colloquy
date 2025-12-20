import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import { IAuthResponse, IResetPasswordData } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: IResetPasswordData) => authService.resetPassword(data),
    onSuccess: (data: IAuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
    },
  });
};
