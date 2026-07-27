"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Election } from "@/lib/api";

export default function LayoutContent({ children, elections }: { children: React.ReactNode; elections: Election[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMinimal = pathname.startsWith("/vote/") || searchParams.get("minimal") === "true";

  if (isMinimal) {
    // Minimal layout - no header, no footer, no navigation
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-20 bg-white dark:bg-slate-950" />}>
        <Header elections={elections} />
      </Suspense>
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
