import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSchoolSettings } from "@/lib/settings";
import { Toaster } from "sonner";
import { initializeServer } from "@/lib/server-init";

// Initialize server (cron jobs, etc.)
initializeServer();

// Load Roboto font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
});

export async function generateMetadata() {
  const settings = await getSchoolSettings();
  return {
    title: `${settings.schoolName} - Training Faithful Servants for Gospel Ministry`,
    description: settings.schoolDescription || 'An Institute of Asian Christian Academy of India',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSchoolSettings();

  return (
    <html lang="en" className="light">
      <head>
      </head>
      <body
        className={`${roboto.variable} font-[family-name:var(--font-roboto)] min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
