"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsLoading(false);

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <section className="card mx-auto w-full max-w-sm p-4">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-[#2563EB]" />
        <h1 className="text-[20px] font-semibold text-[#111827]">Admin Login</h1>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}

        <button type="button" className="btn-primary" disabled={isLoading} onClick={onSubmit}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </section>
  );
}
