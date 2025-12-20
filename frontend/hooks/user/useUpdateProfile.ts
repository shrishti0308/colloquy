import { queryKeys } from "@/lib/react-query";
import { userService } from "@/services/user.service";
import { IUpdateUserProfile } from "@/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserProfile) => userService.updateMyProfile(data),
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
    },
  });
};
