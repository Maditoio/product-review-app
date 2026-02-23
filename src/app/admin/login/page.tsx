import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = (await getServerSession(authOptions as never)) as { user?: { email?: string | null } } | null;

  if (session?.user?.email) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="page-wrap py-8">
      <LoginForm />
    </main>
  );
}
