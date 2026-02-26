import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, User } from "../api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuth(redirectIfUnauthenticated = false) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("qp_access_token");
      localStorage.removeItem("qp_user");
    }
    queryClient.setQueryData(["me"], null);
    queryClient.removeQueries({ queryKey: ["me"] });
    router.replace("/login");
  };

  useEffect(() => {
    if (redirectIfUnauthenticated && !isLoading && !user && isError) {
      if (typeof window !== "undefined") {
        // Double check if token exists, if not, definitely redirect
        // If token exists but api failed (401), also redirect
         localStorage.removeItem("qp_access_token");
         localStorage.removeItem("qp_user");
      }
       router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, isError, redirectIfUnauthenticated, router, pathname]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    error,
  };
}
