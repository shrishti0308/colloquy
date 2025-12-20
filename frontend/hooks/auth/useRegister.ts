import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import { IAuthResponse, IRegisterData } from "@/types/auth.types";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: IRegisterData) => authService.register(data),
    onSuccess: (data: IAuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
    },
  });
};
