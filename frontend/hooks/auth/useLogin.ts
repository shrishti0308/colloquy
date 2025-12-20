import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import { IAuthResponse, ILoginData } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: ILoginData) => authService.login(data),
    onSuccess: (data: IAuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
    },
  });
};
