import { queryKeys } from "@/lib/react-query";
import { tokenStorage } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.getMe(),
    enabled: !!tokenStorage.getAccessToken(), // Only run if token exists
    retry: false,
  });
};
