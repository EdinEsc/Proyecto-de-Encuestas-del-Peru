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
    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
      <Link 
        href={`/?type=${type}`} 
        className={`text-xs font-bold tracking-wide transition-all ${!currentRegion ? 'text-black underline underline-offset-4' : 'text-ink-400 hover:text-black'}`}
      >
        Nacional
      </Link>
      {regions.map(r => (
        <Link 
          key={r.id} 
          href={`/?type=${type}&region=${r.name}`} 
          className={`text-xs font-bold tracking-wide transition-all ${currentRegion === r.name ? 'text-black underline underline-offset-4' : 'text-ink-400 hover:text-black'}`}
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}

