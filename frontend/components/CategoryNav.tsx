"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Election = {
  id: string;
  title: string;
  election_type?: string;
  region_name?: string;
  is_active: boolean;
};

type DropdownCategory = {
  id: string;
  label: string;
  hasDropdown: boolean;
  items?: Election[];
};

export default function CategoryNav({
  categories,
  currentCategory,
  elections,
}: {
  categories: DropdownCategory[];
  currentCategory: string;
  elections: Election[];
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="flex flex-wrap gap-6 items-center">
      {categories.map((c) => {
        if (!c.hasDropdown) {
          return (
            <Link
              key={c.id}
              href={`/?category=${c.id}`}
              className={`text-xs font-bold tracking-wide transition-colors ${
                currentCategory === c.id
                  ? "text-black underline underline-offset-8"
                  : "text-ink-600 hover:text-black"
              }`}
            >
              {c.label}
            </Link>
          );
        }

        // Dropdown category
        const isOpen = openDropdown === c.id;
        const isActive = currentCategory === c.id;

        return (
          <div key={c.id} className="relative">
            <div className="flex items-center gap-1">
              <Link
                href={`/?category=${c.id}`}
                className={`text-xs font-bold tracking-wide transition-colors ${
                  isActive
                    ? "text-black underline underline-offset-8"
                    : "text-ink-600 hover:text-black"
                }`}
              >
                {c.label}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(isOpen ? null : c.id);
                }}
                className={`p-1 rounded transition-all ${
                  isActive ? "text-black" : "text-ink-600 hover:text-black"
                }`}
                aria-label={`Expandir ${c.label}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {isOpen && c.items && c.items.length > 0 && (
              <div className="absolute top-full left-0 mt-3 bg-white border border-ink-200 shadow-lg rounded-lg py-2 z-50 min-w-[260px] max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2 border-b border-ink-100 mb-1">
                  <p className="text-xs font-bold tracking-wide text-ink-500">
                    {c.label} — {c.items.length} procesos
                  </p>
                </div>
                {c.items.map((election) => (
                  <Link
                    key={election.id}
                    href={`/election/${election.id}`}
                    onClick={() => setOpenDropdown(null)}
                    className="rounded-xl flex items-center justify-between px-4 py-2.5 text-sm hover:bg-ink-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-0.5 h-3 ${election.is_active ? "bg-black" : "bg-ink-100"}`} />
                      <span className="font-medium text-ink-700 group-hover:text-black">
                        {election.region_name || election.title}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-ink-400 group-hover:text-black group-hover:translate-x-1 transition-all"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
