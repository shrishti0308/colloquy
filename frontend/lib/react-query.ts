import { QUERY_CONFIG } from "@/config/constants";
import { DefaultOptions, QueryClient } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: QUERY_CONFIG.STALE_TIME,
    gcTime: QUERY_CONFIG.CACHE_TIME,
    retry: QUERY_CONFIG.RETRY,
    retryDelay: QUERY_CONFIG.RETRY_DELAY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query Keys Factory for type safety and consistency
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
    deleted: () => [...queryKeys.users.all, "deleted"] as const,
  },
} as const;
