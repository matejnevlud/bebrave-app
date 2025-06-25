"use client";
import {ScrollShadow} from "@heroui/react";
import Sidebar from "@/components/admin/sidebar";
import {items} from "@/app/(administration)/admin/sidebar-items";
import React from "react";
import {Logo} from "@/components/icons";
import {Link} from "@heroui/link";






export default function BlogLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

    // determine current path
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    // Check if the current path is the home page


    return (
        <section className="flex items-center h-screen justify-start max-h-screen">

            <div className="h-full min-h-[48rem] w-56 fixed">
                <div className="h-full w-56 border-r-small border-divider p-3 flex-col flex items-center justify-between">

                    <div className="flex items-center gap-2 px-2">
                        <Logo width={'100%'} color={'black'}/>
                    </div>


                    <Sidebar defaultSelectedKey="" items={items} />

                    <div className="w-full flex items-center justify-center ">
                        <Link
                            isExternal
                            className="flex items-center gap-1 text-current text-tiny"
                            href="https://nevlud.com"
                            title="NEVLUD Industries"
                        >
                            <span className="text pe-1">Made by</span>
                            <img src="/loga/nevlud.png" alt="nevlud.com logo" height={1} width={120}/>
                        </Link>
                    </div>


                </div>
            </div>

            <div className="w-full h-full p-12 ml-56">
                {children}
            </div>
        </section>
    );
}
