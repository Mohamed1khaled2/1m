import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata = { robots: { index: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="money-glow flex flex-1 items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-black">الأدمن</h1>
        <LoginForm />
      </div>
    </main>
  );
}
