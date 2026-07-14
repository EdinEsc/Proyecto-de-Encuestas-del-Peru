"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegionSelector() {
  const [regions, setRegions] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const currentRegion = searchParams.get("region") || "";

  useEffect(() => {
    api<any[]>("/regions").then(d => setRegions(d || [])).catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Link 
        href={`/?type=${type}`} 
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!currentRegion ? 'bg-primary text-white' : 'bg-ink-200 text-ink-600 hover:bg-ink-300 dark:bg-ink-800 dark:text-ink-400'}`}
      >
        Nacional
      </Link>
      {regions.map(r => (
        <Link 
          key={r.id} 
          href={`/?type=${type}&region=${r.name}`} 
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${currentRegion === r.name ? 'bg-primary text-white' : 'bg-ink-200 text-ink-600 hover:bg-ink-300 dark:bg-ink-800 dark:text-ink-400'}`}
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}
