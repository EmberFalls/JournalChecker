"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogo } from "../components/logos/AuthorityLogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const initialQuery = searchParams.get("q") || "";

  const { login, registerAccount, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const target = initialQuery ? `${redirectPath}?q=${encodeURIComponent(initialQuery)}` : redirectPath;

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push(target);
  }

  // Real Google OAuth via @react-oauth/google
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push(target);
      } catch {
        setError("Google authentication failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google authentication was cancelled or failed.");
    },
  });

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, name);
      router.push(target);
    } catch {
      setError("Sign-in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await registerAccount(email, password, name, institution);
      router.push(target);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl w-full rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
      {/* Left Column — Hero Image & Brand Narrative */}
      <div className="relative bg-[url('/hero-gradient-bg.jpg')] bg-cover bg-center p-8 sm:p-10 flex flex-col justify-between text-slate-900 border-r border-slate-100">
        <div className="relative z-10">
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-slate-900 text-base mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
              <Shield className="h-4 w-4 text-blue-400" />
            </div>
            <span className="tracking-tight">Journal Integrity</span>
          </Link>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-snug mb-4">
            Traceable Scholarly Integrity Verification
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-normal mb-8">
            Access conservative multi-registry analysis across DOAJ, Scopus, Web of Science, and Crossref.
          </p>

          <ul className="space-y-3 text-xs font-medium text-slate-800">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              Zero hallucinations — evidence directly from official registries
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              Persistent search history & audit-ready reports
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              7-dimension transparency scorecards
            </li>
          </ul>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-900/10 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>© 2026 Journal Integrity</span>
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-slate-500" /> Secure SSL Verification
          </span>
        </div>
      </div>

      {/* Right Column — Auth Form (Shadcn Tabs) */}
      <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          {/* Error Message */}
          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => googleLogin()}
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-medium border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2.5 mb-5 shadow-sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo className="h-4 w-4" />}
            Continue with Google
          </Button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or email
            </span>
          </div>

          {/* Sign In Tab Content */}
          <TabsContent value="signin" className="mt-0 space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Institutional / Academic Email
                </label>
                <Input
                  type="email"
                  placeholder="alex.vance@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-[11px] text-blue-600 hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Signing in…</> : "Sign In to Dashboard"}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up Tab Content */}
          <TabsContent value="signup" className="mt-0 space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                <Input
                  type="text"
                  placeholder="Dr. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Institutional Email</label>
                <Input
                  type="email"
                  placeholder="alex.vance@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Institution / Department</label>
                <Input
                  type="text"
                  placeholder="Stanford University — Biomedical Data"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Creating Account…</> : "Create Researcher Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-slate-100/80 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm transition-all"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>
      <Suspense fallback={<div className="text-xs font-medium text-slate-400">Loading authentication interface…</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
