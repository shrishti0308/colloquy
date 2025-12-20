import { userService } from "@/services/user.service";
import { IChangePassword } from "@/types/user.types";
import { useMutation } from "@tanstack/react-query";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: IChangePassword) => userService.changePassword(data),
  });
};
