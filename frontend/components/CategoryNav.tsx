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
              className={`nav-underline text-xs font-bold tracking-wide ${
                currentCategory === c.id
                  ? "nav-underline-active text-ink-900 dark:text-white"
                  : "text-steel-500 hover:text-ink-900 dark:text-steel-400 dark:hover:text-white"
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
            <div
              className={`nav-underline flex items-center gap-1 ${
                isActive || isOpen ? "nav-underline-active" : ""
              }`}
            >
              <Link
                href={`/?category=${c.id}`}
                className={`text-xs font-bold tracking-wide transition-colors ${
                  isActive
                    ? "text-ink-900 dark:text-white"
                    : "text-steel-500 hover:text-ink-900 dark:text-steel-400 dark:hover:text-white"
                }`}
              >
                {c.label}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(isOpen ? null : c.id);
                }}
                className={`rounded p-1 transition-colors ${
                  isActive
                    ? "text-ink-900 dark:text-white"
                    : "text-steel-500 hover:text-ink-900 dark:text-steel-400 dark:hover:text-white"
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
              <div className="absolute top-full left-0 z-50 mt-3 max-h-[400px] min-w-[260px] overflow-y-auto rounded-lg border border-steel-200 bg-white py-2 shadow-card dark:border-white/10 dark:bg-ink-900">
                <div className="mb-1 border-b border-steel-100 px-4 py-2 dark:border-white/10">
                  <p className="text-xs font-bold tracking-wide text-steel-500 dark:text-steel-400">
                    {c.label} — {c.items.length} procesos
                  </p>
                </div>
                {c.items.map((election) => (
                  <Link
                    key={election.id}
                    href={`/election/${election.id}`}
                    onClick={() => setOpenDropdown(null)}
                    className="group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-steel-50 dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-0.5 rounded-full ${election.is_active ? "bg-accent-500" : "bg-steel-200 dark:bg-white/15"}`} />
                      <span className="font-medium text-steel-700 group-hover:text-ink-900 dark:text-steel-300 dark:group-hover:text-white">
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
                      className="text-steel-400 transition-all group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
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
