"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="كلمة السر"
        className="input text-center text-lg"
      />
      {state.error && <p className="text-center text-sm text-red-400">{state.error}</p>}
      <button className="btn w-full py-3" disabled={pending}>
        {pending ? "ثانية..." : "ادخل"}
      </button>
    </form>
  );
}
