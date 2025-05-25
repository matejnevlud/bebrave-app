import "@/styles/globals.css";
import {Metadata, Viewport} from "next";
import {Link} from "@heroui/link";
import clsx from "clsx";

import {Providers} from "./providers";

import {siteConfig} from "@/config/site";
import {fontFilson, fontRunalto} from "@/config/fonts";
import {Navbar} from "@/components/navbar";

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "white"},
        {media: "(prefers-color-scheme: dark)", color: "black"},
    ],
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en">
        <head/>
        <body
            className={clsx(
                "min-h-screen text-foreground bg-background font-sans antialiased",
                fontRunalto.variable, fontFilson.variable
            )}
        >

        <Providers themeProps={{attribute: "class", defaultTheme: "light"}}>
            <div className="relative flex flex-col min-h-screen">
                <Navbar/>
                <main className="container mx-auto max-w-7xl pt-0 px-6 flex-1">
                    {children}
                </main>
                <footer className="w-full flex items-center justify-center py-8">
                    <Link
                        isExternal
                        className="flex items-center gap-1 text-current"
                        href="https://nevlud.com"
                        title="NEVLUD Industries"
                    >
                        <span className="text pe-1">Made by</span>
                        <img src="/loga/nevlud.png" alt="heroui.com logo" height={2} width={150}/>
                    </Link>
                </footer>
            </div>
        </Providers>
        </body>
        </html>
    );
}
