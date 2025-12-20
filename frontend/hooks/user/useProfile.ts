import { queryKeys } from "@/lib/react-query";
import { tokenStorage } from "@/lib/token-storage";
import { userService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => userService.getMyProfile(),
    enabled: !!tokenStorage.getAccessToken(),
    retry: false,
  });
};
