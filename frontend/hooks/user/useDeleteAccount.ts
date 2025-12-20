import { tokenStorage } from "@/lib/token-storage";
import { userService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteMyAccount(),
    onSuccess: () => {
      tokenStorage.clearAll();
      queryClient.clear();
    },
  });
};
