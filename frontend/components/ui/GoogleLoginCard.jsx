import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

// Google Icon
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      style={{
        width: "18px",
        height: "18px",
        flexShrink: 0,
        display: "block",
      }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function GoogleLoginCard() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const isLoading = useAuthStore((s) => s.isLoading);
  const errorMessage = useAuthStore((s) => s.error);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    await loginWithGoogle();
  };

  return (
    <main className="flex min-h-svh items-center justify-center p-2 bg-background">
      <Card className="w-full max-w-sm p-2.5 rounded-xl border shadow-sm">
        {/* Header */}
        <CardHeader className="gap-1 px-5 text-center">
          <CardTitle className="text-lg font-semibold leading-tight tracking-tight">
            Welcome back
          </CardTitle>

          <CardDescription className="text-xs leading-4">
            Sign in to your account to continue.
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-2.5 px-5">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full cursor-pointer gap-2.5 rounded-lg text-sm font-medium"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </Button>

          {/* Error Message */}
          {errorMessage && (
            <p
              role="alert"
              aria-live="polite"
              className="text-center text-xs text-destructive"
            >
              {errorMessage}
            </p>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <p className="text-center text-[10px] leading-4 text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="whitespace-nowrap font-medium underline underline-offset-2 hover:text-foreground"
            >
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="whitespace-nowrap font-medium underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </Card>
    </main>
  );
}
