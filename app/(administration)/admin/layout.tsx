"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@heroui/button";

import Sidebar from "@/components/admin/sidebar";
import { items } from "@/app/(administration)/admin/sidebar-items";
import { Logo } from "@/components/icons";
import {
  isAuthenticated,
  clearAuthSession,
  isSuperAdmin,
  verifyAdminSession,
} from "@/lib/auth";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pathname === "/admin/login") return;

    if (!isAuthenticated()) {
      router.push("/admin/login");

      return;
    }

    // The server session cookie expires after 12h while the localStorage flag
    // does not, so re-check it to avoid a signed-in UI that gets 403s.
    verifyAdminSession().then((valid) => {
      if (!valid) router.push("/admin/login");
    });
  }, [mounted, pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    clearAuthSession();
    router.push("/admin/login");
  };

  // Don't render the sidebar layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading or redirect if not authenticated and not on login page
  if (!mounted || (!isAuthenticated() && pathname !== "/admin/login")) {
    return <div>Loading...</div>;
  }

  return (
    <section className="flex items-center h-screen justify-start max-h-screen">
      <div className="h-full min-h-[48rem] w-56 fixed">
        <div className="h-full w-56 border-r-small border-divider p-3 flex-col flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <Logo color={"black"} width={"100%"} />
          </div>

          {isSuperAdmin() && <Sidebar defaultSelectedKey="" items={items} />}

          <div className="w-full flex flex-col items-center gap-3">
            <Button
              className="w-full"
              color="danger"
              size="sm"
              variant="light"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Link
              isExternal
              className="flex items-center gap-1 text-current text-tiny"
              href="https://nevlud.com"
              title="NEVLUD Industries"
            >
              <span className="text pe-1">Made by</span>
              <img
                alt="nevlud.com logo"
                height={1}
                src="/loga/nevlud.png"
                width={120}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full h-full p-12 ml-56">{children}</div>
    </section>
  );
}
