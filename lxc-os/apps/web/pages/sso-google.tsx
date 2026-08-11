import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function SSOGoogle() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { redirect_uri } = router.query;

  useEffect(() => {
    if (status === "loading" || !router.isReady) return;

    if (status === "unauthenticated") {
      // Initiate Google sign in, callback back to this same SSO page
      signIn("google", {
        callbackUrl: window.location.href,
      });
      return;
    }

    if (status === "authenticated" && session?.user && redirect_uri) {
      const fetchToken = async () => {
        try {
          const res = await fetch("/api/auth/sso-token");
          const data = await res.json();
          if (data.accessToken && data.user) {
            const redirectUrl = new URL(redirect_uri as string);
            redirectUrl.searchParams.set("token", data.accessToken);
            redirectUrl.searchParams.set("user", JSON.stringify(data.user));
            window.location.href = redirectUrl.toString();
          } else {
            console.error("SSO Token generation returned invalid data");
          }
        } catch (err) {
          console.error("SSO Token fetch failed:", err);
        }
      };

      fetchToken();
    }
  }, [status, session, redirect_uri, router.isReady]);

  return (
    <div className="min-h-screen bg-[#0C1018] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-[#0057C8] border-t-transparent rounded-full mx-auto" />
        <p className="text-sm font-semibold">Authorizing with Google...</p>
      </div>
    </div>
  );
}
