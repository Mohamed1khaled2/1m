import type { Metadata, Viewport } from "next";
import { Aref_Ruqaa, Cairo } from "next/font/google";
import { CREATOR } from "@/lib/creator";
import { siteUrl } from "@/lib/year";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
});

// خط الإيد اللي بيتكتب بيه في الدفتر
const ruqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: `${CREATOR.name}، ${CREATOR.age} سنة، معاه ${CREATOR.start / 1000} ألف وهيحوّلهم مليون`,
  description: CREATOR.tagline,
  openGraph: { locale: "ar_EG", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0a0d0b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${ruqaa.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
