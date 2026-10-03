import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "parkSafe — Smart Public Parking Discovery | Chennai",
  description: "Find nearby public parking for two-wheelers and four-wheelers across Chennai, check live availability, and navigate directly to your space.",
  keywords: ["Chennai parking", "public parking Chennai", "parkSafe", "two-wheeler parking", "car parking Chennai", "Anna Nagar parking", "T Nagar parking"],
  authors: [{ name: "parkSafe Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
