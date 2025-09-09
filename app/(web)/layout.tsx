import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "../providers";

import { siteConfig } from "@/config/site";
import { fontFilson, fontRunalto } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="cs">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontRunalto.variable,
          fontFilson.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col min-h-screen ">
            <Navbar />
            <main className="w-full">{children}</main>
            <footer className="w-full flex items-center justify-center py-8 ">
              <Link
                isExternal
                className="flex items-center gap-1 text-current text-tiny"
                href="https://nevlud.com"
                title="NEVLUD Industries"
              >
                <span className="text pe-1">Made by</span>
                <img
                  alt="nevlud.com logo"
                  height={2}
                  src="/loga/nevlud.png"
                  width={120}
                />
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
