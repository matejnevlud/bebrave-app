import "@/styles/globals.css";
import {Metadata, Viewport} from "next";
import {Link} from "@heroui/link";
import clsx from "clsx";

import {Providers} from "../providers";

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
                    <main className="relative flex min-h-screen flex-col bg-background bg-radial">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
