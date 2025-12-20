import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      tokenStorage.clearAll();
      queryClient.clear(); // Clear all cached queries
    },
    onError: () => {
      // Clear tokens even if logout fails
      tokenStorage.clearAll();
      queryClient.clear();
    },
  });
};
