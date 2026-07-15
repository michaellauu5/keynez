import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
interface AuthorizationDetails {
  client?: { name?: string; client_id?: string; redirect_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
}
interface OAuthApi {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
}
const oauthApi = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const { user, isLoading: authLoading } = useAuth();

  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Inline sign-in form state (used when the visitor is not signed in).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!authorizationId) {
      setError("Missing authorization_id");
      setLoadingDetails(false);
      return;
    }
    if (authLoading || !user) return;
    let active = true;
    (async () => {
      const { data, error } = await oauthApi.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        setLoadingDetails(false);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
      setLoadingDetails(false);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, authLoading, user]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauthApi.approveAuthorization(authorizationId)
      : await oauthApi.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError(null);
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSigningIn(false);
    if (error) setSignInError(error.message);
  }

  async function handleGoogleSignIn() {
    setSignInError(null);
    // Return to this exact consent URL after Google round-trip.
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) setSignInError(result.error.message);
  }

  const shell = (children: React.ReactNode) => (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        {children}
      </div>
    </main>
  );

  if (error) {
    return shell(
      <>
        <h1 className="text-xl font-semibold mb-2">Authorization error</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </>,
    );
  }

  if (authLoading) {
    return shell(
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>,
    );
  }

  if (!user) {
    return shell(
      <>
        <h1 className="text-xl font-semibold mb-1">Sign in to continue</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to your Keynez account to authorize this connection.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4"
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>
        <div className="relative my-4 text-center text-xs text-muted-foreground">
          <span className="bg-card px-2 relative z-10">or</span>
          <div className="absolute inset-x-0 top-1/2 border-t" />
        </div>
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <Label htmlFor="oauth-email">Email</Label>
            <Input
              id="oauth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="oauth-password">Password</Label>
            <Input
              id="oauth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {signInError && (
            <p className="text-sm text-destructive">{signInError}</p>
          )}
          <Button type="submit" className="w-full" disabled={signingIn}>
            {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
      </>,
    );
  }

  if (loadingDetails || !details) {
    return shell(
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading authorization…
      </div>,
    );
  }

  const clientName = details.client?.name ?? "an application";

  return shell(
    <>
      <h1 className="text-xl font-semibold mb-1">
        Connect {clientName} to Keynez
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Signed in as <span className="font-medium">{user.email}</span>. This
        lets {clientName} use Keynez as you.
      </p>
      <ul className="text-sm space-y-1 mb-6 list-disc list-inside text-muted-foreground">
        <li>Share your basic profile and email</li>
        <li>Call Keynez's enabled tools while you are signed in</li>
      </ul>
      <p className="text-xs text-muted-foreground mb-6">
        This does not bypass Keynez's permissions or backend policies.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={() => decide(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={busy}
          onClick={() => decide(true)}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
        </Button>
      </div>
    </>,
  );
}