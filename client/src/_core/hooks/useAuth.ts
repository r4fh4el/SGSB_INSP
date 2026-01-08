import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const isOfflineAuth =
    typeof import.meta !== "undefined" &&
    import.meta.env.VITE_OFFLINE_AUTH === "true";

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !isOfflineAuth,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (isOfflineAuth) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("manus-runtime-user-info");
      }
      utils.auth.me.setData(undefined, null);
      return;
    }
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [isOfflineAuth, logoutMutation, utils]);

  const state = useMemo(() => {
    const userData =
      isOfflineAuth && !meQuery.data
        ? {
            id: "offline",
            name: "Usuário Offline",
            email: null,
            role: "inspetor" as const,
          }
        : meQuery.data ?? null;
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(userData)
      );
    }
    return {
      user: userData,
      loading: isOfflineAuth
        ? false
        : meQuery.isLoading || logoutMutation.isPending,
      error: isOfflineAuth
        ? null
        : meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    isOfflineAuth,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (isOfflineAuth) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    isOfflineAuth,
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
