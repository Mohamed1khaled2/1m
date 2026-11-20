import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin";

/**
 * دخول الأدمن بكلمة سر واحدة (ADMIN_PASSWORD). الكوكي فيها HMAC من كلمة السر مش كلمة السر نفسها،
 * فلو حد شافها مايعرفش يطلّع منها الباسورد، ولو غيّرت الباسورد كل الجلسات القديمة بتقع.
 */
function token(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD مش متحط");
  return createHmac("sha256", secret).update("1m-admin").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordMatches(input: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  return !!secret && same(input, secret);
}

export async function signIn() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return !!value && same(value, token());
}

/** لكل صفحة وكل action في الأدمن. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
